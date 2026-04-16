import { NextResponse } from 'next/server'
import { runQuery, isConfigured } from '@/lib/snowflake'
import { mockFeatures } from '@/lib/mock'

export const runtime = 'nodejs'
export const revalidate = 300

export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json({ ...mockFeatures, isMock: true })
  }

  try {
    const [row] = await runQuery<Record<string, number>>(`
      SELECT
        COUNT(*) AS TOTAL,
        SUM(HAS_PAY_PRODUCT) AS PAY,
        SUM(HAS_DEMAND_PLUS_PRODUCT) AS DEMAND_PLUS,
        SUM(HAS_DEMAND_BE_PRODUCT) AS DEMAND_BE,
        SUM(HAS_GDS_PRODUCT) AS GDS,
        SUM(HAS_MP_PRODUCT) AS MULTI_PROPERTY,
        SUM(HAS_DR_PLUS_PRODUCT) AS DR_PLUS,
        SUM(HAS_CHANNELS_PLUS_PRODUCT) AS CHANNELS_PLUS,
        SUM(HAS_WEBSITE_BUILDER_PRODUCT) AS WEBSITE_BUILDER,
        SUM(HAS_GUESTJOY_PRODUCT) AS GUESTJOY,
        SUM(HAS_DB_PRODUCT) AS DIRECT_BOOKING,
        SUM(HAS_INS_PRODUCT) AS INSIGHTS,
        SUM(HAS_LHB_ASSET) AS LHBE
      FROM EDMA_STRATOPS.MART_ACTIVE_CUSTOMERS
      WHERE BRAND_SEGMENT = 'LH'
    `)

    const total = row?.TOTAL ?? 0
    const features = [
      { name: 'SiteMinder Pay', count: row?.PAY ?? 0 },
      { name: 'Booking Engine (LHBE)', count: row?.LHBE ?? 0 },
      { name: 'Demand Plus', count: Math.max(row?.DEMAND_PLUS ?? 0, row?.DEMAND_BE ?? 0) },
      { name: 'DR+', count: row?.DR_PLUS ?? 0 },
      { name: 'Insights', count: row?.INSIGHTS ?? 0 },
      { name: 'GDS', count: row?.GDS ?? 0 },
      { name: 'Multi-Property', count: row?.MULTI_PROPERTY ?? 0 },
      { name: 'Channels+', count: row?.CHANNELS_PLUS ?? 0 },
      { name: 'Website Builder', count: row?.WEBSITE_BUILDER ?? 0 },
      { name: 'GuestJoy', count: row?.GUESTJOY ?? 0 },
    ]
      .map(f => ({ ...f, pct: total > 0 ? Math.round((f.count / total) * 1000) / 10 : 0 }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({ total, features, isMock: false })
  } catch (err) {
    console.error('[/api/features]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
