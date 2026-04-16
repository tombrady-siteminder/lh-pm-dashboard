// Mock data matching real Snowflake values — used when SNOWFLAKE_* env vars are not set.
// Numbers based on actual data exploration (April 2026).

export const mockSummary = {
  activeCustomers: 14772,
  activeCustomersPrev: 14602,
  netMrr: 2972214,
  netMrrPrev: 2861976,
  monthlyChurnRate: 2.98,
  monthlyChurnRatePrev: 2.89,
  pesiCount: 4255,
  legacyCount: 10517,
  asOfMonth: '2026-03-31',
}

export const mockChurnSeries = [
  { month: '2025-03', baseStart: 13553, baseEnd: 13918, churned: 752,  newCustomers: 1128, mrrStart: 2585692, mrrEnd: 2651262, monthlyChurnRate: 1.85 },
  { month: '2025-04', baseStart: 13637, baseEnd: 14030, churned: 823,  newCustomers: 1222, mrrStart: 2636428, mrrEnd: 2702150, monthlyChurnRate: 2.01 },
  { month: '2025-05', baseStart: 13727, baseEnd: 14137, churned: 808,  newCustomers: 1235, mrrStart: 2638592, mrrEnd: 2701994, monthlyChurnRate: 1.96 },
  { month: '2025-06', baseStart: 13918, baseEnd: 14431, churned: 806,  newCustomers: 1255, mrrStart: 2651262, mrrEnd: 2752729, monthlyChurnRate: 1.93 },
  { month: '2025-07', baseStart: 14030, baseEnd: 14279, churned: 731,  newCustomers: 1290, mrrStart: 2702150, mrrEnd: 2768352, monthlyChurnRate: 1.74 },
  { month: '2025-08', baseStart: 14137, baseEnd: 14411, churned: 1006, newCustomers: 1312, mrrStart: 2701994, mrrEnd: 2808455, monthlyChurnRate: 2.37 },
  { month: '2025-09', baseStart: 14431, baseEnd: 14602, churned: 1033, newCustomers: 1370, mrrStart: 2752729, mrrEnd: 2861976, monthlyChurnRate: 2.39 },
  { month: '2025-10', baseStart: 14279, baseEnd: 14792, churned: 1163, newCustomers: 1380, mrrStart: 2768352, mrrEnd: 2909262, monthlyChurnRate: 2.72 },
  { month: '2025-11', baseStart: 14411, baseEnd: 14942, churned: 1002, newCustomers: 1552, mrrStart: 2808455, mrrEnd: 2933603, monthlyChurnRate: 2.32 },
  { month: '2025-12', baseStart: 14602, baseEnd: 15134, churned: 1065, newCustomers: 1625, mrrStart: 2861976, mrrEnd: 2980710, monthlyChurnRate: 2.43 },
  { month: '2026-01', baseStart: 14792, baseEnd: 15068, churned: 1088, newCustomers: 1650, mrrStart: 2909262, mrrEnd: 3018069, monthlyChurnRate: 2.45 },
  { month: '2026-02', baseStart: 14942, baseEnd: 15214, churned: 1180, newCustomers: 1481, mrrStart: 2933603, mrrEnd: 3047077, monthlyChurnRate: 2.63 },
  { month: '2026-03', baseStart: 15134, baseEnd: 15398, churned: 1206, newCustomers: 1513, mrrStart: 2980710, mrrEnd: 3122264, monthlyChurnRate: 2.66 },
]

export const mockPesiData = {
  pesiCount: 4255,
  legacyCount: 10517,
  velocity: [
    { month: '2025-03', migrated: 1 },
    { month: '2025-10', migrated: 1 },
    { month: '2026-01', migrated: 10 },
    { month: '2026-02', migrated: 8 },
    { month: '2026-03', migrated: 434 },
    { month: '2026-04', migrated: 78 },
  ],
  byRegion: [
    { region: 'AMER', pesi: 867, legacy: 2382 },
    { region: 'APAC', pesi: 483, legacy: 2366 },
    { region: 'ASIA', pesi: 1383, legacy: 1868 },
    { region: 'EMEA', pesi: 1517, legacy: 3074 },
  ],
}

export const mockEngagement = {
  total: 14175,
  zeroLogins: 446,
  avgLoginDays: 22.5,
  mobileActive: 11320,
  avgHealthScore: 7.9,
  avgOccupancyPct: 45.4,
}

export const mockFeatures = {
  total: 14772,
  features: [
    { name: 'SiteMinder Pay', count: 9200, pct: 62.3 },
    { name: 'Booking Engine (LHBE)', count: 8800, pct: 59.6 },
    { name: 'Demand Plus', count: 4100, pct: 27.8 },
    { name: 'DR+', count: 2900, pct: 19.6 },
    { name: 'GDS', count: 1800, pct: 12.2 },
    { name: 'Multi-Property', count: 980, pct: 6.6 },
    { name: 'Channels+', count: 720, pct: 4.9 },
    { name: 'Website Builder', count: 540, pct: 3.7 },
  ],
}
