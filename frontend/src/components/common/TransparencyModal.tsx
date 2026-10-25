import { X, ExternalLink, Calculator, Database, ShieldAlert } from 'lucide-react'

interface TransparencyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TransparencyModal({ isOpen, onClose }: TransparencyModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 text-slate-300">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold text-white">Transparência, Fontes e Metodologia</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer Legal */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-300 space-y-1.5">
          <strong className="text-sm font-semibold text-red-200 block">Projeto Independente</strong>
          <p>
            O <strong>ApuraLive</strong> é um projeto jornalístico e tecnológico independente. Não possui qualquer vínculo oficial, afiliação institucional ou parceria comercial com o Tribunal Superior Eleitoral (TSE) ou qualquer órgão da Justiça Eleitoral brasileira.
          </p>
        </div>

        {/* Fontes de Dados */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Database className="w-4 h-4 text-blue-400" />
            <h3>Fontes Oficiais</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Todos os números de apuração, seções totalizadas e votos são obtidos diretamente dos arquivos oficiais de divulgação em formato JSON disponibilizados pelo TSE (especificações EA14 e EA20 para o cargo de Presidente).
          </p>
          <a
            href="https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 underline"
          >
            Documentação técnica oficial do TSE
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Fórmulas Matemáticas */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <h3>Critérios da Análise de Irreversibilidade</h3>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
            <p className="text-slate-300">
              <strong className="text-white">Diferença de votos (D):</strong> D = V_A - V_B
            </p>
            <p className="text-slate-300">
              <strong className="text-white">Critério de 2º Turno:</strong> D &gt; R
            </p>
            <p className="text-slate-400 text-[11px] font-sans">
              Onde R representa o teto conservador superior de votos válidos ainda possíveis nas seções pendentes de totalização. Se D &gt; R, mesmo que 100% dos votos restantes fossem para o 2º colocado, a ultrapassagem é matematicamente impossível. Se D = R, um empate ainda é possível, logo a condição é estritamente maior (&gt;).
            </p>
          </div>
        </div>

        {/* Zero Banco de Dados */}
        <div className="space-y-2 text-xs text-slate-400">
          <h4 className="text-white font-semibold">Armazenamento em Memória</h4>
          <p>
            O ApuraLive não armazena dados em banco de dados permanente nem mantém registros de usuários. As respostas são consultadas sob demanda no TSE e retidas apenas em memória temporária por poucos segundos para garantir alta disponibilidade e proteção aos servidores públicos.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
