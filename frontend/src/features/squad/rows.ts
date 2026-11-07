import type { ModeStats, PeriodKey, Player } from '../../data/types'

export interface Row {
  id: string
  name: string
  role: number | null
  joinedAt: string | null
  activity: number | null
  stats: ModeStats | null
}

export function toRows(players: Player[], mode: string, period: PeriodKey): Row[] {
  return players.map((p) => ({
    id: p.id,
    name: p.name,
    role: p.role,
    joinedAt: p.joinedAt,
    activity: p.activity.total,
    stats: p.modes[mode]?.[period] ?? null,
  }))
}

/** A rating from a handful of games says little, so the "top" list needs a minimum. */
export const MIN_GAMES_FOR_TOP: Record<PeriodKey, number> = { total: 100, monthly: 20 }
