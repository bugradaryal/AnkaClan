import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { createServer } from 'node:http'
import { mkdtempSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'

const run = promisify(execFile)
const script = new URL('./fetch-statshark.mjs', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const fixture = readFileSync(new URL('./fixtures/statshark-sample.json', import.meta.url), 'utf8')

async function withServer(handler, fn) {
  let requests = 0
  const server = createServer((req, res) => {
    requests++
    handler(req, res)
  })
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  try {
    return await fn(`http://127.0.0.1:${server.address().port}/api`, () => requests)
  } finally {
    server.close()
  }
}

const exec = (dir, url, ...args) =>
  run(process.execPath, [script, ...args], { env: { ...process.env, DATA_DIR: dir, STATSHARK_URL: url } })

const readState = (dir) => JSON.parse(readFileSync(join(dir, 'fetch-state.json'), 'utf8'))

test('a good answer is imported; a second run within 24 hours makes no request', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'anka-'))
  await withServer(
    (_req, res) => res.writeHead(200, { 'Content-Type': 'application/json' }).end(fixture),
    async (url, count) => {
      const first = await exec(dir, url)
      assert.match(first.stdout, /Result: imported/)
      assert.equal(count(), 1)
      assert.equal(readState(dir).outcome, 'imported')
      assert.equal(JSON.parse(readFileSync(join(dir, 'squad.json'), 'utf8')).players.length, 4)

      const second = await exec(dir, url)
      assert.match(second.stdout, /Skipping/)
      assert.equal(count(), 1)
    },
  )
})

test('a refusal (403) or a verification page leaves the data alone and does not fail', async () => {
  for (const respond of [
    (_req, res) => res.writeHead(403).end('Forbidden'),
    (_req, res) => res.writeHead(200, { 'Content-Type': 'text/html' }).end('<html>Just a moment...</html>'),
  ]) {
    const dir = mkdtempSync(join(tmpdir(), 'anka-'))
    await withServer(respond, async (url) => {
      const result = await exec(dir, url)
      assert.match(result.stdout, /Result: blocked/)
      assert.match(result.stdout, /::warning/)
      assert.equal(existsSync(join(dir, 'squad.json')), false)
      assert.equal(readState(dir).outcome, 'blocked')
    })
  }
})

test('a failed attempt is not repeated within 24 hours either', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'anka-'))
  await withServer(
    (_req, res) => res.writeHead(403).end('Forbidden'),
    async (url, count) => {
      await exec(dir, url)
      const again = await exec(dir, url)
      assert.match(again.stdout, /Skipping/)
      assert.equal(count(), 1)
    },
  )
})
