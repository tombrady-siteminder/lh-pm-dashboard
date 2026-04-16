import { NextResponse } from 'next/server'
import { runQuery, isConfigured } from '@/lib/snowflake'
import { mockSummary } from '@/lib/mock'

export const runtime = 'nodejs'
export const revalidate = 300 // 5 min cache

export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json({ ...mockSummary, isMock: true })
  }

  try {
    // Current snapshot from MART_ACTIVE_CUSTOMERS
    const [snap] = await runQuery<{
      ACTIVE_CUSTOMERS: number
      NET_MRR: number
      PESI_COUNT: number
      LEGACY_COUNT: number
    }>(`
      SELECT
        COUNT(*) AS ACTIVE_CUSTOMERS,
        ROUND(SUM(NET_MRR), 0) AS NET_MRR,
        SUM(CASE WHEN LH_PLATFORM_F = 1 THEN 1 ELSE 0 END) AS PESI_COUNT,
        SUM(CASE WHEN LH_PLATFORM_F = 0 OR LH_PLATFORM_F IS NULL THEN 1 ELSE 0 END) AS LEGACY_COUNT
      FROM EDMA_STRATOPS.MART_ACTIVE_CUSTOMERS
      WHERE BRAND_SEGMENT = 'LH'
    `)

    // Last 2 months of churn for current + prior period comparison
    const churnRows = await runQuery<{
      AS_OF_MONTH: string
      BASE_START: number
      CHURNED_3M: number
      NEW_3M: number
      MRR_START: number
      MRR_END: number
    }>(`
      SELECT
        AS_OF_MONTH,
        SUM(TOTAL_CUSTOMER_BASE_STARTING) AS BASE_START,
        SUM(TOTAL_ROLLING_3M_CHURN) AS CHURNED_3M,
        SUM(TOTAL_ROLLING_3M_NEW) AS NEW_3M,
        ROUND(SUM(TOTAL_MRR_STARTING), 0) AS MRR_START,
        ROUND(SUM(TOTAL_MRR_ENDING), 0) AS MRR_END
      FROM EDMA_STRATOPS.REPORTING_LAYER_ROLLING_CHURN_VIEW
      WHERE BRAND_SEGMENT = 'LH'
        AND AS_OF_MONTH >= DATEADD('month', -2, DATE_TRUNC('month', CURRENT_DATE))
      GROUP BY 1
      ORDER BY 1 DESC
      LIMIT 2
    `)

    const current = churnRows[0]
    const prev = churnRows[1]

    const churnRate = current
      ? (current.CHURNED_3M / (3 * current.BASE_START)) * 100
      : 0
    const churnRatePrev = prev
      ? (prev.CHURNED_3M / (3 * prev.BASE_START)) * 100
      : 0

    return NextResponse.json({
      activeCustomers: snap?.ACTIVE_CUSTOMERS ?? 0,
      activeCustomersPrev: prev ? prev.BASE_START : 0,
      netMrr: snap?.NET_MRR ?? 0,
      netMrrPrev: current?.MRR_START ?? 0,
      monthlyChurnRate: Math.round(churnRate * 100) / 100,
      monthlyChurnRatePrev: Math.round(churnRatePrev * 100) / 100,
      pesiCount: snap?.PESI_COUNT ?? 0,
      legacyCount: snap?.LEGACY_COUNT ?? 0,
      asOfMonth: current?.AS_OF_MONTH ?? null,
      isMock: false,
    })
  } catch (err) {
    console.error('[/api/summary]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
