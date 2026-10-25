import { useState, useEffect } from 'react'
import { fetchRegionalResults } from '../../services/api'
import { formatNumber, formatPercentage } from '../../utils/formatters'
import { Globe2, Layers, CheckCircle2, X } from 'lucide-react'

interface RegionSelectorProps {
  onSelectRegion?: (region: string) => void
  selectedRegion?: string | null
}

export function RegionSelector({ onSelectRegion, selectedRegion }: RegionSelectorProps) {
  const [regionsData, setRegionsData] = useState<Record<string, any>>({})
  const [activeSidebarRegion, setActiveSidebarRegion] = useState<string | null>(null)

  useEffect(() => {
    fetchRegionalResults()
      .then((data) => setRegionsData(data))
      .catch(() => {})
  }, [])

  const regions = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul']

  const handleCardClick = (reg: string) => {
    setActiveSidebarRegion(reg)
    if (onSelectRegion) onSelectRegion(reg)
  }

  const selectedRegionData = activeSidebarRegion ? regionsData[activeSidebarRegion] : null
  const sectionsCounted = selectedRegionData?.sections_counted || 0
  const sectionsTotal = selectedRegionData?.sections_total || 0
  const sectionsRemaining = Math.max(0, sectionsTotal - sectionsCounted)
  const sectionsPct = sectionsTotal > 0 ? (sectionsCounted / sectionsTotal) * 100 : 0
  const remainingPct = 100 - sectionsPct

  return (
    <div className="space-y-3 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-zinc-400" />
          <h3 className="text-sm font-bold text-zinc-100">Visualização por Regiões do Brasil</h3>
        </div>
        <span className="text-[11px] text-zinc-400">Clique em uma região para abrir a barra de progresso detalhada</span>
      </div>

      {/* Grid de Cards por Região */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {regions.map((reg) => {
          const rData = regionsData[reg]
          const isSelected = selectedRegion === reg || activeSidebarRegion === reg
          const cands = rData?.candidates || []
          const leader = cands.length > 0 ? cands[0] : null

          return (
            <button
              key={reg}
              onClick={() => handleCardClick(reg)}
              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-zinc-800 border-zinc-400 shadow-xl shadow-black/50 ring-1 ring-zinc-400'
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

              {/* Mini progress bar on card */}
              <div className="mt-3 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-300 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, rData?.sections_percentage || 0))}%` }}
                />
              </div>
            </button>
          )
        })}
      </div>

      {/* Sidebar / Painel Lateral de Progresso da Região */}
      {activeSidebarRegion && selectedRegionData && (
        <div className="bg-zinc-900/90 border border-zinc-700 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-700">
                <Layers className="w-5 h-5 text-zinc-300" />
              </div>
              <div>
                <h4 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  Região {activeSidebarRegion}
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {formatPercentage(sectionsPct, 1)} apurado
                  </span>
                </h4>
                <p className="text-xs text-zinc-400">Totalização de urnas e apuração em tempo real</p>
              </div>
            </div>
            <button
              onClick={() => setActiveSidebarRegion(null)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              title="Fechar painel da região"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Barra de Progresso Urnas Apuradas vs Faltantes */}
          <div className="space-y-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-zinc-200">Progresso de Urnas da Região {activeSidebarRegion}:</span>
              <span className="font-mono text-zinc-400">{formatNumber(sectionsCounted)} / {formatNumber(sectionsTotal)} urnas</span>
            </div>

            {/* Visual Progress Bar com divisão clara */}
            <div className="w-full bg-zinc-800 h-4 rounded-full overflow-hidden flex p-0.5 border border-zinc-700">
              <div
                className="h-full bg-gradient-to-r from-zinc-400 to-zinc-100 rounded-l-full transition-all duration-700"
                style={{ width: `${sectionsPct}%` }}
                title={`Urnas apuradas: ${formatPercentage(sectionsPct)}`}
              />
              <div
                className="h-full bg-zinc-800 rounded-r-full transition-all duration-700"
                style={{ width: `${remainingPct}%` }}
                title={`Urnas faltantes: ${formatPercentage(remainingPct)}`}
              />
            </div>

            {/* Legenda de Apuradas vs Faltantes */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-300 font-medium text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-200"></span>
                  <span>Urnas Apuradas</span>
                </div>
                <strong className="text-base font-bold font-mono text-zinc-100 block mt-1">
                  {formatNumber(sectionsCounted)}
                </strong>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {formatPercentage(sectionsPct)} do total regional
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-400 font-medium text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-700"></span>
                  <span>Urnas Faltantes</span>
                </div>
                <strong className="text-base font-bold font-mono text-zinc-300 block mt-1">
                  {formatNumber(sectionsRemaining)}
                </strong>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {formatPercentage(remainingPct)} a totalizar
                </span>
              </div>
            </div>
          </div>

          {/* Placar Regional dos Candidatos */}
          {selectedRegionData.candidates && selectedRegionData.candidates.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-300 block">Votação na Região {activeSidebarRegion}:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedRegionData.candidates.map((cand: any, idx: number) => {
                  const isLula = cand.number === '13' || cand.name?.toUpperCase().includes('LULA')
                  const isBolsonaro = cand.number === '22' || cand.name?.toUpperCase().includes('BOLSONARO')
                  const color = isLula ? '#E53935' : isBolsonaro ? '#2563EB' : cand.color || '#71717A'
                  const photo = isLula ? '/candidates/lula.jpg' : isBolsonaro ? '/candidates/flavio-bolsonaro.jpg' : null

                  return (
                    <div
                      key={cand.id}
                      className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3 border-l-4"
                      style={{ borderLeftColor: color }}
                    >
                      <div className="flex items-center gap-3">
                        {photo && (
                          <img
                            src={photo}
                            alt={cand.name}
                            className="w-10 h-10 rounded-lg object-cover border border-zinc-700 shrink-0"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-zinc-100">{cand.name}</span>
                            {idx === 0 && cand.votes > 0 && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300" />
                            )}
                          </div>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            {formatNumber(cand.votes)} votos
                          </span>
                        </div>
                      </div>

                      <strong className="text-lg font-bold font-mono" style={{ color }}>
                        {formatPercentage(cand.percentage)}
                      </strong>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
