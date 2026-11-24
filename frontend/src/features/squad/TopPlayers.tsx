
import type { PeriodKey } from '../../data/types'
import { formatNumber, formatWhole } from '../../utils/format'
import { MIN_GAMES_FOR_TOP, type Row } from './rows'

export function TopPlayers({
  rows,
  period,
  onOpen,
}: {
  rows: Row[]
  period: PeriodKey
  onOpen: (id: string) => void
}) {
  const min = MIN_GAMES_FOR_TOP[period]

  const top = rows
    .filter((r) => r.stats?.rating != null && (r.stats.games ?? 0) >= min)
    .sort((a, b) => (b.stats!.rating ?? 0) - (a.stats!.rating ?? 0))
    .slice(0, 5)

  if (top.length === 0) return null

  const [first, ...rest] = top
  const leaderStats = first.stats!

  return (
    <section aria-label="En iyi oyuncular">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wine-300">
            Performans sıralaması
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
            En iyi oyuncular
          </h2>
        </div>
        <span className="text-xs text-mute">Top 5 · Rating</span>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <button
          type="button"
          onClick={() => onOpen(first.id)}
          className="group relative flex min-h-0 flex-col justify-between overflow-hidden rounded-2xl border border-wine-400/25 bg-gradient-to-br from-wine-900/80 via-[#21151c] to-ink p-5 text-left transition-all duration-300 hover:border-wine-300/50 hover:shadow-[0_0_30px_rgba(184,50,70,0.12)] sm:p-6"
        >
          <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-wine-500/10 blur-3xl transition-opacity group-hover:bg-wine-500/20" />

          <div className="relative flex items-center justify-between">
            <span className="rounded-full border border-wine-300/25 bg-wine-300/10 px-3 py-1 text-xs font-semibold tracking-wide text-wine-200">
              #01 · LİDER
            </span>
            <span className="text-xs text-mute">TOP RATING</span>
          </div>

          <div className="relative mt-5">
            <p className="text-xs text-mute">En yüksek rating</p>
            <h3 className="mt-2 break-words font-display text-2xl font-extrabold tracking-tight sm:text-5xl">
              {first.name}
            </h3>
          </div>

          <div className="relative mt-5 border-t border-white/[0.08] pt-4">
            <div className="flex items-end justify-between p-1">
              <div>
                <p className="font-display text-3xl font-bold tracking-tight text-wine-300">
                  {formatWhole(leaderStats.rating)}
                </p>
                <p className="mt-1 text-xs text-mute">Rating puanı</p>
              </div>

              <div className="text-right">
                <p className="text-lg font-semibold">
                  {formatNumber(leaderStats.games)}
                </p>
                <p className="mt-1 text-xs text-mute">Maç</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
                <p className="text-xs text-mute">K/D · Kills/Spawn</p>
                <p className="mt-1 font-display text-xl font-bold text-bone">
                  {leaderStats.killsPerSpawn != null
                    ? leaderStats.killsPerSpawn.toFixed(2)
                    : '-'}
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
                <p className="text-xs text-mute">Kazanma oranı</p>
                <p className="mt-1 font-display text-xl font-bold text-bone">
                  {leaderStats.winRate != null
                    ? `${(leaderStats.winRate * 100).toFixed(1)}%`
                    : '-'}
                </p>
              </div>
            </div>
          </div>
        </button>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {rest.map((r, i) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onOpen(r.id)}
              className="group flex min-w-0 items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-left transition-all duration-200 hover:border-wine-400/30 hover:bg-white/[0.045] sm:p-5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.04] font-display text-lg font-bold text-wine-300 transition-colors group-hover:border-wine-400/30 group-hover:bg-wine-500/10">
                {String(i + 2).padStart(2, '0')}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-bone transition-colors group-hover:text-wine-200">
                  {r.name}
                </span>
                <span className="mt-1 block text-xs text-mute">
                  {formatNumber(r.stats!.games)} maç
                </span>
              </span>

              <span className="shrink-0 text-right">
                <span className="block font-display text-xl font-bold">
                  {formatWhole(r.stats!.rating)}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-mute">
                  Rating
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-mute">
        Bu oyun modu ve dönemde en az {min} maç oynayan oyuncular.
      </p>
    </section>
  )
}
