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

    map.current.on('load', async () => {
      if (!map.current) return

      try {
        const resp = await fetch('/maps/brazil-states.json')
        const geojsonData = await resp.json()

        map.current.addSource('brazil-states', {
          type: 'geojson',
          data: geojsonData,
        })

        // Base neutral fill layer for states
        map.current.addLayer({
          id: 'states-fill',
          type: 'fill',
          source: 'brazil-states',
          paint: {
            'fill-color': '#18181b',
            'fill-opacity': 0.85,
          },
        })

        // Stroke borders
        map.current.addLayer({
          id: 'states-borders',
          type: 'line',
          source: 'brazil-states',
          paint: {
            'line-color': '#3f3f46',
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
    <div className="relative w-full h-[450px] md:h-[520px] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl">
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
          title="Modo alto contraste / acessibilidade"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Legend Imparcial */}
      <div className="absolute bottom-4 left-4 z-10 bg-zinc-900/95 backdrop-blur p-4 rounded-xl border border-zinc-800 shadow-xl text-xs space-y-2">
        <span className="font-semibold text-zinc-300 block">Identificação por Estado</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-zinc-100 border border-zinc-300"></span>
            <span className="text-zinc-300 font-medium">Lula (13)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-zinc-400 border border-zinc-500"></span>
            <span className="text-zinc-300 font-medium">Flávio Bolsonaro (22)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-zinc-800 border border-zinc-700"></span>
            <span className="text-zinc-500">Aguardando</span>
          </div>
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredState && (
        <div
          className="absolute z-20 pointer-events-none bg-zinc-900/95 border border-zinc-700 p-3 rounded-lg shadow-2xl text-xs text-white -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: hoveredState.x, top: hoveredState.y }}
        >
          <div className="flex items-center gap-1.5 font-bold">
            <MapPin className="w-3.5 h-3.5 text-zinc-300" />
            <span>
              {hoveredState.nome} ({hoveredState.uf})
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Clique para ver detalhes e municípios deste estado
          </p>
        </div>
      )}
    </div>
  )
}
