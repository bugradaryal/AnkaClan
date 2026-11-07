import type { PeriodKey } from '../../data/types'
import { formatNumber, formatWhole } from '../../utils/format'
import { MIN_GAMES_FOR_TOP, type Row } from './rows'

export function TopPlayers({ rows, period, onOpen }: { rows: Row[]; period: PeriodKey; onOpen: (id: string) => void }) {
  const min = MIN_GAMES_FOR_TOP[period]
  const top = rows
    .filter((r) => r.stats?.rating != null && (r.stats.games ?? 0) >= min)
    .sort((a, b) => (b.stats!.rating ?? 0) - (a.stats!.rating ?? 0))
    .slice(0, 5)

  if (top.length === 0) return null
  const [first, ...rest] = top

  return (
    <section aria-label="Top players by rating">
      <div className="grid gap-px bg-wine-800 lg:grid-cols-[1.4fr_2fr]">
        <button
          type="button"
          onClick={() => onOpen(first.id)}
          className="bg-gradient-to-br from-wine-600 to-wine-900 p-8 text-left transition-opacity hover:opacity-90"
        >
          <p className="text-sm text-bone/70">Top rating</p>
          <p className="mt-2 break-words font-display text-5xl font-extrabold">{first.name}</p>
          <p className="mt-4 font-display text-3xl font-bold">{formatWhole(first.stats!.rating)}</p>
          <p className="text-sm text-bone/70">{formatNumber(first.stats!.games)} games</p>
        </button>
        <ol className="grid gap-px bg-wine-800 sm:grid-cols-2">
          {rest.map((r, i) => (
            <li key={r.id} className="bg-ink">
              <button
                type="button"
                onClick={() => onOpen(r.id)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-wine-900/60"
              >
                <span className="font-display text-2xl text-wine-300">{i + 2}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{r.name}</span>
                  <span className="block text-xs text-mute">{formatNumber(r.stats!.games)} games</span>
                </span>
                <span className="text-mute">{formatWhole(r.stats!.rating)}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-2 text-xs text-mute">Bu oyun modu ve dönemde en az {min} maç oynayan oyuncular.</p>
    </section>
  )
}
