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
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Ranking de Votação por Estado</h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 w-36 sm:w-48"
            />
          </div>

          {/* Toggle sort */}
          <button
            onClick={() => setSortBy(sortBy === 'margin' ? 'votes' : 'margin')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs border border-slate-700 transition"
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
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="py-2.5 px-3 font-semibold">Estado (UF)</th>
              <th className="py-2.5 px-3 font-semibold">Líder</th>
              <th className="py-2.5 px-3 font-semibold">Votos do Líder</th>
              <th className="py-2.5 px-3 font-semibold">2º Colocado</th>
              <th className="py-2.5 px-3 font-semibold">Vantagem</th>
              <th className="py-2.5 px-3 font-semibold">Total Válidos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sorted.length > 0 ? (
              sorted.map((item) => (
                <tr key={item.scope_code} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 px-3 font-semibold text-white">
                    {item.scope_name} ({item.scope_code})
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold" style={{ color: item.leader_color }}>
                      {item.leader_name}
                    </span>
                    <span className="text-slate-400 text-[11px] ml-1.5 font-medium">
                      ({formatPercentage(item.leader_percentage)})
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {formatNumber(item.margin_votes)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {item.runner_up_name} ({formatPercentage(item.runner_up_percentage)})
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 font-semibold border border-emerald-800/60 text-[11px]">
                      +{formatPercentage(item.margin_percentage)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {formatNumber(item.total_valid_votes)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
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
