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
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
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
      {/* Placar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {candidates.slice(0, 2).map((cand, idx) => {
          const isLeader = idx === 0 && cand.votes > 0
          return (
            <div
              key={cand.id}
              className={`relative overflow-hidden rounded-2xl border p-5 transition-all ${
                isLeader
                  ? 'bg-slate-900/90 border-slate-700 shadow-xl shadow-black/40'
                  : 'bg-slate-900/50 border-slate-800/80'
              }`}
            >
              {/* Color accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: cand.color }}
              />

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {/* Photo or Neutral Avatar */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg text-white border-2 overflow-hidden shadow-inner shrink-0"
                    style={{ borderColor: cand.color, backgroundColor: `${cand.color}25` }}
                  >
                    {cand.photo_url ? (
                      <img src={cand.photo_url} alt={cand.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-7 h-7" style={{ color: cand.color }} />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {cand.number}
                      </span>
                      <h2 className="text-lg font-bold text-white tracking-tight leading-tight">
                        {cand.name}
                      </h2>
                    </div>
                    <span className="text-xs text-slate-400">
                      {cand.number === '13' ? 'PT' : cand.number === '22' ? 'PL' : 'Candidatura Oficial'}
                    </span>
                  </div>
                </div>

                {/* Elected Badge */}
                {cand.is_elected && (
                  <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ELEITO
                  </div>
                )}
              </div>

              {/* Numbers */}
              <div className="mt-5 flex items-baseline justify-between pt-4 border-t border-slate-800/80">
                <div>
                  <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    {formatPercentage(cand.percentage)}
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatNumber(cand.votes)} votos válidos
                  </p>
                </div>

                {isLeader && runnerUp && (
                  <div className="text-right">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                      +{formatPercentage(diffPercentage)}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      vantagem de {formatNumber(diffVotes)}
                    </p>
                  </div>
                )}
              </div>

              {/* Individual progress indicator */}
              <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, Math.max(0, cand.percentage))}%`,
                    backgroundColor: cand.color,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Difference Banner if both have votes */}
      {leader && runnerUp && leader.votes > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>
              Diferença entre o 1º e o 2º colocado: <strong className="text-white">{formatNumber(diffVotes)} votos</strong> ({formatPercentage(diffPercentage)})
            </span>
          </div>
          <span className="text-slate-400">
            Total de votos válidos apurados: <strong className="text-slate-200">{formatNumber(totalValidVotes)}</strong>
          </span>
        </div>
      )}
    </div>
  )
}
