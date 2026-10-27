import { Radio, RefreshCw, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react'
import { formatDateTime } from '../../utils/formatters'
import { LogoIcon } from '../common/LogoIcon'

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
    <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur sticky top-0 z-50 px-4 md:px-8 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3.5">
            <div className="h-9 w-9 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center p-2 text-zinc-100 shadow-sm">
              <LogoIcon className="w-full h-full text-zinc-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-zinc-100">ApuraLive</h1>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-700/80 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-pulse"></span>
                  AO VIVO
                </span>
              </div>
              <p className="text-xs text-zinc-400">A apuração, em tempo real.</p>
            </div>
          </div>

          {/* Quick Transparency Button (Mobile) */}
          <button
            onClick={onOpenTransparency}
            className="md:hidden text-xs text-zinc-400 hover:text-white flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            Transparência
          </button>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto text-xs">
          {/* Status Badge */}
          <div className="flex items-center gap-2 bg-zinc-900/90 px-3.5 py-1.5 rounded-lg border border-zinc-800">
            {status === 'available' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-zinc-200" />
                <span className="text-zinc-200 font-medium">Dados Oficiais Conectados</span>
              </>
            ) : status === 'waiting_publication' ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-zinc-400 animate-pulse" />
                <span className="text-zinc-300 font-medium">Aguardando Publicação TSE</span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5 text-zinc-500 animate-pulse" />
                <span className="text-zinc-400 font-medium">Sincronizando...</span>
              </>
            )}
          </div>

          {/* Timestamp Info */}
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-zinc-400">
              Última sincronização: <strong className="text-zinc-200 font-medium">{formatDateTime(localUpdatedAt?.toISOString())}</strong>
            </span>
            {sourceUpdatedAt && (
              <span className="text-[10px] text-zinc-500">
                Horário da fonte TSE: {sourceUpdatedAt}
              </span>
            )}
          </div>

          {/* Transparency Modal Button (Desktop) */}
          <button
            onClick={onOpenTransparency}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            Metodologia & Dados
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-800 transition"
            title="Atualizar agora"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-zinc-400 ${isRefreshing ? 'animate-spin text-zinc-200' : ''}`} />
            <span className="font-medium">Atualizar</span>
          </button>
        </div>
      </div>
    </header>
  )
}
