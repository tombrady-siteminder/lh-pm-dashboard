'use client'
import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import SectionHeader from './SectionHeader'

interface FeaturesData {
  total: number
  features: { name: string; count: number; pct: number }[]
  isMock?: boolean
}

function fmt(n: number) { return n.toLocaleString() }

const COLORS = ['#3b82f6', '#34d399', '#f59e0b', '#a78bfa', '#f87171', '#38bdf8', '#fb923c', '#a3e635', '#e879f9', '#94a3b8']

export default function FeaturesSection() {
  const [data, setData] = useState<FeaturesData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/features')
      .then(r => r.json())
      .then(setData)
      .catch(() => setError(true))
  }, [])

  if (error) return (
    <section id="features" className="mb-12">
      <SectionHeader title="Feature Adoption" />
      <div className="rounded-xl bg-red-950/30 border border-red-800/40 p-4 text-red-400 text-sm">Failed to load.</div>
    </section>
  )

  if (!data) return (
    <section id="features" className="mb-12">
      <SectionHeader title="Feature Adoption" />
      <div className="skeleton h-64" />
    </section>
  )

  return (
    <section id="features" className="mb-12">
      <SectionHeader
        title="Feature Adoption"
        subtitle={`% of ${fmt(data.total)} active LH customers with each feature enabled${data.isMock ? ' · Demo data' : ''}`}
      />

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 mb-4">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">Feature Penetration — highest to lowest</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data.features}
            layout="vertical"
            margin={{ top: 0, right: 60, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 100]} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} width={140} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(v, _name, props) => [
                `${Number(v)}% (${fmt((props as { payload: { count: number } }).payload.count)} customers)`,
                'Adoption',
              ]}
            />
            <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
              {data.features.map((_entry, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Grid of feature tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {data.features.map((f, i) => (
          <div key={f.name} className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium truncate">{f.name}</span>
              <span className="text-xs font-bold" style={{ color: COLORS[i % COLORS.length] }}>{f.pct}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${f.pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
              />
            </div>
            <p className="text-xs text-slate-600 mt-1.5">{fmt(f.count)} customers</p>
          </div>
        ))}
      </div>
    </section>
  )
}
