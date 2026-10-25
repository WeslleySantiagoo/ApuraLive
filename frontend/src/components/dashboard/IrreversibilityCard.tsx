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
      className={`rounded-2xl border p-6 transition-all ${
        isWon
          ? 'bg-zinc-900 border-zinc-500/80 shadow-xl shadow-black/60'
          : 'bg-zinc-900/40 border-zinc-800'
      }`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border ${
              isWon
                ? 'bg-zinc-800 border-zinc-600 text-zinc-100'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400'
            }`}
          >
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-100">Análise Matemática de Irreversibilidade</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                2º Turno (D &gt; R)
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Cálculo estrito conservador baseado nos votos válidos pendentes das seções não totalizadas.
            </p>
          </div>
        </div>

        {/* State Badge Neutro */}
        <div className="flex items-center gap-2">
          {isWon ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-950 font-mono text-xs font-bold tracking-wide">
              <CheckCircle2 className="w-4 h-4" />
              VITÓRIA MATEMATICAMENTE DEFINIDA
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-medium">
              <Clock className="w-4 h-4" />
              DISPUTA MATEMATICAMENTE EM ABERTO
            </div>
          )}
        </div>
      </div>

      {/* Narrative & Metrics */}
      <div className="mt-5 pt-4 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="md:col-span-2 space-y-2">
          <p className="text-zinc-200 leading-relaxed font-medium">
            {assessment.summary_text}
          </p>
          <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
            <AlertCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>
              Nota: Avaliação estritamente matemática. A proclamação oficial do resultado é de competência exclusiva da Justiça Eleitoral.
            </span>
          </div>
        </div>

        <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80 space-y-2">
          <div className="flex justify-between text-zinc-400">
            <span>Diferença de votos (D):</span>
            <strong className="text-zinc-100 font-mono">{formatNumber(assessment.vote_difference)}</strong>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Teto restante (R):</span>
            <strong className="text-zinc-300 font-mono">
              {formatNumber(assessment.remaining_valid_votes_upper_bound || remainingValidEstimate)}
            </strong>
          </div>
          <div className="flex justify-between text-zinc-400 pt-1.5 border-t border-zinc-800 font-mono">
            <span>Condição de garantia:</span>
            <strong className={isWon ? 'text-zinc-100' : 'text-zinc-400'}>
              {assessment.vote_difference} &gt; {assessment.remaining_valid_votes_upper_bound}
            </strong>
          </div>
        </div>
      </div>
    </div>
  )
}
