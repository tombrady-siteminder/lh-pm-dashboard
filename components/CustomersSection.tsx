'use client'
import { useEffect, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
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
function fmtMrr(n: number) { return `$${(n / 1000).toFixed(0)}K` }

export default function CustomersSection() {
  const [series, setSeries] = useState<ChurnRow[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/churn')
      .then(r => r.json())
      .then(d => setSeries(d.series))
      .catch(() => setError(true))
  }, [])

  if (error) return (
    <section id="customers" className="mb-12">
      <SectionHeader title="Active Customers & Growth" />
      <div className="rounded-xl bg-red-950/30 border border-red-800/40 p-4 text-red-400 text-sm">Failed to load.</div>
    </section>
  )

  if (!series) return (
    <section id="customers" className="mb-12">
      <SectionHeader title="Active Customers & Growth" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-28" />)}
      </div>
      <div className="skeleton h-56" />
    </section>
  )

  const latest = series[series.length - 1]
  const prev = series[series.length - 2]
  const yearAgo = series[0]

  const momGrowth = latest && prev ? latest.baseEnd - prev.baseEnd : 0
  const yoyGrowth = latest && yearAgo ? latest.baseEnd - yearAgo.baseStart : 0
  const momMrr = latest && prev ? latest.mrrEnd - prev.mrrEnd : 0

  const chartData = series.map(r => ({ month: r.month, customers: r.baseEnd, mrr: r.mrrEnd }))

  return (
    <section id="customers" className="mb-12">
      <SectionHeader
        title="Active Customers & Growth"
        subtitle="LH brand · end-of-month snapshots"
        info="Active customer count and Net MRR at end-of-month snapshots. MoM = month-on-month change vs the prior month. YoY = change vs the earliest month in the 12-month window. Source: MART_ACTIVE_CUSTOMERS (EDMA_PROD.EDMA_STRATOPS)."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MetricCard
          label="Active Customers"
          value={fmt(latest?.baseEnd ?? 0)}
          trend={momGrowth}
          trendLabel="MoM"
          good="up"
          highlight="blue"
        />
        <MetricCard
          label="Net MRR"
          value={`$${((latest?.mrrEnd ?? 0) / 1000000).toFixed(2)}M`}
          trend={momMrr}
          trendLabel="MoM ($)"
          good="up"
        />
        <MetricCard
          label="New This Month"
          value={fmt(latest?.newCustomers ?? 0)}
          trend={latest && prev ? latest.newCustomers - prev.newCustomers : undefined}
          trendLabel="vs prior month"
          good="up"
          highlight="green"
        />
        <MetricCard
          label="YoY Growth"
          value={`${yoyGrowth >= 0 ? '+' : ''}${fmt(yoyGrowth)}`}
          subtext={`${latest?.baseEnd && yearAgo?.baseStart ? ((yoyGrowth / yearAgo.baseStart) * 100).toFixed(1) : 0}% growth rate`}
          good="up"
        />
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">Active Customer Count — Rolling 12 months</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis tickFormatter={v => fmt(v)} tick={{ fill: '#64748b', fontSize: 11 }} width={60} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(v) => [fmt(Number(v)), 'Active customers']}
            />
            <Area type="monotone" dataKey="customers" stroke="#3b82f6" strokeWidth={2} fill="url(#custGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 mt-4">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">Net MRR — Rolling 12 months</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis tickFormatter={v => fmtMrr(v)} tick={{ fill: '#64748b', fontSize: 11 }} width={60} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(v) => [`$${(Number(v) / 1000000).toFixed(2)}M`, 'Net MRR']}
            />
            <Area type="monotone" dataKey="mrr" stroke="#34d399" strokeWidth={2} fill="url(#mrrGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
