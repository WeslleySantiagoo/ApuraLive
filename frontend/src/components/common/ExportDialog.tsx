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
    const text = `📊 ApuraLive — Eleições Presidenciais 2026\nProgresso: ${formatPercentage(data.sections.percentage)} das seções\n\n1º ${cand1?.name || 'Candidato 1'}: ${formatPercentage(cand1?.percentage)} (${formatNumber(cand1?.votes)} votos)\n2º ${cand2?.name || 'Candidato 2'}: ${formatPercentage(cand2?.percentage)} (${formatNumber(cand2?.votes)} votos)\n\nAcompanhe com dados oficiais do TSE: ${window.location.origin}`

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      })
    }
  }

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-zinc-300" />
          <h3 className="text-sm font-bold text-zinc-100">Exportação e Compartilhamento de Dados</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs border border-zinc-700 transition"
          >
            <FileJson className="w-3.5 h-3.5 text-zinc-400" />
            <span>Exportar JSON</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs border border-zinc-700 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleShareSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-xs font-semibold transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-zinc-950" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-zinc-950" />
                <span>Copiar Resumo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
