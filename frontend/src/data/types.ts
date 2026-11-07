export type PeriodKey = 'total' | 'monthly'

/** One mode in one period. Every value can be null: the source leaves things out. */
export interface ModeStats {
  rating: number | null // StatShark mode rating ("wt8" in the JSON)
  interaction: number | null
  games: number | null
  killsPerSpawn: number | null // not K/D; the source has no deaths
  avgTeamPosition: number | null // fraction 0..1
  winRate: number | null // fraction 0..1
  avgScore: number | null
}

/** Keys are the source's mode names: air_arcade, air_realistic, tank_realistic, ... Only modes with data are present. */
export type PlayerModes = Record<string, Partial<Record<PeriodKey, ModeStats>>>

export interface Player {
  id: string
  name: string
  joinedAt: string | null
  role: number | null
  activity: { current: number | null; total: number | null; periods: Record<string, number> }
  personalRating: number | null
  modes: PlayerModes
}

export interface SquadData {
  schemaVersion: number
  source: 'statshark'
  importedAt: string
  sourceUpdatedAt: string | null
  squad: {
    sourceId: string | null
    name: string | null
    tag: string | null
    region: string | null
    memberCount: number | null
    memberLimit: number | null
    createdAt: string | null
    creatorId: string | null
    activityPoints: number | null
    squadronRating: number | null
  }
  players: Player[]
}

/** network = just downloaded; cache = this browser's copy, still fresh; stale-cache = old copy, the download failed. */
export type DataOrigin = 'network' | 'cache' | 'stale-cache'

export interface LoadResult {
  data: SquadData
  origin: DataOrigin
  /** When this browser last got the data from the site (not when StatShark updated it). */
  checkedAt: string
}

export interface SnapshotIndexEntry {
  id: string
  file: string
  sourceUpdatedAt: string | null
  importedAt: string
  players: number
}
