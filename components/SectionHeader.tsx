import InfoTooltip from './InfoTooltip'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  info?: string
}

export default function SectionHeader({ title, subtitle, info }: SectionHeaderProps) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-slate-100 flex items-center">
        {title}
        {info && <InfoTooltip text={info} />}
      </h2>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  )
}
