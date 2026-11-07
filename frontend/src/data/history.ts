import type { SnapshotIndexEntry, SquadData } from './types'

/**
 * Every import saves a snapshot under data/snapshots/ and adds it to data/snapshots/index.json. Snapshots are never
 * deleted. Players are identified by their id in every snapshot, so a player can be followed over time, and
 * diffSnapshots() (snapshotTools.js) compares any two of them. Not used by a page yet; this is the base for charts.
 */
const base = `${import.meta.env.BASE_URL}data/snapshots/`

export async function loadSnapshotIndex(): Promise<SnapshotIndexEntry[]> {
  const res = await fetch(`${base}index.json`, { cache: 'no-cache' })
  if (!res.ok) return []
  return (await res.json()) as SnapshotIndexEntry[]
}

export async function loadSnapshot(entry: SnapshotIndexEntry): Promise<SquadData> {
  const res = await fetch(`${base}${entry.file}`)
  if (!res.ok) throw new Error(`snapshot ${entry.id}: HTTP ${res.status}`)
  return (await res.json()) as SquadData
}
