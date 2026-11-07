import { SCHEMA_VERSION } from './normalizeStatShark.js'
import type { LoadResult, SquadData } from './types'

/**
 * Loading order:
 *  1. This browser's saved copy, if it was fetched less than 24 hours ago: used as is, no request at all.
 *  2. Otherwise the data file of the site (kept current by the GitHub Action / the manual import); on success the
 *     saved copy is overwritten and the fetch time is noted.
 *  3. If that request fails: the old saved copy, marked as stale. With no copy at all: an error.
 * StatShark itself is never called from the browser (Cloudflare/Turnstile).
 */
export const CACHE_TTL_HOURS = 24
const CACHE_KEY = 'anka:squad:v3'

interface CacheRecord {
  checkedAt: string
  data: SquadData
}

async function fromSite(): Promise<SquadData> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/squad.json`, { cache: 'no-cache' })
  if (!res.ok) throw new Error(`data file: HTTP ${res.status}`)
  const data = (await res.json()) as SquadData // throws when the host answers with an HTML page
  if (data.schemaVersion !== SCHEMA_VERSION || !Array.isArray(data.players) || data.players.length === 0) {
    throw new Error('data file: unexpected content')
  }
  return data
}

function readCache(): CacheRecord | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const record = JSON.parse(raw) as CacheRecord
    const valid =
      typeof record.checkedAt === 'string' &&
      !Number.isNaN(Date.parse(record.checkedAt)) &&
      record.data?.schemaVersion === SCHEMA_VERSION &&
      record.data.players?.length > 0
    return valid ? record : null
  } catch {
    return null
  }
}

function writeCache(record: CacheRecord) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(record))
  } catch {
    /* storage can be unavailable or full; the saved copy is only a convenience */
  }
}

export function isFresh(checkedAt: string, now = Date.now()): boolean {
  const age = now - Date.parse(checkedAt)
  return age >= 0 && age < CACHE_TTL_HOURS * 3_600_000
}

export async function loadSquad(): Promise<LoadResult> {
  const cached = readCache()
  if (cached && isFresh(cached.checkedAt)) {
    return { data: cached.data, origin: 'cache', checkedAt: cached.checkedAt }
  }

  try {
    const data = await fromSite()
    const checkedAt = new Date().toISOString()
    writeCache({ checkedAt, data })
    return { data, origin: 'network', checkedAt }
  } catch {
    if (cached) return { data: cached.data, origin: 'stale-cache', checkedAt: cached.checkedAt }
    throw new Error('No squad data available.')
  }
}
