import { Radio, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react'
import { formatDateTime } from '../../utils/formatters'

interface HeaderProps {
  status: 'available' | 'waiting_publication' | 'unavailable' | 'loading'
  sourceUpdatedAt?: string | null
  localUpdatedAt?: Date | null
  isRefreshing: boolean
  onRefresh: () => void
  onOpenTransparency: () => void
}

export function Header({
  status,
  sourceUpdatedAt,
  localUpdatedAt,
  isRefreshing,
  onRefresh,
  onOpenTransparency,
}: HeaderProps) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-4 md:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center font-black text-white text-xl tracking-tighter shadow-lg shadow-red-500/20">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">ApuraLive</h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  AO VIVO
                </span>
              </div>
              <p className="text-xs text-slate-400">A apuração, em tempo real.</p>
            </div>
          </div>

          {/* Quick Transparency Button (Mobile) */}
          <button
            onClick={onOpenTransparency}
            className="md:hidden text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded bg-slate-800 border border-slate-700"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Transparência
          </button>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto text-xs">
          {/* Status Badge */}
          <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
            {status === 'available' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Dados Oficiais Conectados</span>
              </>
            ) : status === 'waiting_publication' ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="text-amber-400 font-medium">Aguardando Publicação TSE</span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
                <span className="text-slate-400 font-medium">Sincronizando...</span>
              </>
            )}
          </div>

          {/* Timestamp Info */}
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-slate-400">
              Última sincronização: <strong className="text-slate-200">{formatDateTime(localUpdatedAt?.toISOString())}</strong>
            </span>
            {sourceUpdatedAt && (
              <span className="text-[10px] text-slate-500">
                Horário da fonte TSE: {sourceUpdatedAt}
              </span>
            )}
          </div>

          {/* Transparency Modal Button (Desktop) */}
          <button
            onClick={onOpenTransparency}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Metodologia & Dados
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
            title="Atualizar agora"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-red-400' : ''}`} />
            <span className="font-medium">Atualizar</span>
          </button>
        </div>
      </div>
    </header>
  )
}
