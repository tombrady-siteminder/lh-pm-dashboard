import { NextResponse } from 'next/server'
import { runQuery, isConfigured } from '@/lib/snowflake'
import { mockChurnSeries } from '@/lib/mock'

export const runtime = 'nodejs'
export const revalidate = 300

export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json({ series: mockChurnSeries, isMock: true })
  }

  try {
    const rows = await runQuery<{
      AS_OF_MONTH: string
      BASE_START: number
      BASE_END: number
      CHURNED: number
      NEW_CUSTOMERS: number
      MRR_START: number
      MRR_END: number
    }>(`
      SELECT
        TO_VARCHAR(AS_OF_MONTH, 'YYYY-MM') AS AS_OF_MONTH,
        SUM(TOTAL_CUSTOMER_BASE_STARTING) AS BASE_START,
        SUM(TOTAL_CUSTOMER_BASE_ENDING) AS BASE_END,
        SUM(TOTAL_ROLLING_3M_CHURN) AS CHURNED,
        SUM(TOTAL_ROLLING_3M_NEW) AS NEW_CUSTOMERS,
        ROUND(SUM(TOTAL_MRR_STARTING), 0) AS MRR_START,
        ROUND(SUM(TOTAL_MRR_ENDING), 0) AS MRR_END
      FROM EDMA_STRATOPS.REPORTING_LAYER_ROLLING_CHURN_VIEW
      WHERE BRAND_SEGMENT = 'LH'
        AND AS_OF_MONTH >= DATEADD('month', -13, DATE_TRUNC('month', CURRENT_DATE))
      GROUP BY 1
      ORDER BY 1
    `)

    const series = rows.map(r => ({
      month: r.AS_OF_MONTH,
      baseStart: r.BASE_START,
      baseEnd: r.BASE_END,
      churned: r.CHURNED,
      newCustomers: r.NEW_CUSTOMERS,
      mrrStart: r.MRR_START,
      mrrEnd: r.MRR_END,
      monthlyChurnRate: r.BASE_START > 0
        ? Math.round((r.CHURNED / (3 * r.BASE_START)) * 10000) / 100
        : 0,
    }))

    return NextResponse.json({ series, isMock: false })
  } catch (err) {
    console.error('[/api/churn]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
