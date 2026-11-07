import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { normalizeSquadResponse, snapshotId } from '../src/data/normalizeStatShark.js'
import { diffSnapshots } from '../src/data/snapshotTools.js'

// scripts/fixtures/statshark-sample.json is a slice of a real ANKA response (4 of the 128 players).
const raw = JSON.parse(await readFile(new URL('./fixtures/statshark-sample.json', import.meta.url), 'utf8'))
const data = normalizeSquadResponse(raw, '2026-11-06T16:00:00.000Z', '1140764')
const byName = (n) => data.players.find((p) => p.name === n)

test('squad info', () => {
  assert.equal(data.source, 'statshark')
  assert.equal(data.squad.name, 'ANKA')
  assert.equal(data.squad.memberCount, 128)
  assert.equal(data.squad.sourceId, '1140764')
  assert.equal(data.squad.creatorId, '149709052')
  assert.equal(data.squad.squadronRating, 20455000)
  assert.equal(data.sourceUpdatedAt, '2026-11-06T15:08:08.000Z')
  assert.equal(data.squad.createdAt, '2025-12-09T18:09:58.000Z')
})

test('players are identified by id, with role, join date and activity', () => {
  const p = byName('the-maestro')
  assert.equal(p.id, '149709052')
  assert.equal(p.role, 0)
  assert.equal(p.joinedAt, '2025-12-09T18:09:58.000Z')
  assert.equal(p.activity.total, 3960)
  assert.equal(p.activity.current, 0)
  assert.equal(Object.keys(p.activity.periods).length, 10)
  assert.equal(p.personalRating, 0)
})

test('mode stats keep monthly and total apart', () => {
  const m = byName('the-maestro').modes.air_realistic
  assert.equal(m.total.rating, 927.3443)
  assert.equal(m.total.games, 4791)
  assert.equal(m.total.killsPerSpawn, 0.451)
  assert.equal(m.total.avgTeamPosition, 0.4714)
  assert.equal(m.total.winRate, 0.4803)
  assert.equal(m.total.avgScore, 608.7646)
  assert.equal(m.monthly.rating, 732.1201)
  assert.equal(m.monthly.games, 366)
  assert.ok(byName('the-maestro').modes.air_arcade.total)
  assert.equal(byName('the-maestro').modes.air_arcade.monthly, undefined) // no monthly data in the source
})

test('the source marker -1 (no data) becomes null, not a number', () => {
  const m = byName('Oyuasx').modes.air_realistic.monthly
  assert.equal(m.games, 69)
  assert.equal(m.rating, null)
  assert.equal(m.killsPerSpawn, null)
  assert.equal(m.avgTeamPosition, null)
  assert.equal(m.winRate, null)
  assert.equal(m.avgScore, null)
})

test('a player without statistics has no modes, and empty modes are left out', () => {
  assert.deepEqual(byName('S0kaBlyat').modes, {})
  assert.equal(byName('the-maestro').modes.air_simulation, undefined)
})

test('unexpected formats are rejected', () => {
  assert.throws(() => normalizeSquadResponse({ hello: 'world' }, 'now'))
  assert.throws(() => normalizeSquadResponse({ basic: {}, players: 'x' }, 'now'))
})

test('snapshot id is file-name friendly', () => {
  assert.equal(snapshotId('2026-11-06T15:08:08.000Z'), '2026-11-06T15-08-08Z')
})

test('diffSnapshots compares two snapshots by player id', () => {
  const older = structuredClone(data)
  const newer = structuredClone(data)
  newer.players.find((p) => p.id === '149709052').modes.air_realistic.total.games = 4801
  newer.players.find((p) => p.id === '149709052').modes.air_realistic.total.rating = 930.3443
  const diff = diffSnapshots(older, newer)
  const d = diff.find((x) => x.id === '149709052')
  assert.equal(d.modes.air_realistic.total.games, 10)
  assert.equal(d.modes.air_realistic.total.rating, 3)
  assert.equal(d.modes.air_realistic.total.winRate, 0)
  // a player who is only in the newer snapshot is not compared
  newer.players.push({ ...structuredClone(newer.players[0]), id: '1' })
  assert.equal(diffSnapshots(older, newer).some((x) => x.id === '1'), false)
})
