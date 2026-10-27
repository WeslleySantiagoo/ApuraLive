import { IrreversibilityResponse, CandidateResult } from '../../types/results'
import { formatNumber } from '../../utils/formatters'
import { Trophy, CheckCircle2, Clock, UserCheck } from 'lucide-react'

interface IrreversibilityCardProps {
  assessment: IrreversibilityResponse | null
  candidates?: CandidateResult[]
}

export function IrreversibilityCard({
  assessment,
  candidates = [],
}: IrreversibilityCardProps) {
  if (!assessment) return null

  const isWon = assessment.is_mathematically_irreversible
  const leaderName = assessment.leader_candidate_name || (candidates[0]?.name ?? 'Líder')
  const leaderCand = candidates.find(
    (c) => c.name.toUpperCase() === leaderName.toUpperCase() || c.id === assessment.leader_candidate_id
  ) || candidates[0]

  const isLula = leaderCand?.number === '13' || leaderName.toUpperCase().includes('LULA')
  const isBolsonaro = leaderCand?.number === '22' || leaderName.toUpperCase().includes('BOLSONARO')
  const leaderColor = isLula ? '#E53935' : isBolsonaro ? '#2563EB' : leaderCand?.color || '#F4F4F5'
  const leaderPhoto = isLula ? '/candidates/lula.jpg' : isBolsonaro ? '/candidates/flavio-bolsonaro.jpg' : leaderCand?.photo_url

  return (
    <div
      className={`rounded-2xl border p-6 transition-all border-l-8 ${
        isWon
          ? 'bg-zinc-900 border-zinc-500 shadow-xl shadow-black/60'
          : 'bg-zinc-900/60 border-zinc-800'
      }`}
      style={{ borderLeftColor: leaderColor }}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Leader Info & Friendly Title */}
        <div className="flex items-center gap-3.5">
          {leaderPhoto ? (
            <img
              src={leaderPhoto}
              alt={leaderName}
              className="w-14 h-14 rounded-2xl object-cover object-top border-2 shadow-md shrink-0"
              style={{ borderColor: leaderColor }}
            />
          ) : (
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg text-white border-2 shrink-0 bg-zinc-800"
              style={{ borderColor: leaderColor }}
            >
              <Trophy className="w-6 h-6" style={{ color: leaderColor }} />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                Líder da Disputa
              </span>
              <h3 className="text-lg font-bold text-zinc-100">{leaderName}</h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Distância para a garantia matemática da vitória presidencial
            </p>
          </div>
        </div>

        {/* State Badge */}
        <div className="flex items-center gap-2">
          {isWon ? (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-100 text-zinc-950 font-mono text-xs font-bold tracking-wide shadow-md">
              <CheckCircle2 className="w-4 h-4" />
              VITÓRIA MATEMÁTICA CONFIRMADA
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-medium">
              <Clock className="w-4 h-4 text-zinc-400" />
              EM APURAÇÃO
            </div>
          )}
        </div>
      </div>

      {/* Main Friendly Metric: Quantos votos faltam para o líder */}
      <div className="mt-5 pt-4 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="md:col-span-2 space-y-1.5">
          {isWon ? (
            <p className="text-sm font-semibold text-zinc-100 leading-relaxed">
              🎉 Matematicamente eleito: mesmo que todos os votos das seções restantes fossem computados para o segundo colocado, {leaderName} não pode mais ser ultrapassado.
            </p>
          ) : (
            <div>
              <span className="text-xs text-zinc-400 block font-medium">O que falta para a vitória matemática:</span>
              <p className="text-sm text-zinc-200 font-semibold mt-0.5">
                Faltam exatamente <strong className="text-white text-base font-mono underline decoration-2" style={{ textDecorationColor: leaderColor }}>{formatNumber(assessment.votes_needed_to_win)}</strong> votos para <span style={{ color: leaderColor }}>{leaderName}</span> atingir o ponto irreversível onde o 2º colocado não consegue mais alcançar.
              </p>
            </div>
          )}
          <p className="text-[11px] text-zinc-400">
            A Justiça Eleitoral proclamará oficialmente o resultado após o encerramento total das urnas.
          </p>
        </div>

        {/* Friendly Numbers Box */}
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" style={{ color: leaderColor }} />
              Vantagem atual:
            </span>
            <strong className="text-zinc-100 font-mono text-sm">{formatNumber(assessment.vote_difference)}</strong>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400">Votos que faltam:</span>
            <strong className="font-mono text-sm" style={{ color: isWon ? '#10B981' : leaderColor }}>
              {isWon ? '0 (Garantido)' : formatNumber(assessment.votes_needed_to_win)}
            </strong>
          </div>
          <div className="flex justify-between items-center text-xs pt-1.5 border-t border-zinc-800">
            <span className="text-zinc-400">Urnas ainda abertas:</span>
            <span className="text-zinc-300 font-mono">{formatNumber(assessment.remaining_valid_votes_upper_bound)} votos</span>
          </div>
        </div>
      </div>
    </div>
  )
}
