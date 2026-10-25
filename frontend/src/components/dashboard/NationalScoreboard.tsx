import { CandidateResult } from '../../types/results'
import { formatNumber, formatPercentage } from '../../utils/formatters'
import { CheckCircle2, User } from 'lucide-react'

interface NationalScoreboardProps {
  candidates: CandidateResult[]
  totalValidVotes: number
}

export function NationalScoreboard({ candidates, totalValidVotes }: NationalScoreboardProps) {
  if (!candidates || candidates.length === 0) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-400">
        <p className="text-sm">Nenhum voto computado oficialmente pelo TSE até o momento.</p>
      </div>
    )
  }

  const leader = candidates[0]
  const runnerUp = candidates.length > 1 ? candidates[1] : null
  const diffVotes = runnerUp ? leader.votes - runnerUp.votes : 0
  const diffPercentage = runnerUp ? leader.percentage - runnerUp.percentage : 0

  return (
    <div className="space-y-4">
      {/* Placar Grid com visual neutro refinado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {candidates.slice(0, 2).map((cand, idx) => {
          const isLeader = idx === 0 && cand.votes > 0
          return (
            <div
              key={cand.id}
              className={`relative overflow-hidden rounded-2xl border p-6 transition-all ${
                isLeader
                  ? 'bg-zinc-900/90 border-zinc-700 shadow-xl shadow-black/50'
                  : 'bg-zinc-900/40 border-zinc-800/80'
              }`}
            >
              {/* Neutral subtle border accent */}
              <div
                className="absolute top-0 left-0 right-0 h-1 bg-zinc-600"
              />

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Avatar Neutro e Elegante */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg text-zinc-100 border border-zinc-700 bg-zinc-800/80 overflow-hidden shadow-inner shrink-0"
                  >
                    {cand.photo_url ? (
                      <img src={cand.photo_url} alt={cand.name} className="w-full h-full object-cover grayscale" />
                    ) : (
                      <User className="w-7 h-7 text-zinc-400" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {cand.number}
                      </span>
                      <h2 className="text-lg font-bold text-zinc-100 tracking-tight leading-tight">
                        {cand.name}
                      </h2>
                    </div>
                    <span className="text-xs text-zinc-400 mt-0.5 block">
                      {cand.number === '13' ? 'PT' : cand.number === '22' ? 'PL' : 'Candidatura Oficial'}
                    </span>
                  </div>
                </div>

                {/* Elected Badge */}
                {cand.is_elected && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-950 font-mono tracking-wide">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ELEITO
                  </div>
                )}
              </div>

              {/* Numbers */}
              <div className="mt-6 flex items-baseline justify-between pt-4 border-t border-zinc-800/80">
                <div>
                  <span className="text-3xl md:text-4xl font-extrabold font-mono text-zinc-100 tracking-tight">
                    {formatPercentage(cand.percentage)}
                  </span>
                  <p className="text-xs text-zinc-400 mt-1">
                    {formatNumber(cand.votes)} votos válidos
                  </p>
                </div>

                {isLeader && runnerUp && (
                  <div className="text-right">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
                      +{formatPercentage(diffPercentage)}
                    </span>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      vantagem de {formatNumber(diffVotes)}
                    </p>
                  </div>
                )}
              </div>

              {/* Barra neutra de progresso */}
              <div className="mt-4 w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 bg-zinc-300"
                  style={{
                    width: `${Math.min(100, Math.max(0, cand.percentage))}%`,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Difference Banner if both have votes */}
      {leader && runnerUp && leader.votes > 0 && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between text-xs text-zinc-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
            <span>
              Diferença entre o 1º e o 2º colocado: <strong className="text-zinc-100">{formatNumber(diffVotes)} votos</strong> ({formatPercentage(diffPercentage)})
            </span>
          </div>
          <span className="text-zinc-400">
            Total de votos válidos apurados: <strong className="text-zinc-200">{formatNumber(totalValidVotes)}</strong>
          </span>
        </div>
      )}
    </div>
  )
}
