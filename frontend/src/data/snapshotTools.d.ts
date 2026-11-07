import type { SquadData } from './types'

export type StatDeltas = Partial<Record<'rating' | 'interaction' | 'games' | 'killsPerSpawn' | 'avgTeamPosition' | 'winRate' | 'avgScore', number>>

export interface PlayerDiff {
  id: string
  name: string
  activityTotal: number | null
  modes: Record<string, Partial<Record<'total' | 'monthly', StatDeltas>>>
}

export function diffSnapshots(older: SquadData, newer: SquadData): PlayerDiff[]
