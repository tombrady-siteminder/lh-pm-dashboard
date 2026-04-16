'use client'
import { useEffect, useState } from 'react'
import RAGBadge from './RAGBadge'
import SectionHeader from './SectionHeader'

interface SummaryData {
  activeCustomers: number
  activeCustomersPrev: number
  netMrr: number
  netMrrPrev: number
  monthlyChurnRate: number
  monthlyChurnRatePrev: number
  pesiCount: number
  legacyCount: number
  asOfMonth: string | null
  isMock?: boolean
}

function fmt(n: number) { return n.toLocaleString() }
function fmtMrr(n: number) { return `$${(n / 1000000).toFixed(2)}M` }
function fmtPct(n: number) { return `${n.toFixed(2)}%` }

export default function HealthSection() {
  const [data, setData] = useState<SummaryData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/summary')
      .then(r => r.json())
      .then(setData)
      .catch(() => setError(true))
  }, [])

  if (error) return (
    <section id="health" className="mb-12">
      <SectionHeader title="Health Summary" />
      <div className="rounded-xl bg-red-950/30 border border-red-800/40 p-4 text-red-400 text-sm">
        Failed to load health summary data.
      </div>
    </section>
  )

  if (!data) return (
    <section id="health" className="mb-12">
      <SectionHeader title="Health Summary" subtitle="RAG status across key PM metrics" />
      <div className="flex flex-wrap gap-3">
        {[1,2,3,4].map(i => <div key={i} className="skeleton flex-1 min-w-48 h-24" />)}
      </div>
    </section>
  )

  const totalLh = data.pesiCount + data.legacyCount
  const pesiPct = totalLh > 0 ? (data.pesiCount / totalLh) * 100 : 0
  const customerMoM = data.activeCustomers - data.activeCustomersPrev
  const mrrMoM = data.netMrr - data.netMrrPrev

  const churnStatus = data.monthlyChurnRate < 2.5 ? 'green' : data.monthlyChurnRate <= 3.0 ? 'amber' : 'red'
  const customerStatus = customerMoM > 0 ? 'green' : customerMoM === 0 ? 'amber' : 'red'
  const mrrStatus = mrrMoM > 0 ? 'green' : mrrMoM === 0 ? 'amber' : 'red'
  const pesiStatus = pesiPct > 60 ? 'green' : pesiPct >= 40 ? 'amber' : 'red'

  return (
    <section id="health" className="mb-12">
      <SectionHeader
        title="Health Summary"
        subtitle={`RAG status · ${data.asOfMonth ? `Data as of ${data.asOfMonth}` : 'Latest snapshot'}${data.isMock ? ' · Demo data' : ''}`}
        info="Red/Amber/Green status across four KPIs. Churn: <2.5% = green, 2.5–3% = amber, >3% = red. Active customers and MRR go green if growing month-on-month. PESI migration: >60% migrated = green, 40–60% = amber, <40% = red."
      />
      <div className="flex flex-wrap gap-3">
        <RAGBadge
          label="Monthly Churn Rate"
          value={fmtPct(data.monthlyChurnRate)}
          status={churnStatus}
          detail={`${data.monthlyChurnRate > data.monthlyChurnRatePrev ? '↑' : '↓'} ${fmtPct(Math.abs(data.monthlyChurnRate - data.monthlyChurnRatePrev))} vs prior month`}
        />
        <RAGBadge
          label="Active Customers"
          value={fmt(data.activeCustomers)}
          status={customerStatus}
          detail={`${customerMoM >= 0 ? '+' : ''}${fmt(customerMoM)} MoM`}
        />
        <RAGBadge
          label="Net MRR"
          value={fmtMrr(data.netMrr)}
          status={mrrStatus}
          detail={`${mrrMoM >= 0 ? '+' : ''}${fmtMrr(mrrMoM)} MoM`}
        />
        <RAGBadge
          label="Platform (PESI %)"
          value={`${pesiPct.toFixed(1)}%`}
          status={pesiStatus}
          detail={`${fmt(data.pesiCount)} of ${fmt(totalLh)} migrated`}
        />
      </div>
    </section>
  )
}
