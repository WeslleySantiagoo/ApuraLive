import { SectionsProgress, VotesSummary } from '../../types/results'
import { formatNumber, formatPercentage } from '../../utils/formatters'
import { Layers } from 'lucide-react'

interface SectionsProgressBarProps {
  sections: SectionsProgress
  summary?: VotesSummary | null
}

export function SectionsProgressBar({ sections, summary }: SectionsProgressBarProps) {
  const pct = Math.min(100, Math.max(0, sections.percentage))

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
      {/* Totalização das Seções */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-red-500" />
          <h3 className="text-sm font-semibold text-white">Progresso da Totalização Oficial</h3>
        </div>
        <div className="text-xs text-slate-300">
          <strong className="text-white text-sm font-bold">{formatPercentage(pct)}</strong> totalizado (
          {formatNumber(sections.counted)} de {formatNumber(sections.total)} seções)
        </div>
      </div>

      {/* Main Sections Progress Bar */}
      <div className="w-full bg-slate-800/90 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
        <div
          className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-emerald-400 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Detailed breakdown: Brancos, Nulos, Abstenção */}
      {summary && summary.total_electors > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-slate-400 block text-[11px]">Votos Válidos</span>
            <strong className="text-white font-semibold">{formatNumber(summary.valid)}</strong>
          </div>
          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-slate-400 block text-[11px]">Votos em Branco</span>
            <strong className="text-slate-300 font-semibold">{formatNumber(summary.blank)}</strong>
          </div>
          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-slate-400 block text-[11px]">Votos Nulos</span>
            <strong className="text-slate-300 font-semibold">{formatNumber(summary.null_votes)}</strong>
          </div>
          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-slate-400 block text-[11px]">Abstenção</span>
            <strong className="text-slate-300 font-semibold">{formatNumber(summary.abstention)}</strong>
          </div>
        </div>
      )}
    </div>
  )
}
