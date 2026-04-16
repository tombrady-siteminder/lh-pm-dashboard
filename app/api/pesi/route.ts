import { NextResponse } from 'next/server'
import { runQuery, isConfigured } from '@/lib/snowflake'
import { mockPesiData } from '@/lib/mock'

export const runtime = 'nodejs'
export const revalidate = 300

export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json({ ...mockPesiData, isMock: true })
  }

  try {
    // Current PESI vs legacy split
    const splitRows = await runQuery<{
      LH_PLATFORM_F: number
      CUSTOMERS: number
      NET_MRR: number
    }>(`
      SELECT
        LH_PLATFORM_F,
        COUNT(*) AS CUSTOMERS,
        ROUND(SUM(NET_MRR), 0) AS NET_MRR
      FROM EDMA_STRATOPS.MART_ACTIVE_CUSTOMERS
      WHERE BRAND_SEGMENT = 'LH'
      GROUP BY 1
    `)

    const pesiRow = splitRows.find(r => r.LH_PLATFORM_F === 1)
    const legacyRow = splitRows.find(r => r.LH_PLATFORM_F === 0)

    // Migration velocity over time
    const velocityRows = await runQuery<{
      MIGRATION_MONTH: string
      MIGRATED: number
    }>(`
      SELECT
        TO_VARCHAR(DATE_TRUNC('month', NXS_PLATFORM_MIGRATED_AT), 'YYYY-MM') AS MIGRATION_MONTH,
        COUNT(*) AS MIGRATED
      FROM EDMA_STRATOPS.MART_ACTIVE_CUSTOMERS
      WHERE BRAND_SEGMENT = 'LH'
        AND NXS_PLATFORM_MIGRATED_AT IS NOT NULL
        AND NXS_PLATFORM_MIGRATED_AT >= DATEADD('month', -18, CURRENT_DATE)
      GROUP BY 1
      ORDER BY 1
    `)

    // PESI vs legacy by region
    const regionRows = await runQuery<{
      REGION: string
      PESI: number
      LEGACY: number
    }>(`
      SELECT
        SF_SALES_REGION AS REGION,
        SUM(CASE WHEN LH_PLATFORM_F = 1 THEN 1 ELSE 0 END) AS PESI,
        SUM(CASE WHEN LH_PLATFORM_F = 0 OR LH_PLATFORM_F IS NULL THEN 1 ELSE 0 END) AS LEGACY
      FROM EDMA_STRATOPS.MART_ACTIVE_CUSTOMERS
      WHERE BRAND_SEGMENT = 'LH'
        AND SF_SALES_REGION IS NOT NULL
      GROUP BY 1
      ORDER BY PESI DESC
    `)

    return NextResponse.json({
      pesiCount: pesiRow?.CUSTOMERS ?? 0,
      legacyCount: legacyRow?.CUSTOMERS ?? 0,
      pesiMrr: pesiRow?.NET_MRR ?? 0,
      legacyMrr: legacyRow?.NET_MRR ?? 0,
      velocity: velocityRows.map(r => ({ month: r.MIGRATION_MONTH, migrated: r.MIGRATED })),
      byRegion: regionRows.map(r => ({ region: r.REGION, pesi: r.PESI, legacy: r.LEGACY })),
      isMock: false,
    })
  } catch (err) {
    console.error('[/api/pesi]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
