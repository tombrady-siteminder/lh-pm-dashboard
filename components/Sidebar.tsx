'use client'
import { useState } from 'react'

const NAV = [
  { id: 'health', label: 'Health Summary', icon: '⬤' },
  { id: 'churn', label: 'Churn & Retention', icon: '⬤' },
  { id: 'customers', label: 'Active Customers', icon: '⬤' },
  { id: 'pesi', label: 'PESI Migration', icon: '⬤' },
  { id: 'features', label: 'Feature Adoption', icon: '⬤' },
  { id: 'engagement', label: 'Engagement', icon: '⬤' },
]

export default function Sidebar() {
  const [active, setActive] = useState('health')

  const scrollTo = (id: string) => {
    setActive(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-slate-900 border-r border-slate-800 flex flex-col z-20">
      <div className="px-5 py-5 border-b border-slate-800">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Internal Tool</p>
        <h1 className="text-sm font-bold text-slate-100 leading-tight">Little Hotelier<br />PM Dashboard</h1>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
              active === item.id
                ? 'bg-slate-800 text-slate-100 font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-slate-800">
        <p className="text-xs text-slate-600">Read-only · EDMA_PROD</p>
      </div>
    </aside>
  )
}
