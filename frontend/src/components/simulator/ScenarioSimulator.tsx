import { useState } from 'react'
import { CandidateResult } from '../../types/results'
import { formatNumber, formatPercentage } from '../../utils/formatters'
import { Sliders, RotateCcw, Info } from 'lucide-react'

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
  const [sliderVal, setSliderVal] = useState<number>(50)

  if (!candidates || candidates.length < 2 || remainingValidVotes <= 0) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 text-center text-xs text-zinc-400">
        <Sliders className="w-5 h-5 text-zinc-500 mx-auto mb-2" />
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
    <div className="bg-zinc-900/60 border border-zinc-700/80 rounded-2xl p-6 space-y-5">
      {/* Impartial title & badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-zinc-300" />
          <h3 className="text-sm font-bold text-zinc-100">Simulador de Cenários Possíveis</h3>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-mono tracking-wider uppercase">
          <Info className="w-3.5 h-3.5 text-zinc-400" />
          Simulação Hipotética — Não é Resultado Oficial
        </span>
      </div>

      <p className="text-xs text-zinc-300">
        Simule como o placar final ficaria caso os <strong className="text-zinc-100 font-mono">{formatNumber(remainingValidVotes)}</strong> votos válidos restantes fossem distribuídos na proporção abaixo:
      </p>

      {/* Interactive Slider Neutro */}
      <div className="space-y-3 bg-zinc-950/80 p-5 rounded-xl border border-zinc-800">
        <div className="flex justify-between items-center text-xs font-semibold text-zinc-200">
          <span>{cand1.name}: {sliderVal}% dos restantes</span>
          <span>{cand2.name}: {100 - sliderVal}% dos restantes</span>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={sliderVal}
          onChange={(e) => setSliderVal(Number(e.target.value))}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
        />

        <div className="flex justify-between items-center text-[11px] text-zinc-400 pt-1 font-mono">
          <span>+{formatNumber(cand1AddedVotes)} votos</span>
          <button
            onClick={() => setSliderVal(50)}
            className="flex items-center gap-1 text-zinc-400 hover:text-white transition font-sans"
            title="Resetar para 50% / 50%"
          >
            <RotateCcw className="w-3 h-3" />
            50% / 50%
          </button>
          <span>+{formatNumber(cand2AddedVotes)} votos</span>
        </div>
      </div>

      {/* Projected Result Cards Monocromáticos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
          <span className="text-[11px] font-medium text-zinc-400 block">{cand1.name} (Projeção)</span>
          <div className="flex items-baseline justify-between">
            <strong className="text-2xl font-bold font-mono text-zinc-100">
              {formatPercentage(cand1ProjectedPct)}
            </strong>
            <span className="text-xs text-zinc-400 font-mono">{formatNumber(cand1ProjectedTotal)} votos</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
          <span className="text-[11px] font-medium text-zinc-400 block">{cand2.name} (Projeção)</span>
          <div className="flex items-baseline justify-between">
            <strong className="text-2xl font-bold font-mono text-zinc-300">
              {formatPercentage(cand2ProjectedPct)}
            </strong>
            <span className="text-xs text-zinc-400 font-mono">{formatNumber(cand2ProjectedTotal)} votos</span>
          </div>
        </div>
      </div>
    </div>
  )
}
