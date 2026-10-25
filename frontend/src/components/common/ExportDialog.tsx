import { useState } from 'react'
import { Download, FileJson, FileSpreadsheet, Check, Share2 } from 'lucide-react'
import { NormalizedElectionResult } from '../../types/results'
import { formatNumber, formatPercentage } from '../../utils/formatters'

interface ExportDialogProps {
  data: NormalizedElectionResult | null
}

export function ExportDialog({ data }: ExportDialogProps) {
  const [copied, setCopied] = useState(false)

  if (!data) return null

  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `apuralive-${data.scope}-${new Date().toISOString().slice(0, 19)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadCSV = () => {
    const headers = ['id', 'nome', 'numero', 'votos', 'percentual_validos', 'situacao']
    const rows = data.candidates.map((c) => [
      c.id,
      `"${c.name}"`,
      c.number,
      c.votes,
      c.percentage,
      c.is_elected ? 'Eleito' : 'Não Eleito',
    ])
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `apuralive-${data.scope}-${new Date().toISOString().slice(0, 19)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleShareSummary = () => {
    const cand1 = data.candidates[0]
    const cand2 = data.candidates[1]
    const text = `📊 ApuraLive — Eleições Presidenciais 2026\nProgresso: ${formatPercentage(data.sections.percentage)} das seções\n\n1º ${cand1?.name || 'Candidato 1'}: ${formatPercentage(cand1?.percentage)} (${formatNumber(cand1?.votes)} votos)\n2º ${cand2?.name || 'Candidato 2'}: ${formatPercentage(cand2?.percentage)} (${formatNumber(cand2?.votes)} votos)\n\nAcompanhe ao vivo com dados oficiais do TSE: ${window.location.origin}`

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      })
    }
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-bold text-white">Exportação e Compartilhamento de Dados</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs border border-slate-700 transition"
          >
            <FileJson className="w-3.5 h-3.5 text-amber-400" />
            <span>Exportar JSON</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs border border-slate-700 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleShareSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Copiar Resumo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
