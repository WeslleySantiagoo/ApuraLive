import { useEffect, useRef, useState, useCallback, memo } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapPin, ZoomIn, ZoomOut, RotateCcw, X, Eye, CheckCircle2, Layers } from 'lucide-react'
import { formatNumber, formatPercentage } from '../../utils/formatters'
import { NormalizedElectionResult } from '../../types/results'
import { getDivergingColor } from '../../utils/colors'
import { getMunicipalResult, MunicipalResultData } from '../../utils/municipalityData'
import { getVisibleUfs } from '../../utils/geoBounds'

interface ResultsMapProps {
  statesResults?: NormalizedElectionResult[]
  onSelectState?: (uf: string) => void
  selectedState?: string | null
}

const MUNICIPAL_ZOOM_THRESHOLD = 5.8

export const ResultsMap = memo(function ResultsMap({ statesResults = [], onSelectState }: ResultsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const isLoadedRef = useRef(false)
  const [currentZoom, setCurrentZoom] = useState(3.2)
  const [hoveredEntity, setHoveredEntity] = useState<any | null>(null)
  const [popupState, setPopupState] = useState<NormalizedElectionResult | null>(null)
  const [popupCity, setPopupCity] = useState<MunicipalResultData | null>(null)
  const [highContrast, setHighContrast] = useState(false)

  // Cache by UF
  const statesMap = useRef<Map<string, NormalizedElectionResult>>(new Map())
  const lastStateColorKey = useRef<string>('')
  const loadedUfsRef = useRef<Set<string>>(new Set())
  const municipalFeaturesRef = useRef<Map<string, any>>(new Map()) // ibgeId -> GeoJSON Feature
  const isUpdatingMunicipalities = useRef<boolean>(false)

  useEffect(() => {
    const newMap = new Map<string, NormalizedElectionResult>()
    statesResults.forEach((s) => {
      newMap.set(s.scope.toUpperCase(), s)
    })
    statesMap.current = newMap
  }, [statesResults])

  // Update State Colors with the new Diverging Color Scale (Red <-> Gray <-> Blue)
  const updateStateColors = useCallback(() => {
    if (!map.current || !isLoadedRef.current) return
    const currentMap = map.current
    if (!currentMap.getLayer('states-fill')) return

    let signature = ''
    const colorMatch: any[] = ['match', ['get', 'sigla']]

    statesMap.current.forEach((res, uf) => {
      let lulaPct = 0
      let bolsonaroPct = 0
      const hasVotes = res.candidates && res.candidates.length > 0 && res.total_valid_votes > 0

      if (hasVotes) {
        res.candidates.forEach((c) => {
          const isLula = c.number === '13' || c.name.toUpperCase().includes('LULA')
          const isBolsonaro = c.number === '22' || c.name.toUpperCase().includes('BOLSONARO')
          if (isLula) lulaPct = c.percentage
          if (isBolsonaro) bolsonaroPct = c.percentage
        })
      }

      const color = getDivergingColor(lulaPct, bolsonaroPct, !!hasVotes)
      colorMatch.push(uf, color)
      signature += `${uf}:${color};`
    })

    colorMatch.push('#18181b')
    signature += `hc:${highContrast}`

    if (signature === lastStateColorKey.current) return
    lastStateColorKey.current = signature

    currentMap.setPaintProperty('states-fill', 'fill-color', colorMatch)
    currentMap.setPaintProperty('states-fill', 'fill-opacity', highContrast ? 0.95 : 0.82)
  }, [highContrast])

  // Refresh colors on state data changes
  useEffect(() => {
    updateStateColors()
  }, [statesResults, updateStateColors])

  // Carrega municípios para UFs visíveis quando o zoom >= MUNICIPAL_ZOOM_THRESHOLD
  const loadMunicipalitiesForViewport = useCallback(async () => {
    if (!map.current || !isLoadedRef.current) return
    const currentMap = map.current
    const zoom = currentMap.getZoom()
    if (zoom < MUNICIPAL_ZOOM_THRESHOLD) return

    if (isUpdatingMunicipalities.current) return
    isUpdatingMunicipalities.current = true

    try {
      const bounds = currentMap.getBounds()
      const west = bounds.getWest()
      const south = bounds.getSouth()
      const east = bounds.getEast()
      const north = bounds.getNorth()

      const visibleUfs = getVisibleUfs(west, south, east, north)
      const ufsToFetch = visibleUfs.filter((uf) => !loadedUfsRef.current.has(uf))

      if (ufsToFetch.length > 0) {
        await Promise.all(
          ufsToFetch.map(async (uf) => {
            try {
              const res = await fetch(`/maps/by-uf/${uf}.json`)
              if (!res.ok) return
              const data = await res.json()
              loadedUfsRef.current.add(uf)
              data.features.forEach((feat: any) => {
                feat.properties.uf = uf
                municipalFeaturesRef.current.set(feat.properties.id, feat)
              })
            } catch (err) {
              console.warn(`Erro ao carregar cidades de ${uf}:`, err)
            }
          })
        )

        // Atualizar o source GeoJSON de municípios
        const source = currentMap.getSource('brazil-municipalities') as maplibregl.GeoJSONSource
        if (source) {
          const allFeatures = Array.from(municipalFeaturesRef.current.values())
          source.setData({
            type: 'FeatureCollection',
            features: allFeatures,
          })
          updateMunicipalColors()
        }
      }
    } finally {
      isUpdatingMunicipalities.current = false
    }
  }, [])

  // Atualizar cores dos municípios baseados na escala divergente
  const updateMunicipalColors = useCallback(() => {
    if (!map.current || !isLoadedRef.current) return
    const currentMap = map.current
    if (!currentMap.getLayer('municipalities-fill')) return

    const colorMatch: any[] = ['match', ['get', 'id']]
    let hasEntries = false

    municipalFeaturesRef.current.forEach((feat, id) => {
      const uf = feat.properties.uf || ''
      const name = feat.properties.name || ''
      const stateResult = statesMap.current.get(uf)
      const cityData = getMunicipalResult(id, name, uf, stateResult)
      colorMatch.push(id, cityData.fillColor)
      hasEntries = true
    })

    if (!hasEntries) return
    colorMatch.push('#27272a') // fallback neutro

    currentMap.setPaintProperty('municipalities-fill', 'fill-color', colorMatch)
    currentMap.setPaintProperty('municipalities-fill', 'fill-opacity', highContrast ? 0.95 : 0.85)
  }, [highContrast])

  // Re-aplicar cores municipais quando os dados dos estados mudam
  useEffect(() => {
    if (currentZoom >= MUNICIPAL_ZOOM_THRESHOLD) {
      updateMunicipalColors()
    }
  }, [statesResults, currentZoom, updateMunicipalColors])

  // Inicialização Única do MapLibre
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
      center: [-51.9253, -14.235], // Centro do Brasil
      zoom: 3.2,
      minZoom: 2.5,
      maxZoom: 12,
      attributionControl: false,
    })

    map.current = mapInstance

    mapInstance.on('load', async () => {
      isLoadedRef.current = true

      try {
        // 1. Carrega malha estadual
        const respStates = await fetch('/maps/brazil-states.json')
        const statesData = await respStates.json()

        mapInstance.addSource('brazil-states', {
          type: 'geojson',
          data: statesData,
        })

        // Layer de preenchimento dos estados (visível em zoom < 5.8)
        mapInstance.addLayer({
          id: 'states-fill',
          type: 'fill',
          source: 'brazil-states',
          maxzoom: MUNICIPAL_ZOOM_THRESHOLD,
          paint: {
            'fill-color': '#18181b',
            'fill-opacity': 0.82,
          },
        })

        // Bordas dos estados
        mapInstance.addLayer({
          id: 'states-borders',
          type: 'line',
          source: 'brazil-states',
          paint: {
            'line-color': '#52525b',
            'line-width': ['interpolate', ['linear'], ['zoom'], 3, 1.0, 7, 2.0],
          },
        })

        // 2. Cria fonte e layers de municípios (visíveis a partir de zoom >= 5.8)
        mapInstance.addSource('brazil-municipalities', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        })

        mapInstance.addLayer({
          id: 'municipalities-fill',
          type: 'fill',
          source: 'brazil-municipalities',
          minzoom: MUNICIPAL_ZOOM_THRESHOLD,
          paint: {
            'fill-color': '#27272a',
            'fill-opacity': 0.85,
          },
        })

        mapInstance.addLayer({
          id: 'municipalities-borders',
          type: 'line',
          source: 'brazil-municipalities',
          minzoom: MUNICIPAL_ZOOM_THRESHOLD,
          paint: {
            'line-color': '#3f3f46',
            'line-width': 0.6,
          },
        })

        // --- Eventos de Interação Estados ---
        mapInstance.on('mousemove', 'states-fill', (e) => {
          if (mapInstance.getZoom() >= MUNICIPAL_ZOOM_THRESHOLD) return
          if (e.features && e.features.length > 0) {
            const feat = e.features[0]
            const uf = (feat.properties?.sigla || '').toUpperCase()
            const nome = feat.properties?.nome || uf
            const stateData = statesMap.current.get(uf)

            setHoveredEntity({
              type: 'state',
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
          if (mapInstance.getZoom() < MUNICIPAL_ZOOM_THRESHOLD) {
            setHoveredEntity(null)
            mapInstance.getCanvas().style.cursor = ''
          }
        })

        mapInstance.on('click', 'states-fill', (e) => {
          if (mapInstance.getZoom() >= MUNICIPAL_ZOOM_THRESHOLD) return
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

        // --- Eventos de Interação Municípios ---
        mapInstance.on('mousemove', 'municipalities-fill', (e) => {
          if (mapInstance.getZoom() < MUNICIPAL_ZOOM_THRESHOLD) return
          if (e.features && e.features.length > 0) {
            const feat = e.features[0]
            const id = feat.properties?.id
            const name = feat.properties?.name || ''
            const uf = feat.properties?.uf || ''
            const stateResult = statesMap.current.get(uf)
            const cityData = getMunicipalResult(id, name, uf, stateResult)

            setHoveredEntity({
              type: 'city',
              uf,
              nome: name,
              x: e.point.x,
              y: e.point.y,
              cityData,
            })
            mapInstance.getCanvas().style.cursor = 'pointer'
          }
        })

        mapInstance.on('mouseleave', 'municipalities-fill', () => {
          if (mapInstance.getZoom() >= MUNICIPAL_ZOOM_THRESHOLD) {
            setHoveredEntity(null)
            mapInstance.getCanvas().style.cursor = ''
          }
        })

        mapInstance.on('click', 'municipalities-fill', (e) => {
          if (mapInstance.getZoom() < MUNICIPAL_ZOOM_THRESHOLD) return
          if (e.features && e.features.length > 0) {
            const feat = e.features[0]
            const id = feat.properties?.id
            const name = feat.properties?.name || ''
            const uf = feat.properties?.uf || ''
            const stateResult = statesMap.current.get(uf)
            const cityData = getMunicipalResult(id, name, uf, stateResult)
            setPopupCity(cityData)
          }
        })

        // Eventos de Câmera / Zoom
        mapInstance.on('zoom', () => {
          const z = mapInstance.getZoom()
          setCurrentZoom(z)
        })

        mapInstance.on('moveend', () => {
          loadMunicipalitiesForViewport()
        })

        updateStateColors()
      } catch (err) {
        console.error('Falha ao inicializar o mapa:', err)
      }
    })

    return () => {
      mapInstance.remove()
      map.current = null
      isLoadedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Disparar carga de municípios se o zoom entrar no nível municipal
  useEffect(() => {
    if (currentZoom >= MUNICIPAL_ZOOM_THRESHOLD) {
      loadMunicipalitiesForViewport()
    }
  }, [currentZoom, loadMunicipalitiesForViewport])

  const handleZoomIn = () => map.current?.zoomIn()
  const handleZoomOut = () => map.current?.zoomOut()
  const handleReset = () => {
    map.current?.flyTo({ center: [-51.9253, -14.235], zoom: 3.2 })
    if (onSelectState) onSelectState('')
  }

  const isMunicipalView = currentZoom >= MUNICIPAL_ZOOM_THRESHOLD

  return (
    <div className="relative w-full h-[480px] md:h-[550px] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl">
      {/* Map canvas */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Indicador de Camada Ativa */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-zinc-900/90 backdrop-blur px-3 py-1.5 rounded-xl border border-zinc-800 shadow-lg text-xs font-medium text-zinc-300">
        <Layers className="w-4 h-4 text-zinc-400" />
        <span>Divisão: </span>
        <strong className={isMunicipalView ? 'text-blue-400' : 'text-zinc-100'}>
          {isMunicipalView ? 'Municipal (Cidades)' : 'Estadual (UFs)'}
        </strong>
        <span className="text-[10px] text-zinc-500 font-mono ml-1">
          {isMunicipalView ? '(Zoom Alto)' : '(Aproxime para cidades)'}
        </span>
      </div>

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

      {/* Floating Legend: Escala Tricolor Divergente */}
      <div className="absolute bottom-4 left-4 z-10 bg-zinc-900/95 backdrop-blur p-3.5 rounded-xl border border-zinc-800 shadow-xl text-xs space-y-2">
        <div className="flex items-center justify-between gap-4">
          <span className="font-semibold text-zinc-200">
            {isMunicipalView ? 'Liderança por Município' : 'Liderança por Estado'}
          </span>
          <span className="text-[11px] text-zinc-400">Escala de Intensidade</span>
        </div>

        {/* Gradiente Divergente: Vermelho <-> Cinza <-> Azul */}
        <div className="space-y-1">
          <div
            className="w-full h-3 rounded-md shadow-inner border border-zinc-700/60"
            style={{
              background: 'linear-gradient(to right, #E53935 0%, #3f3f46 50%, #2563EB 100%)',
            }}
          />
          <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono">
            <span className="text-red-400 font-semibold">Lula (+vantagem)</span>
            <span className="text-zinc-300">50% Neutro</span>
            <span className="text-blue-400 font-semibold">Flávio (+vantagem)</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1 border-t border-zinc-800/80 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E53935]" />
            <span className="text-zinc-300 font-medium">Lula (13)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3f3f46]" />
            <span className="text-zinc-400">Empate (50%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
            <span className="text-zinc-300 font-medium">Flávio (22)</span>
          </div>
        </div>
      </div>

      {/* Hover Tooltip com dados rápidos (Estados ou Municípios) */}
      {hoveredEntity && !popupState && !popupCity && (
        <div
          className="absolute z-20 pointer-events-none bg-zinc-900/95 border border-zinc-700 p-3 rounded-xl shadow-2xl text-xs text-white -translate-x-1/2 -translate-y-full mb-3 min-w-[190px]"
          style={{ left: hoveredEntity.x, top: hoveredEntity.y }}
        >
          {hoveredEntity.type === 'state' ? (
            <>
              <div className="flex items-center gap-1.5 font-bold border-b border-zinc-800 pb-1.5 mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                <span>
                  {hoveredEntity.nome} ({hoveredEntity.uf})
                </span>
              </div>
              {hoveredEntity.data && hoveredEntity.data.candidates?.length > 0 ? (
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-400">Totalizado:</span>
                    <strong className="text-zinc-200 font-mono">
                      {formatPercentage(hoveredEntity.data.sections.percentage)}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-red-400 font-medium">Lula:</span>
                    <strong className="font-mono text-red-400">
                      {formatPercentage(
                        hoveredEntity.data.candidates.find((c: any) => c.number === '13')?.percentage || 0
                      )}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-blue-400 font-medium">Flávio:</span>
                    <strong className="font-mono text-blue-400">
                      {formatPercentage(
                        hoveredEntity.data.candidates.find((c: any) => c.number === '22')?.percentage || 0
                      )}
                    </strong>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-zinc-400">Clique para ver detalhes</p>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 mb-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>{hoveredEntity.nome}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1 rounded">
                  {hoveredEntity.uf}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-zinc-400">Seções Apuradas:</span>
                  <strong className="text-zinc-200 font-mono">
                    {formatPercentage(hoveredEntity.cityData?.sections_percentage || 0)}
                  </strong>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-red-400 font-medium">Lula:</span>
                  <strong className="font-mono text-red-400">
                    {formatPercentage(hoveredEntity.cityData?.lula.percentage || 0)}
                  </strong>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-blue-400 font-medium">Flávio:</span>
                  <strong className="font-mono text-blue-400">
                    {formatPercentage(hoveredEntity.cityData?.bolsonaro.percentage || 0)}
                  </strong>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal Detalhado do Município Clicado */}
      {popupCity && (
        <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-950/60 text-blue-300 border border-blue-800/80 font-mono font-bold text-sm">
                  {popupCity.uf}
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100 leading-tight">{popupCity.name}</h3>
                  <span className="text-xs text-zinc-400">Totalização Municipal</span>
                </div>
              </div>
              <button
                onClick={() => setPopupCity(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progresso das Seções da Cidade */}
            <div className="space-y-2 bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 text-xs">
              <div className="flex justify-between text-zinc-300">
                <span>Progresso das Urnas no Município:</span>
                <strong className="text-zinc-100 font-mono">
                  {formatPercentage(popupCity.sections_percentage)}
                </strong>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-zinc-500 to-zinc-200 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, popupCity.sections_percentage))}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-zinc-500 pt-1 font-mono">
                <span>Apuradas: {formatNumber(popupCity.sections_counted)}</span>
                <span>Total: {formatNumber(popupCity.sections_total)} seções</span>
              </div>
            </div>

            {/* Votação Nominal dos Candidatos no Município */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-zinc-300 block">Votação Local:</span>

              {/* Lula */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border shrink-0 bg-zinc-900 border-[#E53935]">
                    <img src="/candidates/lula.jpg" alt="Lula" className="w-full h-full object-cover object-top" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-zinc-100">LULA</span>
                      {popupCity.lula.votes > popupCity.bolsonaro.votes && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {formatNumber(popupCity.lula.votes)} votos
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <strong className="text-base font-bold font-mono text-[#E53935]">
                    {formatPercentage(popupCity.lula.percentage)}
                  </strong>
                </div>
              </div>

              {/* Flávio Bolsonaro */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border shrink-0 bg-zinc-900 border-[#2563EB]">
                    <img
                      src="/candidates/flavio-bolsonaro.jpg"
                      alt="Flávio Bolsonaro"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-zinc-100">FLÁVIO BOLSONARO</span>
                      {popupCity.bolsonaro.votes > popupCity.lula.votes && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {formatNumber(popupCity.bolsonaro.votes)} votos
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <strong className="text-base font-bold font-mono text-[#2563EB]">
                    {formatPercentage(popupCity.bolsonaro.percentage)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Total de Votos */}
            <div className="pt-2 flex justify-between items-center text-xs text-zinc-400 border-t border-zinc-800">
              <span>Total de Votos Válidos:</span>
              <strong className="text-zinc-200 font-mono">{formatNumber(popupCity.valid_votes)}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Popup / Modal Detalhado do Estado Clicado */}
      {popupState && (
        <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
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
                  const photo = isLula
                    ? '/candidates/lula.jpg'
                    : isBolsonaro
                    ? '/candidates/flavio-bolsonaro.jpg'
                    : cand.photo_url

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
                            <img src={photo} alt={cand.name} className="w-full h-full object-cover object-top" />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center font-bold text-xs"
                              style={{ color }}
                            >
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
})
