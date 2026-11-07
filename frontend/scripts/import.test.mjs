import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const script = new URL('./import-statshark.mjs', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const fixture = new URL('./fixtures/statshark-sample.json', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')

function run(dir, file, ...extra) {
  return spawnSync(process.execPath, [script, file, ...extra], { env: { ...process.env, DATA_DIR: dir }, encoding: 'utf8' })
}

test('import writes latest data, a snapshot and the index; repeating it changes nothing', () => {
  const dir = mkdtempSync(join(tmpdir(), 'anka-'))
  const first = run(dir, fixture)
  assert.equal(first.status, 0, first.stderr)
  assert.ok(existsSync(join(dir, 'squad.json')))
  const index = JSON.parse(readFileSync(join(dir, 'snapshots', 'index.json'), 'utf8'))
  assert.equal(index.length, 1)
  assert.equal(index[0].id, '2026-11-06T15-08-08Z')
  assert.equal(index[0].players, 4)
  assert.equal(JSON.parse(readFileSync(join(dir, 'squad.json'), 'utf8')).players.length, 4)

  const again = run(dir, fixture)
  assert.equal(again.status, 0)
  assert.match(again.stdout, /Already imported/)
  assert.equal(JSON.parse(readFileSync(join(dir, 'snapshots', 'index.json'), 'utf8')).length, 1)
})

test('a newer file adds a second snapshot and keeps the first one', () => {
  const dir = mkdtempSync(join(tmpdir(), 'anka-'))
  run(dir, fixture)
  const raw = JSON.parse(readFileSync(fixture, 'utf8'))
  raw.basic.lastUpdated += 3600
  const next = join(dir, 'next.json')
  writeFileSync(next, JSON.stringify(raw))
  assert.equal(run(dir, next).status, 0)
  const files = readdirSync(join(dir, 'snapshots')).sort()
  assert.deepEqual(files, ['2026-11-06T15-08-08Z.json', '2026-11-06T16-08-08Z.json', 'index.json'])
  assert.equal(JSON.parse(readFileSync(join(dir, 'squad.json'), 'utf8')).sourceUpdatedAt, '2026-11-06T16:08:08.000Z')
})

test('an older file only adds to the history', () => {
  const dir = mkdtempSync(join(tmpdir(), 'anka-'))
  run(dir, fixture)
  const raw = JSON.parse(readFileSync(fixture, 'utf8'))
  raw.basic.lastUpdated -= 86400
  const older = join(dir, 'older.json')
  writeFileSync(older, JSON.stringify(raw))
  assert.equal(run(dir, older).status, 0)
  assert.equal(JSON.parse(readFileSync(join(dir, 'snapshots', 'index.json'), 'utf8')).length, 2)
  assert.equal(JSON.parse(readFileSync(join(dir, 'squad.json'), 'utf8')).sourceUpdatedAt, '2026-11-06T15:08:08.000Z')
})

test('bad files are refused and leave the data alone', () => {
  const dir = mkdtempSync(join(tmpdir(), 'anka-'))
  run(dir, fixture)
  const bad = join(dir, 'bad.json')
  writeFileSync(bad, '<html>Just a moment...</html>')
  assert.equal(run(dir, bad).status, 1)
  writeFileSync(bad, JSON.stringify({ basic: { lastUpdated: 1 }, players: [] }))
  assert.equal(run(dir, bad).status, 1)
  assert.equal(JSON.parse(readFileSync(join(dir, 'snapshots', 'index.json'), 'utf8')).length, 1)
})

test('a file that lost most players is refused unless forced', () => {
  const dir = mkdtempSync(join(tmpdir(), 'anka-'))
  run(dir, fixture)
  const raw = JSON.parse(readFileSync(fixture, 'utf8'))
  raw.basic.lastUpdated += 60
  raw.players = raw.players.slice(0, 1)
  const small = join(dir, 'small.json')
  writeFileSync(small, JSON.stringify(raw))
  const refused = run(dir, small)
  assert.equal(refused.status, 1)
  assert.match(refused.stderr, /--force/)
  assert.equal(run(dir, small, '--force').status, 0)
})
