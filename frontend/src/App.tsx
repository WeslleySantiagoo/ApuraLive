import { useState, useEffect } from 'react'
import { Radio, AlertCircle, RefreshCw } from 'lucide-react'

export default function App() {
  const [backendStatus, setBackendStatus] = useState<string>('verificando...')
  const [backendMode, setBackendMode] = useState<string>('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const checkBackend = async () => {
    setIsRefreshing(true)
    try {
      const res = await fetch('http://localhost:8000/health')
      if (res.ok) {
        const data = await res.json()
        setBackendStatus(data.status === 'healthy' ? 'Online' : data.status)
        setBackendMode(data.mode)
      } else {
        setBackendStatus('Indisponível')
      }
    } catch {
      setBackendStatus('Desconectado (inicie o backend na porta 8000)')
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    checkBackend()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-lg tracking-wider">
            A
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              ApuraLive
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                AO VIVO
              </span>
            </h1>
            <p className="text-xs text-slate-400">A apuração, em tempo real.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60">
            <Radio className={`w-3.5 h-3.5 ${backendStatus === 'Online' ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span className="text-slate-300">Backend:</span>
            <span className={`font-semibold ${backendStatus === 'Online' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {backendStatus} {backendMode ? `(${backendMode.toUpperCase()})` : ''}
            </span>
          </div>

          <button
            onClick={checkBackend}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </header>

      {/* Main Content Placeholder */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-red-500/10 text-red-400 rounded-full">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-white">Etapa 1: Estrutura Base Monorepo Inicializada</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Frontend (Vite + React + TypeScript + Tailwind) e Backend (FastAPI + Pydantic v2 + HTTPX) configurados e prontos para a integração com os feeds oficiais do TSE.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 px-6 py-4 text-center text-xs text-slate-500">
        <p>ApuraLive é um projeto independente, sem qualquer vínculo oficial com o Tribunal Superior Eleitoral (TSE).</p>
      </footer>
    </div>
  )
}
