'use client'
import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import MetricCard from './MetricCard'
import SectionHeader from './SectionHeader'

interface ChurnRow {
  month: string
  baseStart: number
  baseEnd: number
  churned: number
  newCustomers: number
  mrrStart: number
  mrrEnd: number
  monthlyChurnRate: number
}

function fmt(n: number) { return n.toLocaleString() }

export default function ChurnSection() {
  const [series, setSeries] = useState<ChurnRow[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/churn')
      .then(r => r.json())
      .then(d => setSeries(d.series))
      .catch(() => setError(true))
  }, [])

  if (error) return (
    <section id="churn" className="mb-12">
      <SectionHeader title="Churn & Retention" />
      <div className="rounded-xl bg-red-950/30 border border-red-800/40 p-4 text-red-400 text-sm">Failed to load churn data.</div>
    </section>
  )

  if (!series) return (
    <section id="churn" className="mb-12">
      <SectionHeader title="Churn & Retention" subtitle="Rolling 3-month methodology" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-28" />)}
      </div>
      <div className="skeleton h-56" />
    </section>
  )

  const latest = series[series.length - 1]
  const prev = series[series.length - 2]
  const retentionRate = latest ? 100 - latest.monthlyChurnRate : 0
  const netNew = latest ? latest.newCustomers - latest.churned : 0

  return (
    <section id="churn" className="mb-12">
      <SectionHeader title="Churn & Retention" subtitle="Rolling 3-month churn methodology · LH brand" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MetricCard
          label="Monthly Churn Rate"
          value={`${latest?.monthlyChurnRate.toFixed(2)}%`}
          trend={latest && prev ? latest.monthlyChurnRate - prev.monthlyChurnRate : undefined}
          trendLabel="pp vs prior month"
          good="down"
          highlight={
            (latest?.monthlyChurnRate ?? 0) < 2.5 ? 'green'
            : (latest?.monthlyChurnRate ?? 0) <= 3.0 ? 'amber'
            : 'red'
          }
        />
        <MetricCard
          label="Churned (3M total)"
          value={fmt(latest?.churned ?? 0)}
          trend={latest && prev ? latest.churned - prev.churned : undefined}
          trendLabel="vs prior month"
          good="down"
        />
        <MetricCard
          label="Net New Customers"
          value={`${netNew >= 0 ? '+' : ''}${fmt(netNew)}`}
          subtext={`${fmt(latest?.newCustomers ?? 0)} added · ${fmt(latest?.churned ?? 0)} lost`}
          good="up"
          highlight="blue"
        />
        <MetricCard
          label="Retention Rate"
          value={`${retentionRate.toFixed(2)}%`}
          trend={latest && prev ? -(latest.monthlyChurnRate - prev.monthlyChurnRate) : undefined}
          trendLabel="pp vs prior month"
          good="up"
          highlight="none"
        />
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">Monthly Churn Rate — Rolling 12 months</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={series} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis tickFormatter={v => `${v}%`} tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 5]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(v) => [`${Number(v).toFixed(2)}%`, 'Monthly churn rate']}
            />
            <ReferenceLine y={2.5} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '2.5% target', fill: '#f59e0b', fontSize: 10 }} />
            <ReferenceLine y={3.0} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '3.0% red', fill: '#ef4444', fontSize: 10 }} />
            <Line
              type="monotone"
              dataKey="monthlyChurnRate"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: '#f59e0b', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Customer flow */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 mt-4">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">New vs Churned Customers — Rolling 12 months</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={series} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Line type="monotone" dataKey="newCustomers" stroke="#34d399" strokeWidth={2} dot={{ fill: '#34d399', r: 2 }} name="New" />
            <Line type="monotone" dataKey="churned" stroke="#f87171" strokeWidth={2} dot={{ fill: '#f87171', r: 2 }} name="Churned" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
