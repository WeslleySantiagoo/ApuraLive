import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapPin, ZoomIn, ZoomOut, RotateCcw, Eye } from 'lucide-react'

interface ResultsMapProps {
  statesResults?: Record<string, any>
  onSelectState?: (uf: string) => void
  selectedState?: string | null
}

export function ResultsMap({ statesResults: _statesResults, onSelectState, selectedState }: ResultsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [hoveredState, setHoveredState] = useState<any | null>(null)
  const [highContrast, setHighContrast] = useState(false)

  // Fly to selected state if updated
  useEffect(() => {
    if (selectedState && map.current) {
      // MapLibre animation for focused state
    }
  }, [selectedState])

  useEffect(() => {
    if (!mapContainer.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {},
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: {
              'background-color': '#030712',
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

    map.current.on('load', async () => {
      if (!map.current) return

      try {
        const resp = await fetch('/maps/brazil-states.json')
        const geojsonData = await resp.json()

        map.current.addSource('brazil-states', {
          type: 'geojson',
          data: geojsonData,
        })

        // Base fill layer for states
        map.current.addLayer({
          id: 'states-fill',
          type: 'fill',
          source: 'brazil-states',
          paint: {
            'fill-color': '#1e293b',
            'fill-opacity': 0.75,
          },
        })

        // Stroke borders
        map.current.addLayer({
          id: 'states-borders',
          type: 'line',
          source: 'brazil-states',
          paint: {
            'line-color': '#475569',
            'line-width': 1.2,
          },
        })

        // Hover effect
        map.current.on('mousemove', 'states-fill', (e) => {
          if (e.features && e.features.length > 0) {
            const feat = e.features[0]
            const uf = feat.properties?.sigla
            const nome = feat.properties?.nome
            setHoveredState({ uf, nome, x: e.point.x, y: e.point.y })
            if (map.current) map.current.getCanvas().style.cursor = 'pointer'
          }
        })

        map.current.on('mouseleave', 'states-fill', () => {
          setHoveredState(null)
          if (map.current) map.current.getCanvas().style.cursor = ''
        })

        map.current.on('click', 'states-fill', (e) => {
          if (e.features && e.features.length > 0) {
            const uf = e.features[0].properties?.sigla
            if (uf && onSelectState) onSelectState(uf)
          }
        })
      } catch (err) {
        console.error('Falha ao carregar malha dos estados:', err)
      }
    })

    return () => {
      map.current?.remove()
    }
  }, [onSelectState])

  const handleZoomIn = () => map.current?.zoomIn()
  const handleZoomOut = () => map.current?.zoomOut()
  const handleReset = () => {
    map.current?.flyTo({ center: [-51.9253, -14.235], zoom: 3.2 })
    if (onSelectState) onSelectState('')
  }

  return (
    <div className="relative w-full h-[450px] md:h-[520px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      {/* Map canvas */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Floating Toolbar Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-10 bg-slate-900/90 backdrop-blur p-1 rounded-xl border border-slate-700/80 shadow-lg">
        <button
          onClick={handleZoomIn}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
          title="Aproximar zoom"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
          title="Afastar zoom"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
          title="Resetar visualização"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => setHighContrast(!highContrast)}
          className={`p-2 rounded-lg transition ${
            highContrast ? 'text-amber-400 bg-slate-800' : 'text-slate-400 hover:text-white'
          }`}
          title="Modo alto contraste / acessibilidade"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur p-3.5 rounded-xl border border-slate-800 shadow-lg text-xs space-y-2">
        <span className="font-semibold text-slate-300 block">Liderança por Estado</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#E53935] shadow-sm"></span>
            <span className="text-slate-300 font-medium">Lula (13)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#2563EB] shadow-sm"></span>
            <span className="text-slate-300 font-medium">Flávio Bolsonaro (22)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#334155] border border-slate-600"></span>
            <span className="text-slate-400">Aguardando</span>
          </div>
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredState && (
        <div
          className="absolute z-20 pointer-events-none bg-slate-900/95 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs text-white -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: hoveredState.x, top: hoveredState.y }}
        >
          <div className="flex items-center gap-1.5 font-bold">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            <span>
              {hoveredState.nome} ({hoveredState.uf})
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Clique para ver detalhes e municípios deste estado
          </p>
        </div>
      )}
    </div>
  )
}
