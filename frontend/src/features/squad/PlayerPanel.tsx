import { lazy, Suspense, useEffect, useState } from 'react'
import { MODES, PERIODS } from '../../data/modes'
import { roleLabel } from '../../data/roles'
import type { PeriodKey, Player } from '../../data/types'
import { formatDate, formatNumber, formatRate, formatTwoDecimals, formatWhole } from '../../utils/format'

// Recharts is loaded only when a panel is opened, so the first page load stays small.
const ModeChart = lazy(() => import('../charts/ModeChart'))

const pill = (active: boolean, disabled = false) =>
  `rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
    active
      ? 'bg-wine-500/15 text-wine-300 ring-1 ring-wine-400/30'
      : disabled
        ? 'cursor-not-allowed bg-white/[0.02] text-mute/40'
        : 'bg-white/[0.035] text-mute hover:bg-white/[0.07] hover:text-bone'
  }`

interface Props {
  player: Player
  initialMode: string
  initialPeriod: PeriodKey
  onClose: () => void
}

export function PlayerPanel({ player, initialMode, initialPeriod, onClose }: Props) {
  // Start on the mode the page is showing; if this player has no data there, on the first mode that has some.
  const firstWithData = MODES.find((m) => player.modes[m.key])?.key
  const [mode, setMode] = useState<string>(player.modes[initialMode] ? initialMode : (firstWithData ?? initialMode))
  const [period, setPeriod] = useState<PeriodKey>(initialPeriod)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const modeInfo = MODES.find((m) => m.key === mode)
  const periods = player.modes[mode]
  const stats = periods?.[period]

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <button type="button" aria-label="Close details" onClick={onClose} className="absolute inset-0 bg-black/60" />
      <aside
        role="dialog"
        aria-label={`${player.name} details`}
        className="relative h-full w-full max-w-xl overflow-y-auto border-l border-white/[0.08] bg-ink/95 p-6 backdrop-blur"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="break-words font-display text-4xl font-extrabold">{player.name}</h2>
            <p className="mt-1 text-sm text-mute">
              ID {player.id} · {roleLabel(player.role)} · Joined {formatDate(player.joinedAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl border border-white/[0.1] px-3 py-1.5 text-sm hover:bg-white/[0.06]"
          >
            Kapat
          </button>
        </div>

        <dl className="mt-5 grid grid-cols-3 gap-x-6 text-sm">
          <Stat label="Activity" value={formatNumber(player.activity.total)} />
          <Stat label="Current period" value={formatNumber(player.activity.current)} />
          <Stat label="Personal squadron rating" value={formatNumber(player.personalRating)} />
        </dl>

        <div role="tablist" aria-label="Game mode" className="mt-6 flex flex-wrap gap-2">
          {MODES.map((m) => {
            const has = Boolean(player.modes[m.key])
            return (
              <button
                key={m.key}
                type="button"
                role="tab"
                aria-selected={mode === m.key}
                disabled={!has}
                title={has ? undefined : 'No data for this mode'}
                onClick={() => setMode(m.key)}
                className={pill(mode === m.key, !has)}
              >
                {m.label}
              </button>
            )
          })}
        </div>
        <div role="tablist" aria-label="Period" className="mt-2 flex gap-2">
          {PERIODS.map((p) => {
            const has = Boolean(periods?.[p.key])
            return (
              <button
                key={p.key}
                type="button"
                role="tab"
                aria-selected={period === p.key}
                onClick={() => setPeriod(p.key)}
                title={has ? undefined : 'No data for this period'}
                className={pill(period === p.key, !has && period !== p.key)}
              >
                {p.label}
              </button>
            )
          })}
        </div>

        <section className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-6">
          <h3 className="text-center font-display text-2xl font-bold">{modeInfo?.label ?? mode}</h3>
          {!stats ? (
            <p className="mt-4 text-center text-sm text-mute">
              No {PERIODS.find((p) => p.key === period)?.label.toLowerCase()} data for this mode.
            </p>
          ) : (
            <>
              <p className="mt-1 text-center text-xs text-mute">{PERIODS.find((p) => p.key === period)?.label}</p>
              <p className="mt-4 text-center">
                <span className="inline-block rounded-lg bg-wine-500/15 px-4 py-1.5 font-display text-3xl font-bold text-wine-300 ring-1 ring-wine-400/30">
                  SR1: {formatWhole(stats.rating)}
                </span>
              </p>
              <dl className="mt-5 divide-y divide-white/[0.06] text-sm">
                <Line label="Win rate" value={formatRate(stats.winRate)} />
                <Line label="Avg. team position" value={formatRate(stats.avgTeamPosition)} />
                <Line label="Avg. kills/spawn" value={formatTwoDecimals(stats.killsPerSpawn)} />
                <Line label="Average score" value={formatWhole(stats.avgScore)} />
                <Line label="Interaction" value={formatWhole(stats.interaction)} />
                <Line label="Total games" value={formatNumber(stats.games)} />
              </dl>
            </>
          )}
        </section>

        <section className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
          <h3 className="font-display text-xl font-bold">
            Rating and kills/spawn
            <span className="ml-2 text-sm font-normal text-mute">({modeInfo?.label ?? mode})</span>
          </h3>
          <Suspense fallback={<p className="mt-2 text-sm text-mute">Loading chart...</p>}>
            <ModeChart total={periods?.total} monthly={periods?.monthly} />
          </Suspense>
        </section>
      </aside>
    </div>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="font-medium text-bone/90">{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-mute">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  )
}
