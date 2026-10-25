import { useState, useEffect } from 'react'
import { fetchRegionalResults } from '../../services/api'
import { formatNumber, formatPercentage } from '../../utils/formatters'
import { Globe2 } from 'lucide-react'

interface RegionSelectorProps {
  onSelectRegion?: (region: string) => void
  selectedRegion?: string | null
}

export function RegionSelector({ onSelectRegion, selectedRegion }: RegionSelectorProps) {
  const [regionsData, setRegionsData] = useState<Record<string, any>>({})

  useEffect(() => {
    fetchRegionalResults()
      .then((data) => setRegionsData(data))
      .catch(() => {})
  }, [])

  const regions = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul']

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Globe2 className="w-4 h-4 text-zinc-400" />
        <h3 className="text-sm font-bold text-zinc-100">Visualização por Regiões do Brasil</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {regions.map((reg) => {
          const rData = regionsData[reg]
          const isSelected = selectedRegion === reg
          const cands = rData?.candidates || []
          const leader = cands.length > 0 ? cands[0] : null

          return (
            <button
              key={reg}
              onClick={() => onSelectRegion && onSelectRegion(isSelected ? '' : reg)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-zinc-800 border-zinc-500 shadow-md shadow-black/40'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-zinc-100">{reg}</span>
                {rData?.sections_percentage !== undefined && (
                  <span className="text-[10px] font-mono text-zinc-400">
                    {formatPercentage(rData.sections_percentage, 1)}
                  </span>
                )}
              </div>

              {leader && leader.votes > 0 ? (
                <div className="mt-3 pt-2.5 border-t border-zinc-800">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-zinc-300 truncate max-w-[100px]">
                      {leader.name}
                    </span>
                    <strong className="font-mono text-zinc-100">
                      {formatPercentage(leader.percentage)}
                    </strong>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 block mt-0.5">
                    {formatNumber(leader.votes)} votos
                  </span>
                </div>
              ) : (
                <div className="mt-2 text-[10px] text-zinc-500">
                  Aguardando totalização
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
