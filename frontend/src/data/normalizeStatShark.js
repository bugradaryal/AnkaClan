// Turns the StatShark squad response (GET /api/stat/MakeSquadRequest/<squad id>) into the stable shape the site uses.
// Shared by scripts/import-statshark.mjs and the tests. Field names come from a real response, not from guesses:
//   basic{...}, players[]{ name, id, joinDate, role, activity{periodActivity,current,total}, rating,
//   sr1rating{ <mode>{ total|monthly { wt8, interaction, total_games, general_stats{kills,position,win,score} } } } }
// Values the source does not provide stay null. StatShark's own "suspicious" flags are not carried over.

export const SCHEMA_VERSION = 2
export const PERIODS = ['total', 'monthly']

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null)
// The source marks "no data" with -1 inside general_stats, and with 0 for a rating that was not calculated.
const nonNegative = (v) => (num(v) !== null && v >= 0 ? v : null)
const positive = (v) => (num(v) !== null && v > 0 ? v : null)
const text = (v) => (typeof v === 'string' && v.length > 0 ? v : null)
// 4 decimals keep snapshots small and are far more than the site shows.
const round = (v) => (v === null ? null : Math.round(v * 10000) / 10000)
const isoFromUnix = (s) => (typeof s === 'number' && Number.isFinite(s) && s > 0 ? new Date(s * 1000).toISOString() : null)

function normalizeBlock(block) {
  if (!block || typeof block !== 'object') return null
  const g = block.general_stats && typeof block.general_stats === 'object' ? block.general_stats : {}
  const stats = {
    rating: round(positive(block.wt8)), // "wt8" = the mode rating StatShark shows
    interaction: round(positive(block.interaction)),
    games: num(block.total_games),
    killsPerSpawn: round(nonNegative(g.kills)), // StatShark "Kills per Spawn". NOT K/D: the source has no deaths.
    avgTeamPosition: round(nonNegative(g.position)), // fraction 0..1
    winRate: round(nonNegative(g.win)), // fraction 0..1
    avgScore: round(nonNegative(g.score)),
  }
  return Object.values(stats).every((v) => v === null) ? null : stats
}

function normalizeModes(sr1) {
  const modes = {}
  if (!sr1 || typeof sr1 !== 'object') return modes
  for (const [modeKey, periods] of Object.entries(sr1)) {
    const entry = {}
    for (const period of PERIODS) {
      const stats = normalizeBlock(periods?.[period])
      if (stats) entry[period] = stats
    }
    if (Object.keys(entry).length > 0) modes[modeKey] = entry
  }
  return modes
}

function normalizePlayer(p) {
  const id = p?.id !== undefined && p?.id !== null ? String(p.id) : null
  const name = text(p?.name)
  if (!id || !name) return null

  const role = Number(p.role)
  const a = p.activity && typeof p.activity === 'object' ? p.activity : {}
  const periods = {}
  for (const [k, v] of Object.entries(a.periodActivity ?? {})) if (num(v) !== null) periods[k] = v

  return {
    id,
    name,
    joinedAt: isoFromUnix(p.joinDate),
    role: Number.isInteger(role) ? role : null,
    activity: { current: num(a.current), total: num(a.total), periods },
    personalRating: num(p.rating), // "Personal Squadron Rating"
    modes: normalizeModes(p.sr1rating),
  }
}

/** @param {unknown} raw  parsed response   @param {string} importedAt ISO time of the import   @param {string|null} sourceId squad id */
export function normalizeSquadResponse(raw, importedAt, sourceId = null) {
  if (!raw || typeof raw !== 'object' || !raw.basic || !Array.isArray(raw.players)) {
    throw new Error('Unexpected StatShark format (no basic/players).')
  }
  const b = raw.basic
  return {
    schemaVersion: SCHEMA_VERSION,
    source: 'statshark',
    importedAt,
    sourceUpdatedAt: isoFromUnix(b.lastUpdated),
    squad: {
      sourceId,
      name: text(b.name),
      tag: text(b.tag),
      region: text(b.region),
      memberCount: num(b.memberCount),
      memberLimit: num(b.memberLimit),
      createdAt: isoFromUnix(b.creationDate),
      creatorId: text(b.creatorUid),
      activityPoints: num(b.activityPoints),
      squadronRating: num(b.squadronRating),
    },
    players: raw.players.map(normalizePlayer).filter(Boolean),
  }
}

/** File-name friendly id of a snapshot, for example 2026-11-06T15-08-08Z. */
export function snapshotId(iso) {
  return new Date(iso).toISOString().slice(0, 19).replace(/:/g, '-') + 'Z'
}
