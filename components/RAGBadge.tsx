type Status = 'green' | 'amber' | 'red'

interface RAGBadgeProps {
  label: string
  value: string
  status: Status
  detail?: string
}

const STATUS_STYLES: Record<Status, { dot: string; bg: string; border: string; text: string }> = {
  green: { dot: 'bg-emerald-400', bg: 'bg-emerald-950/60', border: 'border-emerald-700/50', text: 'text-emerald-300' },
  amber: { dot: 'bg-amber-400', bg: 'bg-amber-950/60', border: 'border-amber-700/50', text: 'text-amber-300' },
  red:   { dot: 'bg-red-400',   bg: 'bg-red-950/60',   border: 'border-red-700/50',   text: 'text-red-300' },
}

export default function RAGBadge({ label, value, status, detail }: RAGBadgeProps) {
  const s = STATUS_STYLES[status]
  return (
    <div className={`flex-1 min-w-48 rounded-xl border ${s.border} ${s.bg} p-4 flex flex-col gap-2`}>
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${s.dot} shrink-0`} />
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-xl font-bold ${s.text} tabular-nums`}>{value}</p>
      {detail && <p className="text-xs text-slate-500">{detail}</p>}
    </div>
  )
}
