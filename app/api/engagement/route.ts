import { NextResponse } from 'next/server'
import { runQuery, isConfigured } from '@/lib/snowflake'
import { mockEngagement } from '@/lib/mock'

export const runtime = 'nodejs'
export const revalidate = 300

export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json({ ...mockEngagement, isMock: true })
  }

  try {
    const [row] = await runQuery<{
      TOTAL: number
      ZERO_LOGINS: number
      AVG_LOGIN_DAYS: number
      MOBILE_ACTIVE: number
      AVG_HEALTH_SCORE: number
      AVG_OCCUPANCY_PCT: number
    }>(`
      SELECT
        COUNT(*) AS TOTAL,
        SUM(CASE WHEN N_DAYS_SESSIONS_L30D = 0 THEN 1 ELSE 0 END) AS ZERO_LOGINS,
        ROUND(AVG(N_DAYS_SESSIONS_L30D), 1) AS AVG_LOGIN_DAYS,
        SUM(HEAP_F_MOBILE_SESSIONS_L30D) AS MOBILE_ACTIVE,
        ROUND(AVG(LH_HEALTH_SCORE), 1) AS AVG_HEALTH_SCORE,
        ROUND(AVG(OCCUPANCY_L30D) * 100, 1) AS AVG_OCCUPANCY_PCT
      FROM EDMA_STRATOPS.LH_HEALTH_SCORES
      WHERE BRAND_SEGMENT = 'LH'
    `)

    return NextResponse.json({
      total: row?.TOTAL ?? 0,
      zeroLogins: row?.ZERO_LOGINS ?? 0,
      avgLoginDays: row?.AVG_LOGIN_DAYS ?? 0,
      mobileActive: row?.MOBILE_ACTIVE ?? 0,
      avgHealthScore: row?.AVG_HEALTH_SCORE ?? 0,
      avgOccupancyPct: row?.AVG_OCCUPANCY_PCT ?? 0,
      isMock: false,
    })
  } catch (err) {
    console.error('[/api/engagement]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
