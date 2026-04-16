'use client'
import { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import MetricCard from './MetricCard'
import SectionHeader from './SectionHeader'

interface PesiData {
  pesiCount: number
  legacyCount: number
  pesiMrr?: number
  legacyMrr?: number
  velocity: { month: string; migrated: number }[]
  byRegion: { region: string; pesi: number; legacy: number }[]
  isMock?: boolean
}

function fmt(n: number) { return n.toLocaleString() }

export default function PesiSection() {
  const [data, setData] = useState<PesiData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/pesi')
      .then(r => r.json())
      .then(setData)
      .catch(() => setError(true))
  }, [])

  if (error) return (
    <section id="pesi" className="mb-12">
      <SectionHeader title="PESI Migration Tracker" />
      <div className="rounded-xl bg-red-950/30 border border-red-800/40 p-4 text-red-400 text-sm">Failed to load.</div>
    </section>
  )

  if (!data) return (
    <section id="pesi" className="mb-12">
      <SectionHeader title="PESI Migration Tracker" />
      <div className="skeleton h-64" />
    </section>
  )

  const total = data.pesiCount + data.legacyCount
  const pesiPct = total > 0 ? (data.pesiCount / total) * 100 : 0
  const pesiStatus = pesiPct > 60 ? 'text-emerald-400' : pesiPct >= 40 ? 'text-amber-400' : 'text-red-400'

  const donutData = [
    { name: 'PESI (new platform)', value: data.pesiCount, color: '#3b82f6' },
    { name: 'Legacy LHP', value: data.legacyCount, color: '#475569' },
  ]

  const latestVelocity = data.velocity[data.velocity.length - 1]
  const prevVelocity = data.velocity[data.velocity.length - 2]

  return (
    <section id="pesi" className="mb-12">
      <SectionHeader
        title="PESI Migration Tracker"
        subtitle={`Platform migration progress · ${data.isMock ? 'Demo data' : 'Live'}`}
        info="Tracks migration from LHP (legacy platform) to PESI (the new LH platform). The split is derived from the LH_PLATFORM_F flag in MART_ACTIVE_CUSTOMERS. Migration velocity shows how many customers moved to PESI each month. Green threshold: >60% of the LH base migrated."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MetricCard
          label="PESI Migrated"
          value={fmt(data.pesiCount)}
          subtext={`${pesiPct.toFixed(1)}% of LH base`}
          highlight={pesiPct > 60 ? 'green' : pesiPct >= 40 ? 'amber' : 'red'}
        />
        <MetricCard
          label="Legacy (LHP)"
          value={fmt(data.legacyCount)}
          subtext={`${(100 - pesiPct).toFixed(1)}% remaining`}
          highlight="none"
        />
        <MetricCard
          label="Migration Rate"
          value={`${pesiPct.toFixed(1)}%`}
          subtext="Target: >60% for green"
          highlight={pesiPct > 60 ? 'green' : pesiPct >= 40 ? 'amber' : 'red'}
        />
        <MetricCard
          label="Migrated This Month"
          value={fmt(latestVelocity?.migrated ?? 0)}
          trend={latestVelocity && prevVelocity ? latestVelocity.migrated - prevVelocity.migrated : undefined}
          trendLabel="vs prior month"
          good="up"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Donut */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Platform Split</p>
          <div className="flex items-center justify-center">
            <PieChart width={220} height={220}>
              <Pie data={donutData} cx={110} cy={110} innerRadius={60} outerRadius={90} dataKey="value" startAngle={90} endAngle={-270}>
                {donutData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                formatter={(v) => [fmt(Number(v)), '']}
              />
            </PieChart>
            <div className="ml-4 space-y-3">
              {donutData.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
                  <div>
                    <p className="text-xs text-slate-400">{d.name}</p>
                    <p className="text-sm font-semibold text-slate-100">{fmt(d.value)}</p>
                  </div>
                </div>
              ))}
              <div className="pt-1 border-t border-slate-800">
                <p className={`text-lg font-bold ${pesiStatus}`}>{pesiPct.toFixed(1)}% migrated</p>
              </div>
            </div>
          </div>
        </div>

        {/* Migration velocity */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">Migration Velocity (customers/month)</p>
          {data.velocity.length === 0 ? (
            <p className="text-sm text-slate-500 mt-8">No migration data in range.</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.velocity} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(v) => [fmt(Number(v)), 'Migrated']}
                />
                <Bar dataKey="migrated" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* By region */}
      {data.byRegion.length > 0 && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">PESI vs Legacy by Region</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.byRegion} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="region" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(v) => [fmt(Number(v)), '']}
              />
              <Legend wrapperStyle={{ color: '#64748b', fontSize: 12 }} />
              <Bar dataKey="pesi" name="PESI" fill="#3b82f6" radius={[3, 3, 0, 0]} stackId="a" />
              <Bar dataKey="legacy" name="Legacy" fill="#475569" radius={[3, 3, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
