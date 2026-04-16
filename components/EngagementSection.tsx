'use client'
import { useEffect, useState } from 'react'
import MetricCard from './MetricCard'
import SectionHeader from './SectionHeader'

interface EngagementData {
  total: number
  zeroLogins: number
  avgLoginDays: number
  mobileActive: number
  avgHealthScore: number
  avgOccupancyPct: number
  isMock?: boolean
}

function fmt(n: number) { return n.toLocaleString() }
function pct(a: number, b: number) { return b > 0 ? ((a / b) * 100).toFixed(1) : '0' }

export default function EngagementSection() {
  const [data, setData] = useState<EngagementData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/engagement')
      .then(r => r.json())
      .then(setData)
      .catch(() => setError(true))
  }, [])

  if (error) return (
    <section id="engagement" className="mb-12">
      <SectionHeader title="Engagement Signals" />
      <div className="rounded-xl bg-red-950/30 border border-red-800/40 p-4 text-red-400 text-sm">Failed to load.</div>
    </section>
  )

  if (!data) return (
    <section id="engagement" className="mb-12">
      <SectionHeader title="Engagement Signals" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-28" />)}
      </div>
    </section>
  )

  const atRiskPct = parseFloat(pct(data.zeroLogins, data.total))
  const mobilePct = parseFloat(pct(data.mobileActive, data.total))

  return (
    <section id="engagement" className="mb-12">
      <SectionHeader
        title="Engagement Signals"
        subtitle={`Last 30 days · ${fmt(data.total)} LH customers with health scores${data.isMock ? ' · Demo data' : ''}`}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <MetricCard
          label="Avg Health Score"
          value={`${data.avgHealthScore} / 10`}
          subtext="Composite engagement score"
          highlight={data.avgHealthScore >= 7 ? 'green' : data.avgHealthScore >= 5 ? 'amber' : 'red'}
        />
        <MetricCard
          label="Zero Logins (30d)"
          value={fmt(data.zeroLogins)}
          subtext={`${atRiskPct}% of monitored customers — at-risk signal`}
          highlight={atRiskPct < 3 ? 'green' : atRiskPct < 6 ? 'amber' : 'red'}
        />
        <MetricCard
          label="Avg Login Days / Month"
          value={`${data.avgLoginDays} days`}
          subtext="Days with at least one session in 30d"
          highlight="blue"
        />
        <MetricCard
          label="Mobile Active"
          value={fmt(data.mobileActive)}
          subtext={`${mobilePct}% use mobile app in last 30d`}
          highlight="blue"
        />
        <MetricCard
          label="Avg Occupancy"
          value={`${data.avgOccupancyPct}%`}
          subtext="Average room occupancy last 30 days"
          highlight="none"
        />
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex flex-col justify-between">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">At-Risk Customers</p>
          <div>
            <p className={`text-2xl font-bold tabular-nums ${atRiskPct > 5 ? 'text-red-400' : atRiskPct > 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {atRiskPct}%
            </p>
            <p className="text-xs text-slate-500 mt-1">0 logins in 30d</p>
            <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${atRiskPct > 5 ? 'bg-red-400' : atRiskPct > 3 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                style={{ width: `${Math.min(atRiskPct * 10, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
