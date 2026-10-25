import { useState } from 'react'
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
import { AlertCircle, Clock, Info, Map as MapIcon } from 'lucide-react'

export default function App() {
  const { data, irreversibility, isRefreshing, error, lastSuccessTime, refetch } = useResults(5000)
  const [isTransparencyOpen, setIsTransparencyOpen] = useState(false)
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  const isWaitingPublication = data?.status === 'waiting_publication'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
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
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-400 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="flex-1">
              <strong className="font-semibold block">Aviso de Conexão com o TSE</strong>
              <span>{error}</span>
            </div>
            <button
              onClick={refetch}
              className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded font-medium transition"
            >
              Reconectar
            </button>
          </div>
        )}

        {/* State: Waiting official dissemination from TSE */}
        {isWaitingPublication && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-lg font-bold text-white">
              Aguardando Publicação Oficial dos Dados pelo TSE
            </h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
              Os arquivos de apuração presidencial de 2026 ainda não foram disponibilizados na CDN do Tribunal Superior Eleitoral. A sincronização em tempo real entrará em ação automaticamente assim que o TSE abrir a contagem.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 text-xs border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Escuta ativa automática a cada 5 segundos
            </div>
          </div>
        )}

        {/* Live Scoreboard */}
        <section aria-label="Placar Nacional">
          <NationalScoreboard
            candidates={data?.candidates || []}
            totalValidVotes={data?.total_valid_votes || 0}
          />
        </section>

        {/* Sections Progress */}
        <section aria-label="Progresso da Totalização">
          <SectionsProgressBar
            sections={data?.sections || { total: 0, counted: 0, percentage: 0 }}
            summary={data?.votes_summary}
          />
        </section>

        {/* Irreversibility Mathematical Assessment */}
        <section aria-label="Análise Matemática">
          <IrreversibilityCard
            assessment={irreversibility}
            remainingValidEstimate={data?.remaining_valid_votes_estimate || 0}
          />
        </section>

        {/* Scenario Simulator */}
        <section aria-label="Simulador de Cenários">
          <ScenarioSimulator
            candidates={data?.candidates || []}
            currentValidVotes={data?.total_valid_votes || 0}
            remainingValidVotes={data?.remaining_valid_votes_estimate || 0}
          />
        </section>

        {/* Map & Geographic Exploration */}
        <section aria-label="Mapa Eleitoral Interativo" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-red-500" />
              <h2 className="text-base font-bold text-white">Mapa Eleitoral Interativo</h2>
            </div>
            {selectedState && (
              <span className="text-xs bg-slate-800 px-3 py-1 rounded-full border border-slate-700 text-slate-200">
                Estado focado: <strong className="text-white">{selectedState}</strong>
              </span>
            )}
          </div>

          <ResultsMap
            selectedState={selectedState}
            onSelectState={(uf) => setSelectedState(uf || null)}
          />

          <RegionSelector
            selectedRegion={selectedRegion}
            onSelectRegion={(reg) => setSelectedRegion(reg || null)}
          />
        </section>

        {/* State Rankings */}
        <section aria-label="Rankings">
          <StateRankings />
        </section>

        {/* Export and Sharing Dialog */}
        <section aria-label="Exportação">
          <ExportDialog data={data} />
        </section>

        {/* Editorial Disclaimer Box */}
        <section className="bg-slate-900/30 border border-slate-800/60 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-400">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            As análises de garantia matemática calculada apresentadas no ApuraLive são computadas a partir do teto estrito de votos restantes das seções ainda não totalizadas. A proclamação oficial do resultado e a diplomação dos eleitos são atribuições constitucionais exclusivas da Justiça Eleitoral.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/50 px-6 py-6 text-center text-xs text-slate-400 space-y-2">
        <p>
          <strong>ApuraLive</strong> — Projeto independente sem associação oficial com o Tribunal Superior Eleitoral (TSE).
        </p>
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500">
          <span>Dados Oficiais: TSE</span>
          <span>•</span>
          <button
            onClick={() => setIsTransparencyOpen(true)}
            className="hover:text-slate-300 underline"
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
