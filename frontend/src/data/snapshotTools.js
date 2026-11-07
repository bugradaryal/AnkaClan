// Compares two stored snapshots (older, newer). This is the base for future "change over time" charts.
// Only numbers present in BOTH snapshots produce a difference; nothing is guessed.

const FIELDS = ['rating', 'interaction', 'games', 'killsPerSpawn', 'avgTeamPosition', 'winRate', 'avgScore']
const diff = (a, b) => (typeof a === 'number' && typeof b === 'number' ? Math.round((b - a) * 10000) / 10000 : null)

export function diffSnapshots(older, newer) {
  const before = new Map(older.players.map((p) => [p.id, p]))
  const result = []

  for (const player of newer.players) {
    const old = before.get(player.id)
    if (!old) continue // joined after the older snapshot

    const modes = {}
    for (const [modeKey, periods] of Object.entries(player.modes)) {
      for (const [period, now] of Object.entries(periods)) {
        const then = old.modes[modeKey]?.[period]
        if (!then) continue
        const deltas = {}
        for (const f of FIELDS) {
          const d = diff(then[f], now[f])
          if (d !== null) deltas[f] = d
        }
        if (Object.keys(deltas).length > 0) (modes[modeKey] ??= {})[period] = deltas
      }
    }

    const activity = diff(old.activity.total, player.activity.total)
    if (Object.keys(modes).length > 0 || activity !== null) result.push({ id: player.id, name: player.name, activityTotal: activity, modes })
  }
  return result
}
