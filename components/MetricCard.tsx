interface MetricCardProps {
  label: string
  value: string | number
  subtext?: string
  trend?: number       // positive = up, negative = down
  trendLabel?: string
  good?: 'up' | 'down' | 'neutral'  // which direction is good
  highlight?: 'green' | 'amber' | 'red' | 'blue' | 'none'
}

function trendArrow(trend: number) {
  return trend > 0 ? '↑' : trend < 0 ? '↓' : '→'
}

export default function MetricCard({
  label, value, subtext, trend, trendLabel, good = 'neutral', highlight = 'none',
}: MetricCardProps) {
  const trendGood =
    good === 'neutral' ? null
    : good === 'up' ? (trend ?? 0) >= 0
    : (trend ?? 0) <= 0

  const trendColor =
    trendGood === null ? 'text-slate-400'
    : trendGood ? 'text-emerald-400'
    : 'text-red-400'

  const borderColor =
    highlight === 'green' ? 'border-emerald-500/40'
    : highlight === 'amber' ? 'border-amber-500/40'
    : highlight === 'red' ? 'border-red-500/40'
    : highlight === 'blue' ? 'border-blue-500/40'
    : 'border-slate-800'

  return (
    <div className={`bg-slate-900 rounded-xl p-5 border ${borderColor} flex flex-col gap-2`}>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-slate-100 tabular-nums">{value}</p>
      {trend !== undefined && (
        <p className={`text-xs font-medium ${trendColor}`}>
          {trendArrow(trend)} {Math.abs(trend).toFixed(trend % 1 === 0 ? 0 : 1)}
          {trendLabel ? ` ${trendLabel}` : ''}
        </p>
      )}
      {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
    </div>
  )
}
