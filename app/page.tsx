import Sidebar from '@/components/Sidebar'
import HealthSection from '@/components/HealthSection'
import ChurnSection from '@/components/ChurnSection'
import CustomersSection from '@/components/CustomersSection'
import PesiSection from '@/components/PesiSection'
import FeaturesSection from '@/components/FeaturesSection'
import EngagementSection from '@/components/EngagementSection'

export default function Dashboard() {
  const now = new Date().toLocaleString('en-AU', {
    timeZone: 'Australia/Sydney',
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      {/* Main content */}
      <div className="ml-56 flex-1 flex flex-col min-h-screen">
        {/* Sticky header */}
        <header className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-8 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-slate-200">Little Hotelier PM Dashboard</h1>
            <p className="text-xs text-slate-500">Internal · Read-only · Snowflake EDMA_PROD</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Last loaded</p>
            <p className="text-xs text-slate-400 font-medium">{now} AEDT</p>
          </div>
        </header>

        {/* Dashboard body */}
        <main className="flex-1 px-8 py-8 max-w-6xl w-full">
          <HealthSection />
          <ChurnSection />
          <CustomersSection />
          <PesiSection />
          <FeaturesSection />
          <EngagementSection />
        </main>
      </div>
    </div>
  )
}
