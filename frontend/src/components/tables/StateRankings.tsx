import { useState, useEffect } from 'react'
import { fetchRankings } from '../../services/api'
import { formatNumber, formatPercentage } from '../../utils/formatters'
import { Trophy, ArrowUpDown, Search } from 'lucide-react'

export function StateRankings() {
  const [rankings, setRankings] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'votes' | 'margin'>('margin')

  useEffect(() => {
    fetchRankings()
      .then((data) => setRankings(data))
      .catch(() => {})
  }, [])

  const filtered = rankings.filter((r) =>
    r.scope_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.scope_code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'votes') return b.total_valid_votes - a.total_valid_votes
    return b.margin_percentage - a.margin_percentage
  })

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-zinc-300" />
          <h3 className="text-sm font-bold text-zinc-100">Ranking de Votação por Estado</h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 w-36 sm:w-48 transition"
            />
          </div>

          {/* Toggle sort */}
          <button
            onClick={() => setSortBy(sortBy === 'margin' ? 'votes' : 'margin')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs border border-zinc-700 transition"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortBy === 'margin' ? 'Maior Margem' : 'Volume de Votos'}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400">
              <th className="py-3 px-3 font-semibold">Estado (UF)</th>
              <th className="py-3 px-3 font-semibold">Líder</th>
              <th className="py-3 px-3 font-semibold">Votos do Líder</th>
              <th className="py-3 px-3 font-semibold">2º Colocado</th>
              <th className="py-3 px-3 font-semibold">Vantagem</th>
              <th className="py-3 px-3 font-semibold">Total Válidos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-mono">
            {sorted.length > 0 ? (
              sorted.map((item) => (
                <tr key={item.scope_code} className="hover:bg-zinc-800/40 transition">
                  <td className="py-3 px-3 font-semibold text-zinc-100 font-sans">
                    {item.scope_name} ({item.scope_code})
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <span className="font-semibold text-zinc-100">
                      {item.leader_name}
                    </span>
                    <span className="text-zinc-400 text-[11px] ml-1.5 font-mono">
                      ({formatPercentage(item.leader_percentage)})
                    </span>
                  </td>
                  <td className="py-3 px-3 text-zinc-300">
                    {formatNumber(item.margin_votes)}
                  </td>
                  <td className="py-3 px-3 text-zinc-400 font-sans">
                    {item.runner_up_name} ({formatPercentage(item.runner_up_percentage)})
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700 text-[11px]">
                      +{formatPercentage(item.margin_percentage)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-zinc-300">
                    {formatNumber(item.total_valid_votes)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-500 font-sans">
                  Aguardando totalização oficial dos estados pelo TSE.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
