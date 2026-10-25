import { useState, useEffect } from 'react'
import { Header } from './components/layout/Header'
import { NationalScoreboard } from './components/dashboard/NationalScoreboard'
import { SectionsProgressBar } from './components/dashboard/SectionsProgressBar'
import { IrreversibilityCard } from './components/dashboard/IrreversibilityCard'
import { ScenarioSimulator } from './components/simulator/ScenarioSimulator'
import { ResultsMap } from './components/maps/ResultsMap'
import { RegionSelector } from './components/maps/RegionSelector'
import { StateRankings } from './components/tables/StateRankings'
import { ExportDialog } from './components/common/ExportDialog'
import { TransparencyModal } from './components/common/TransparencyModal'
import { useResults } from './hooks/useResults'
import { fetchStateResults } from './services/api'
import { NormalizedElectionResult } from './types/results'
import { AlertCircle, Clock, Info, Map as MapIcon } from 'lucide-react'

export default function App() {
  const { data, irreversibility, isRefreshing, error, lastSuccessTime, refetch } = useResults(5000)
  const [statesData, setStatesData] = useState<NormalizedElectionResult[]>([])
  const [isTransparencyOpen, setIsTransparencyOpen] = useState(false)
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  // Polling for state results
  useEffect(() => {
    let isSubscribed = true
    const loadStates = () => {
      fetchStateResults()
        .then((res) => {
          if (isSubscribed && res && res.length > 0) setStatesData(res)
        })
        .catch(() => {})
    }

    loadStates()
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadStates()
      }
    }, 10000)

    return () => {
      isSubscribed = false
      clearInterval(interval)
    }
  }, [])

  const isWaitingPublication = data?.status === 'waiting_publication'

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-200 selection:text-zinc-950">
      {/* Sticky Header */}
      <Header
        status={data?.status || (error ? 'unavailable' : 'loading')}
        sourceUpdatedAt={data?.source_updated_at}
        localUpdatedAt={lastSuccessTime}
        isRefreshing={isRefreshing}
        onRefresh={refetch}
        onOpenTransparency={() => setIsTransparencyOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* Error notification if any */}
        {error && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 flex items-center gap-3 text-zinc-300 text-xs">
            <AlertCircle className="w-5 h-5 text-zinc-400 shrink-0" />
            <div className="flex-1">
              <strong className="font-semibold block text-zinc-100">Aviso de Conexão com o TSE</strong>
              <span>{error}</span>
            </div>
            <button
              onClick={refetch}
              className="px-3 py-1 bg-zinc-100 hover:bg-white text-zinc-950 rounded font-semibold transition"
            >
              Reconectar
            </button>
          </div>
        )}

        {/* State: Waiting official dissemination from TSE */}
        {isWaitingPublication && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center mx-auto border border-zinc-700">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-lg font-bold text-zinc-100">
              Aguardando Publicação Oficial dos Dados pelo TSE
            </h2>
            <p className="text-xs text-zinc-400 max-w-lg mx-auto leading-relaxed">
              Os arquivos de apuração presidencial de 2026 ainda não foram disponibilizados na CDN do Tribunal Superior Eleitoral. A sincronização entrará em ação automaticamente assim que o TSE abrir a contagem.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-300 text-xs border border-zinc-700">
              <span className="w-2 h-2 rounded-full bg-zinc-300 animate-ping"></span>
              Escuta ativa automática a cada 5 segundos
            </div>
          </div>
        )}

        {/* 1. Live Scoreboard */}
        <section aria-label="Placar Nacional">
          <NationalScoreboard
            candidates={data?.candidates || []}
            totalValidVotes={data?.total_valid_votes || 0}
          />
        </section>

        {/* 2. Sections Progress */}
        <section aria-label="Progresso da Totalização">
          <SectionsProgressBar
            sections={data?.sections || { total: 0, counted: 0, percentage: 0 }}
            summary={data?.votes_summary}
          />
        </section>

        {/* 3. Irreversibility Assessment (Amigável & Centrada no Líder) */}
        <section aria-label="Análise de Vitória Garantida">
          <IrreversibilityCard
            assessment={irreversibility}
            candidates={data?.candidates || []}
          />
        </section>

        {/* 4. Map & Geographic Exploration */}
        <section aria-label="Mapa Eleitoral Interativo" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-zinc-400" />
              <h2 className="text-base font-bold text-zinc-100">Mapa Eleitoral Interativo</h2>
            </div>
            {selectedState && (
              <span className="text-xs bg-zinc-800 px-3 py-1 rounded-full border border-zinc-700 text-zinc-200">
                Estado selecionado: <strong className="text-white">{selectedState}</strong>
              </span>
            )}
          </div>

          <ResultsMap
            statesResults={statesData}
            selectedState={selectedState}
            onSelectState={(uf) => setSelectedState(uf || null)}
          />

          <RegionSelector
            selectedRegion={selectedRegion}
            onSelectRegion={(reg) => setSelectedRegion(reg || null)}
          />
        </section>

        {/* 5. State Rankings */}
        <section aria-label="Rankings">
          <StateRankings />
        </section>

        {/* 6. Simulador de Cenários (posicionado como última seção antes da exportação) */}
        <section aria-label="Simulador de Cenários">
          <ScenarioSimulator
            candidates={data?.candidates || []}
            currentValidVotes={data?.total_valid_votes || 0}
            remainingValidVotes={data?.remaining_valid_votes_estimate || 0}
          />
        </section>

        {/* 7. Export and Sharing Dialog */}
        <section aria-label="Exportação">
          <ExportDialog data={data} />
        </section>

        {/* Editorial Disclaimer Box */}
        <section className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex items-start gap-3 text-xs text-zinc-400">
          <Info className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            As análises de garantia matemática calculada apresentadas no ApuraLive são computadas a partir do teto estrito de votos restantes das seções ainda não totalizadas. A proclamação oficial do resultado e a diplomação dos eleitos são atribuições constitucionais exclusivas da Justiça Eleitoral.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 px-6 py-6 text-center text-xs text-zinc-500 space-y-2">
        <p>
          <strong>ApuraLive</strong> — Projeto independente sem associação oficial com o Tribunal Superior Eleitoral (TSE).
        </p>
        <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-500">
          <span>Dados Oficiais: TSE</span>
          <span>•</span>
          <button
            onClick={() => setIsTransparencyOpen(true)}
            className="hover:text-zinc-300 underline"
          >
            Metodologia e Fórmulas
          </button>
        </div>
      </footer>

      {/* Transparency Modal */}
      <TransparencyModal
        isOpen={isTransparencyOpen}
        onClose={() => setIsTransparencyOpen(false)}
      />
    </div>
  )
}
