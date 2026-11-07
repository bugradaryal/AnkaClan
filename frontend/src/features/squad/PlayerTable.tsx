
import { useMemo, useState } from 'react'
import { roleLabel } from '../../data/roles'
import {
  dash,
  formatDate,
  formatNumber,
  formatRate,
  formatTwoDecimals,
  formatWhole,
} from '../../utils/format'
import type { Row } from './rows'

type Value = number | string | null

interface Column {
  key: string
  label: string
  numeric: boolean
  value: (r: Row) => Value
  render: (r: Row) => string
}

const columns: Column[] = [
  { key: 'name', label: 'Player', numeric: false, value: (r) => r.name, render: (r) => r.name },
  { key: 'role', label: 'Role', numeric: false, value: (r) => r.role, render: (r) => roleLabel(r.role) },
  { key: 'joined', label: 'Joined', numeric: false, value: (r) => r.joinedAt, render: (r) => formatDate(r.joinedAt) },
  { key: 'activity', label: 'Activity', numeric: true, value: (r) => r.activity, render: (r) => formatNumber(r.activity) },
  { key: 'games', label: 'Games', numeric: true, value: (r) => r.stats?.games ?? null, render: (r) => formatNumber(r.stats?.games) },
  { key: 'winRate', label: 'Win rate', numeric: true, value: (r) => r.stats?.winRate ?? null, render: (r) => formatRate(r.stats?.winRate) },
  { key: 'kps', label: 'Kills/spawn', numeric: true, value: (r) => r.stats?.killsPerSpawn ?? null, render: (r) => formatTwoDecimals(r.stats?.killsPerSpawn) },
  { key: 'position', label: 'Avg. team pos.', numeric: true, value: (r) => r.stats?.avgTeamPosition ?? null, render: (r) => formatRate(r.stats?.avgTeamPosition) },
  { key: 'score', label: 'Avg. score', numeric: true, value: (r) => r.stats?.avgScore ?? null, render: (r) => formatWhole(r.stats?.avgScore) },
  { key: 'rating', label: 'Rating', numeric: true, value: (r) => r.stats?.rating ?? null, render: (r) => formatWhole(r.stats?.rating) },
  { key: 'interaction', label: 'Interaction', numeric: true, value: (r) => r.stats?.interaction ?? null, render: (r) => formatWhole(r.stats?.interaction) },
]

interface Props {
  rows: Row[]
  selected: string[]
  maxSelected: number
  onToggle: (id: string) => void
  onOpen: (id: string) => void
}

