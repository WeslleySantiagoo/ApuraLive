import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapPin, ZoomIn, ZoomOut, RotateCcw, X, Eye, CheckCircle2 } from 'lucide-react'
import { formatNumber, formatPercentage } from '../../utils/formatters'
import { NormalizedElectionResult } from '../../types/results'

interface ResultsMapProps {
  statesResults?: NormalizedElectionResult[]
  onSelectState?: (uf: string) => void
  selectedState?: string | null
}

export function ResultsMap({ statesResults = [], onSelectState }: ResultsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const isLoadedRef = useRef(false)
  const [hoveredState, setHoveredState] = useState<any | null>(null)
  const [popupState, setPopupState] = useState<NormalizedElectionResult | null>(null)
  const [highContrast, setHighContrast] = useState(false)

  // Map state colors and results map by UF
  const statesMap = useRef<Map<string, NormalizedElectionResult>>(new Map())

  useEffect(() => {
    const newMap = new Map<string, NormalizedElectionResult>()
    statesResults.forEach((s) => {
      newMap.set(s.scope.toUpperCase(), s)
    })
    statesMap.current = newMap
  }, [statesResults])

  // Function to apply colors dynamically to MapLibre fill layer without resetting camera
  const updateMapColors = useCallback(() => {
    if (!map.current || !isLoadedRef.current) return
    const currentMap = map.current
    if (!currentMap.getLayer('states-fill')) return

    // Build MapLibre match expression for fill-color based on leading candidate
    // ['match', ['get', 'sigla'], 'SP', '#2563EB', 'BA', '#E53935', '#18181b']
    const colorMatch: any[] = ['match', ['get', 'sigla']]

    statesMap.current.forEach((res, uf) => {
      if (res.candidates && res.candidates.length > 0 && res.candidates[0].votes > 0) {
        const leader = res.candidates[0]
        const isLula = leader.number === '13' || leader.name.toUpperCase().includes('LULA')
        const isBolsonaro = leader.number === '22' || leader.name.toUpperCase().includes('BOLSONARO')
        const color = isLula ? '#E53935' : isBolsonaro ? '#2563EB' : leader.color || '#71717A'
        colorMatch.push(uf, color)
      } else {
        colorMatch.push(uf, '#18181b')
      }
    })

    // Default fallback color
    colorMatch.push('#18181b')

    // Apply color expression without touching camera/zoom/pan
    currentMap.setPaintProperty('states-fill', 'fill-color', colorMatch)
    currentMap.setPaintProperty('states-fill', 'fill-opacity', highContrast ? 0.95 : 0.8)
  }, [highContrast])

  // When statesResults updates, seamlessly update map colors without resetting view
  useEffect(() => {
    updateMapColors()
  }, [statesResults, updateMapColors])

  // Initialize MapLibre ONCE on mount
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {},
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: {
              'background-color': '#09090b',
            },
          },
        ],
      },
      center: [-51.9253, -14.235], // Center of Brazil
      zoom: 3.2,
      minZoom: 2.5,
      maxZoom: 7,
      attributionControl: false,
    })

    map.current = mapInstance

    mapInstance.on('load', async () => {
      isLoadedRef.current = true
      try {
        const resp = await fetch('/maps/brazil-states.json')
        const geojsonData = await resp.json()

        if (!mapInstance.getSource('brazil-states')) {
          mapInstance.addSource('brazil-states', {
            type: 'geojson',
            data: geojsonData,
          })

          mapInstance.addLayer({
            id: 'states-fill',
            type: 'fill',
            source: 'brazil-states',
            paint: {
              'fill-color': '#18181b',
              'fill-opacity': 0.8,
            },
          })

          mapInstance.addLayer({
            id: 'states-borders',
            type: 'line',
            source: 'brazil-states',
            paint: {
              'line-color': '#3f3f46',
              'line-width': 1.2,
            },
          })

          // Hover handler
          mapInstance.on('mousemove', 'states-fill', (e) => {
            if (e.features && e.features.length > 0) {
              const feat = e.features[0]
              const uf = (feat.properties?.sigla || '').toUpperCase()
              const nome = feat.properties?.nome || uf
              const stateData = statesMap.current.get(uf)

              setHoveredState({
                uf,
                nome,
                x: e.point.x,
                y: e.point.y,
                data: stateData,
              })
              mapInstance.getCanvas().style.cursor = 'pointer'
            }
          })

          mapInstance.on('mouseleave', 'states-fill', () => {
            setHoveredState(null)
            mapInstance.getCanvas().style.cursor = ''
          })

          // Click handler to open detailed state modal popup
          mapInstance.on('click', 'states-fill', (e) => {
            if (e.features && e.features.length > 0) {
              const uf = (e.features[0].properties?.sigla || '').toUpperCase()
              const stateData = statesMap.current.get(uf)
              if (stateData) {
                setPopupState(stateData)
              } else {
                setPopupState({
                  scope: uf,
                  scope_name: e.features[0].properties?.nome || uf,
                  updated_at: new Date().toISOString(),
                  status: 'waiting_publication',
                  total_valid_votes: 0,
                  sections: { total: 0, counted: 0, percentage: 0 },
                  candidates: [],
                  remaining_valid_votes_estimate: 0,
                })
              }
              if (onSelectState) onSelectState(uf)
            }
          })

          // Apply initial colors once layer is ready
          updateMapColors()
        }
      } catch (err) {
        console.error('Falha ao carregar malha dos estados:', err)
      }
    })

    return () => {
      mapInstance.remove()
      map.current = null
      isLoadedRef.current = false
    }
  }, [updateMapColors, onSelectState])

  const handleZoomIn = () => map.current?.zoomIn()
  const handleZoomOut = () => map.current?.zoomOut()
  const handleReset = () => {
    map.current?.flyTo({ center: [-51.9253, -14.235], zoom: 3.2 })
    if (onSelectState) onSelectState('')
  }

  return (
    <div className="relative w-full h-[480px] md:h-[550px] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl">
      {/* Map canvas */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Floating Toolbar Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-10 bg-zinc-900/90 backdrop-blur p-1 rounded-xl border border-zinc-800 shadow-lg">
        <button
          onClick={handleZoomIn}
          className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition"
          title="Aproximar zoom"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition"
          title="Afastar zoom"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition"
          title="Resetar visualização"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => setHighContrast(!highContrast)}
          className={`p-2 rounded-lg transition ${
            highContrast ? 'text-zinc-100 bg-zinc-800' : 'text-zinc-400 hover:text-white'
          }`}
          title="Modo alto contraste"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-zinc-900/95 backdrop-blur p-3.5 rounded-xl border border-zinc-800 shadow-xl text-xs space-y-2">
        <div className="flex items-center justify-between gap-4">
          <span className="font-semibold text-zinc-200">Liderança por Estado</span>
          <span className="text-[10px] text-zinc-400 border border-zinc-700/60 px-1.5 py-0.5 rounded">
            Atualização Contínua
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#E53935] shadow-sm"></span>
            <span className="text-zinc-300 font-medium">Lula (13)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#2563EB] shadow-sm"></span>
            <span className="text-zinc-300 font-medium">Flávio Bolsonaro (22)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#18181b] border border-zinc-700"></span>
            <span className="text-zinc-500">Sem Apuração</span>
          </div>
        </div>
      </div>

      {/* Hover Tooltip com dados rápidos */}
      {hoveredState && !popupState && (
        <div
          className="absolute z-20 pointer-events-none bg-zinc-900/95 border border-zinc-700 p-3 rounded-xl shadow-2xl text-xs text-white -translate-x-1/2 -translate-y-full mb-3 min-w-[180px]"
          style={{ left: hoveredState.x, top: hoveredState.y }}
        >
          <div className="flex items-center gap-1.5 font-bold border-b border-zinc-800 pb-1.5 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
            <span>
              {hoveredState.nome} ({hoveredState.uf})
            </span>
          </div>
          {hoveredState.data && hoveredState.data.candidates?.length > 0 ? (
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-zinc-400">Totalizado:</span>
                <strong className="text-zinc-200 font-mono">
                  {formatPercentage(hoveredState.data.sections.percentage)}
                </strong>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span style={{ color: hoveredState.data.candidates[0].color }}>
                  {hoveredState.data.candidates[0].name.split(' ')[0]}:
                </span>
                <strong className="font-mono" style={{ color: hoveredState.data.candidates[0].color }}>
                  {formatPercentage(hoveredState.data.candidates[0].percentage)}
                </strong>
              </div>
              {hoveredState.data.candidates[1] && (
                <div className="flex justify-between items-center text-[11px]">
                  <span style={{ color: hoveredState.data.candidates[1].color }}>
                    {hoveredState.data.candidates[1].name.split(' ')[0]}:
                  </span>
                  <strong className="font-mono" style={{ color: hoveredState.data.candidates[1].color }}>
                    {formatPercentage(hoveredState.data.candidates[1].percentage)}
                  </strong>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-zinc-400">Clique para ver detalhes</p>
          )}
        </div>
      )}

      {/* Popup / Modal Detalhado do Estado Clicado */}
      {popupState && (
        <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono font-bold text-sm">
                  {popupState.scope}
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100 leading-tight">
                    {popupState.scope_name || popupState.scope}
                  </h3>
                  <span className="text-xs text-zinc-400">Totalização Oficial Estadual</span>
                </div>
              </div>
              <button
                onClick={() => setPopupState(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sections Progress */}
            <div className="space-y-2 bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 text-xs">
              <div className="flex justify-between text-zinc-300">
                <span>Progresso das Seções:</span>
                <strong className="text-zinc-100 font-mono">
                  {formatPercentage(popupState.sections.percentage)}
                </strong>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-zinc-500 to-zinc-200 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, popupState.sections.percentage))}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-zinc-500 pt-1 font-mono">
                <span>Apuradas: {formatNumber(popupState.sections.counted)}</span>
                <span>Total: {formatNumber(popupState.sections.total)}</span>
              </div>
            </div>

            {/* Candidate Breakdown */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-zinc-300 block">Votação Nominal:</span>
              {popupState.candidates && popupState.candidates.length > 0 ? (
                popupState.candidates.map((cand, idx) => {
                  const isLula = cand.number === '13' || cand.name.toUpperCase().includes('LULA')
                  const isBolsonaro = cand.number === '22' || cand.name.toUpperCase().includes('BOLSONARO')
                  const color = isLula ? '#E53935' : isBolsonaro ? '#2563EB' : cand.color
                  const photo = isLula ? '/candidates/lula.jpg' : isBolsonaro ? '/candidates/flavio-bolsonaro.jpg' : cand.photo_url

                  return (
                    <div
                      key={cand.id}
                      className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg overflow-hidden border shrink-0 bg-zinc-900"
                          style={{ borderColor: color }}
                        >
                          {photo ? (
                            <img src={photo} alt={cand.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-xs" style={{ color }}>
                              {cand.number}
                            </div>
                          )}
                        </div>
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

                      <div className="text-right">
                        <strong className="text-base font-bold font-mono" style={{ color }}>
                          {formatPercentage(cand.percentage)}
                        </strong>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-center text-xs text-zinc-500">
                  Totalização ainda não iniciada para este estado.
                </div>
              )}
            </div>

            {/* Total Valid Votes */}
            <div className="pt-2 flex justify-between items-center text-xs text-zinc-400 border-t border-zinc-800">
              <span>Total de Votos Válidos:</span>
              <strong className="text-zinc-200 font-mono">{formatNumber(popupState.total_valid_votes)}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
