// Shared by import-statshark.mjs (a file saved by hand) and fetch-statshark.mjs (the daily attempt).
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { normalizeSquadResponse, snapshotId } from '../../src/data/normalizeStatShark.js'

export async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT' && fallback !== undefined) return fallback
    throw error
  }
}

export const indexPath = (dataDir) => resolve(dataDir, 'snapshots', 'index.json')

/**
 * Saves a StatShark squad response as the latest data (if it is the newest) and as a new snapshot.
 * Throws an Error with a readable message when the data is not acceptable. Never deletes anything.
 * @returns {{status: 'imported'|'older'|'already', takenAt: string, players: number, snapshots: number}}
 */
export async function importSquad(raw, { dataDir, sourceId, force = false, now = new Date() }) {
  const data = normalizeSquadResponse(raw, now.toISOString(), sourceId)
  if (data.players.length === 0) throw new Error('the data contains no players.')

  const snapshotsDir = resolve(dataDir, 'snapshots')
  const index = await readJson(indexPath(dataDir), [])

  const takenAt = data.sourceUpdatedAt ?? data.importedAt
  const id = snapshotId(takenAt)
  if (index.some((e) => e.id === id)) {
    return { status: 'already', takenAt, players: data.players.length, snapshots: index.length }
  }

  const newest = index.at(-1)
  if (!force && newest && data.players.length < newest.players * 0.5) {
    throw new Error(`the data has ${data.players.length} players but the last import had ${newest.players}. Use --force if that is right.`)
  }

  await mkdir(snapshotsDir, { recursive: true })
  const json = JSON.stringify(data)
  await writeFile(resolve(snapshotsDir, `${id}.json`), json)

  index.push({ id, file: `${id}.json`, sourceUpdatedAt: data.sourceUpdatedAt, importedAt: data.importedAt, players: data.players.length })
  index.sort((a, b) => String(a.sourceUpdatedAt ?? a.importedAt).localeCompare(String(b.sourceUpdatedAt ?? b.importedAt)))
  await writeFile(indexPath(dataDir), JSON.stringify(index, null, 1) + '\n')

  // The site shows the newest snapshot. An older one only adds to the history.
  const isNewest = index.at(-1).id === id
  if (isNewest) await writeFile(resolve(dataDir, 'squad.json'), json)
  return { status: isNewest ? 'imported' : 'older', takenAt, players: data.players.length, snapshots: index.length }
}
