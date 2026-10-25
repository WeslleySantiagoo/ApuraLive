import { useState } from 'react'
import { CandidateResult } from '../../types/results'
import { formatNumber, formatPercentage } from '../../utils/formatters'
import { Sliders, AlertTriangle, RotateCcw } from 'lucide-react'

interface ScenarioSimulatorProps {
  candidates: CandidateResult[]
  currentValidVotes: number
  remainingValidVotes: number
}

export function ScenarioSimulator({
  candidates,
  currentValidVotes,
  remainingValidVotes,
}: ScenarioSimulatorProps) {
  // Candidate 1 percentage of remaining votes (Candidate 2 gets the rest)
  const [sliderVal, setSliderVal] = useState<number>(50)

  if (!candidates || candidates.length < 2 || remainingValidVotes <= 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-center text-xs text-slate-400">
        <Sliders className="w-5 h-5 text-slate-500 mx-auto mb-2" />
        <p>O simulador de cenários fica disponível assim que houver votos válidos restantes estimados durante a apuração.</p>
      </div>
    )
  }

  const cand1 = candidates[0]
  const cand2 = candidates[1]

  const cand1AddedVotes = Math.round(remainingValidVotes * (sliderVal / 100))
  const cand2AddedVotes = remainingValidVotes - cand1AddedVotes

  const cand1ProjectedTotal = cand1.votes + cand1AddedVotes
  const cand2ProjectedTotal = cand2.votes + cand2AddedVotes
  const totalProjected = currentValidVotes + remainingValidVotes

  const cand1ProjectedPct = totalProjected > 0 ? (cand1ProjectedTotal / totalProjected) * 100 : 0
  const cand2ProjectedPct = totalProjected > 0 ? (cand2ProjectedTotal / totalProjected) * 100 : 0

  return (
    <div className="bg-slate-900/70 border border-amber-500/30 rounded-2xl p-5 space-y-5 relative overflow-hidden">
      {/* Warning banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Simulador de Cenários Possíveis</h3>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-bold tracking-wider uppercase">
          <AlertTriangle className="w-3.5 h-3.5" />
          Simulação Hipotética — Não é Resultado Oficial
        </span>
      </div>

      <p className="text-xs text-slate-300">
        Simule como o placar final ficaria caso os <strong className="text-white">{formatNumber(remainingValidVotes)}</strong> votos válidos restantes fossem distribuídos na proporção abaixo:
      </p>

      {/* Interactive Slider */}
      <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span style={{ color: cand1.color }}>{cand1.name}: {sliderVal}% dos restantes</span>
          <span style={{ color: cand2.color }}>{cand2.name}: {100 - sliderVal}% dos restantes</span>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={sliderVal}
          onChange={(e) => setSliderVal(Number(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />

        <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
          <span>+{formatNumber(cand1AddedVotes)} votos simulados</span>
          <button
            onClick={() => setSliderVal(50)}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition"
            title="Resetar para 50% / 50%"
          >
            <RotateCcw className="w-3 h-3" />
            50% / 50%
          </button>
          <span>+{formatNumber(cand2AddedVotes)} votos simulados</span>
        </div>
      </div>

      {/* Projected Result Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 block">{cand1.name} (Projeção)</span>
          <div className="flex items-baseline justify-between">
            <strong className="text-2xl font-bold" style={{ color: cand1.color }}>
              {formatPercentage(cand1ProjectedPct)}
            </strong>
            <span className="text-xs text-slate-300 font-medium">{formatNumber(cand1ProjectedTotal)} votos</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 block">{cand2.name} (Projeção)</span>
          <div className="flex items-baseline justify-between">
            <strong className="text-2xl font-bold" style={{ color: cand2.color }}>
              {formatPercentage(cand2ProjectedPct)}
            </strong>
            <span className="text-xs text-slate-300 font-medium">{formatNumber(cand2ProjectedTotal)} votos</span>
          </div>
        </div>
      </div>
    </div>
  )
}
