import { IrreversibilityResponse } from '../../types/results'
import { formatNumber } from '../../utils/formatters'
import { Calculator, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

interface IrreversibilityCardProps {
  assessment: IrreversibilityResponse | null
  remainingValidEstimate: number
}

export function IrreversibilityCard({
  assessment,
  remainingValidEstimate,
}: IrreversibilityCardProps) {
  if (!assessment) return null

  const isWon = assessment.is_mathematically_irreversible

  return (
    <div
      className={`rounded-2xl border p-5 transition-all ${
        isWon
          ? 'bg-emerald-950/20 border-emerald-800/80 shadow-lg shadow-emerald-950/20'
          : 'bg-slate-900/40 border-slate-800'
      }`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border ${
              isWon
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Análise Matemática de Irreversibilidade</h3>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                2º Turno (D &gt; R)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Cálculo estrito conservador baseado nos votos válidos pendentes das seções não totalizadas.
            </p>
          </div>
        </div>

        {/* State Badge */}
        <div className="flex items-center gap-2">
          {isWon ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              VITÓRIA MATEMATICAMENTE DEFINIDA
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold">
              <Clock className="w-4 h-4" />
              DISPUTA MATEMATICAMENTE EM ABERTO
            </div>
          )}
        </div>
      </div>

      {/* Narrative & Metrics */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="md:col-span-2 space-y-2">
          <p className="text-slate-200 leading-relaxed font-medium">
            {assessment.summary_text}
          </p>
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <AlertCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>
              Nota: Avaliação estritamente matemática. A proclamação oficial do resultado é de competência exclusiva da Justiça Eleitoral.
            </span>
          </div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
          <div className="flex justify-between text-slate-400">
            <span>Diferença de votos (D):</span>
            <strong className="text-white">{formatNumber(assessment.vote_difference)}</strong>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Teto restante (R):</span>
            <strong className="text-slate-200">
              {formatNumber(assessment.remaining_valid_votes_upper_bound || remainingValidEstimate)}
            </strong>
          </div>
          <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
            <span>Condição de garantia:</span>
            <strong className={isWon ? 'text-emerald-400' : 'text-amber-400'}>
              {assessment.vote_difference} &gt; {assessment.remaining_valid_votes_upper_bound}
            </strong>
          </div>
        </div>
      </div>
    </div>
  )
}
