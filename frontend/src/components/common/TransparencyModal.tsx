import { useEffect } from 'react'
import { X, ExternalLink, Calculator, Database, ShieldAlert } from 'lucide-react'

interface TransparencyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TransparencyModal({ isOpen, onClose }: TransparencyModalProps) {
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 text-zinc-300">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-zinc-200" />
            <h2 className="text-lg font-bold text-zinc-100">Transparência, Fontes e Metodologia</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer Legal Imparcial */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 text-xs text-zinc-300 space-y-1.5">
          <strong className="text-sm font-semibold text-zinc-100 block">Projeto Independente e Neutro</strong>
          <p className="leading-relaxed">
            O <strong>ApuraLive</strong> é um projeto jornalístico e tecnológico independente. Não possui qualquer vínculo oficial, afiliação institucional, patrocínio ou preferência político-partidária com o Tribunal Superior Eleitoral (TSE) ou candidatos. A identidade visual foi desenhada exclusivamente em tons neutros para garantir total isenção e imparcialidade visual.
          </p>
        </div>

        {/* Fontes de Dados */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
            <Database className="w-4 h-4 text-zinc-300" />
            <h3>Fontes Oficiais</h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Todos os números de apuração, seções totalizadas e votos são obtidos diretamente dos arquivos oficiais de divulgação em formato JSON disponibilizados pelo TSE (especificações EA14 e EA20 para o cargo de Presidente).
          </p>
          <a
            href="https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white underline"
          >
            Documentação técnica oficial do TSE
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Fórmulas Matemáticas */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
            <Calculator className="w-4 h-4 text-zinc-300" />
            <h3>Critérios da Análise de Irreversibilidade</h3>
          </div>
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2 text-xs font-mono">
            <p className="text-zinc-300">
              <strong className="text-zinc-100">Diferença de votos (D):</strong> D = V_A - V_B
            </p>
            <p className="text-zinc-300">
              <strong className="text-zinc-100">Critério de 2º Turno:</strong> D &gt; R
            </p>
            <p className="text-zinc-400 text-[11px] font-sans">
              Onde R representa o teto conservador superior de votos válidos ainda possíveis nas seções pendentes de totalização. Se D &gt; R, mesmo que 100% dos votos restantes fossem para o 2º colocado, a ultrapassagem é matematicamente impossível. Se D = R, um empate ainda é possível, logo a condição é estritamente maior (&gt;).
            </p>
          </div>
        </div>

        {/* Zero Banco de Dados */}
        <div className="space-y-2 text-xs text-zinc-400">
          <h4 className="text-zinc-100 font-semibold">Armazenamento em Memória</h4>
          <p className="leading-relaxed">
            O ApuraLive não armazena dados em banco de dados permanente nem mantém registros de usuários. As respostas são consultadas sob demanda no TSE e retidas apenas em memória temporária por poucos segundos para garantir alta disponibilidade e proteção aos servidores públicos.
          </p>
        </div>

        <div className="pt-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-xs font-semibold transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
