'use client'
import { useState } from 'react'

export default function InfoTooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false)

  return (
    <span className="relative inline-flex items-center ml-1.5">
      <button
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="w-4 h-4 rounded-full bg-slate-700 text-slate-400 text-[10px] font-bold leading-none flex items-center justify-center hover:bg-slate-600 hover:text-slate-200 transition-colors cursor-help"
        aria-label="More information"
      >
        i
      </button>
      {visible && (
        <div className="absolute z-50 left-0 top-6 w-72 bg-slate-800 border border-slate-600 rounded-lg p-3 text-xs text-slate-300 shadow-2xl leading-relaxed">
          {text}
        </div>
      )}
    </span>
  )
}