export function PlayerTable({
  rows,
  selected,
  maxSelected,
  onToggle,
  onOpen,
}: Props) {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState('rating')
  const [asc, setAsc] = useState(false)

  const sorted = useMemo(() => {
    const column = columns.find((c) => c.key === sortKey) ?? columns[0]
    const q = query.trim().toLowerCase()

    const filtered = q
      ? rows.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.id.includes(q),
        )
      : rows

    return [...filtered].sort((a, b) => {
      const av = column.value(a)
      const bv = column.value(b)

      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1

      const cmp =
        typeof av === 'string'
          ? av.localeCompare(bv as string)
          : (av as number) - (bv as number)

      return asc ? cmp : -cmp
    })
  }, [rows, query, sortKey, asc])

  const toggleSort = (c: Column) => {
    if (c.key === sortKey) {
      setAsc(!asc)
    } else {
      setSortKey(c.key)
      setAsc(
        c.key === 'name' ||
        c.key === 'role' ||
        c.key === 'joined',
      )
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] p-5">
      <div>
        <h2 className="font-display text-xl font-bold text-bone">
          Filo Üyeleri
        </h2>
        <p className="mt-1 text-xs text-mute">
          Oyuncu istatistiklerini inceleyin ve karşılaştırın
        </p>
      </div>

        <label className="relative w-full sm:max-w-xs">
          <span className="sr-only">
            Oyuncuları isim veya ID'ye göre ara.
          </span>

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 4 4" />
          </svg>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or ID..."
            className="w-full rounded-xl border border-white/[0.08] bg-black/20 py-2.5 pl-10 pr-4 text-sm text-bone outline-none transition placeholder:text-mute/60 focus:border-wine-400/50 focus:ring-2 focus:ring-wine-400/10"
          />
        </label>
      </div>

      {/* Selection info */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
        <p className="text-xs text-mute">
          <span className="font-semibold text-bone">
            {sorted.length}
          </span>{' '}
          oyuncu bulundu
        </p>

        <p className="text-xs text-mute">
          <span className="font-medium text-wine-300">
            {selected.length}/{maxSelected}
          </span>{' '}
          karşılaştırma için seçildi.
        </p>
      </div>

      {/* Table */}
      <div className="max-h-[795px] overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-y border-white/[0.06] bg-[#242127] text-xs text-mute">
              <th
                scope="col"
                className="w-12 px-4 py-3"
              >
                <span className="sr-only">Karşılaştır</span>
              </th>

              <th
                scope="col"
                className="w-12 px-3 py-3 text-right font-medium"
              >
                #
              </th>

              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={`whitespace-nowrap px-4 py-3 font-medium ${
                    c.numeric ? 'text-right' : ''
                  } ${
                    c.key === 'name' ? 'w-[176px]' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(c)}
                    className={`transition-colors hover:text-bone ${
                      sortKey === c.key ? 'text-wine-300' : ''
                    }`}
                  >
                    {c.label}
                    <span className="ml-1 text-[10px]">
                      {sortKey === c.key
                        ? asc
                          ? '↑'
                          : '↓'
                        : ''}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sorted.map((r, i) => {
              const isSelected = selected.includes(r.id)

              return (
                <tr
                  key={r.id}
                  className={`border-b border-white/[0.035] transition-colors hover:bg-white/[0.035] ${
                    isSelected ? 'bg-wine-500/[0.055]' : ''
                  }`}
                >
                  <td className="px-4 py-3.5">
                    <input
                      type="checkbox"
                      aria-label={`Compare ${r.name}`}
                      checked={isSelected}
                      disabled={
                        !isSelected &&
                        selected.length >= maxSelected
                      }
                      onChange={() => onToggle(r.id)}
                      className="h-4 w-4 cursor-pointer accent-[#D3283F] disabled:cursor-not-allowed disabled:opacity-30"
                    />
                  </td>

                  <td className="px-3 py-3.5 text-right">
                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-white/[0.045] px-2 text-xs font-medium tabular-nums text-mute">
                      {i + 1}
                    </span>
                  </td>

                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`px-4 py-3.5 tabular-nums ${
                        c.numeric ? 'text-right' : ''
                      } ${
                        c.key === 'role' || c.key === 'joined'
                          ? 'text-mute'
                          : 'text-bone/80'
                      } ${
                        c.key === 'name'
                          ? 'w-[176px] max-w-[176px]'
                          : 'whitespace-nowrap'
                      }`}
                    >
                      {c.key === 'name' ? (
                        <div className="block w-full min-w-0 overflow-x-auto whitespace-nowrap
                          [scrollbar-width:thin!important]
                          [scrollbar-color:rgba(255,255,255,0.12)_transparent!important]
                          [&::-webkit-scrollbar]:h-[3px]
                          [&::-webkit-scrollbar-thumb]:bg-white/10
                          [&::-webkit-scrollbar-thumb]:rounded-full
                        ">
                          <button
                            type="button"
                            onClick={() => onOpen(r.id)}
                            className="inline-block whitespace-nowrap font-semibold text-bone transition-colors hover:text-wine-300"
                          >
                            {r.name}
                          </button>
                        </div>
                      ) : (
                        c.render(r)
                      )}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>

        {sorted.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-mute">
            Aramanızla eşleşen oyuncu bulunamadı.
          </p>
        )}

        {rows.length > 0 &&
          rows.every((r) => r.stats === null) && (
            <p className="px-5 py-10 text-center text-sm text-mute">
              {dash} Bu oyun modu ve dönem için istatistik bulunmuyor.
            </p>
          )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.05] px-5 py-3">
        <p className="text-xs text-mute/60">
          Performanslarını karşılaştırmak için oyuncuları seçin. Detayları görüntülemek için oyuncu adına tıklayın.
        </p>
      </div>
    </section>
  )
}
