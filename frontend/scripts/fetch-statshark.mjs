// Tries ONE plain request to the StatShark squad endpoint, at most once every 24 hours, and imports the answer.
//
// StatShark is protected by Cloudflare/Turnstile. This script sends no tokens or cookies and does nothing to get
// past a verification: if StatShark refuses (HTTP 403, a challenge page, anything that is not the JSON) it only
// records the outcome and leaves the existing data alone. Then the normal way applies: save the JSON from a browser
// and import it (see README). It never fails the workflow.
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { importSquad, indexPath, readJson } from './lib/importer.mjs'

const sourceId = process.env.STATSHARK_SQUAD_ID || '1140764'
const url = process.env.STATSHARK_URL || `https://statshark.net/api/stat/MakeSquadRequest/${sourceId}`
const minHours = Number(process.env.FETCH_MIN_HOURS ?? 24)
const force = process.argv.includes('--force')
const dataDir = process.env.DATA_DIR ? resolve(process.env.DATA_DIR) : fileURLToPath(new URL('../public/data', import.meta.url))
const stateFile = resolve(dataDir, 'fetch-state.json')
const userAgent = 'ANKA-Community-Site/1.0 (static site; one request per 24 hours)'

const tooRecent = (iso) => Boolean(iso) && Date.now() - Date.parse(iso) < minHours * 3_600_000

const state = await readJson(stateFile, {})
const index = await readJson(indexPath(dataDir), [])

if (!force && (tooRecent(state.lastAttemptAt) || tooRecent(index.at(-1)?.importedAt))) {
  console.log(`Skipping: StatShark was tried or imported less than ${minHours} hours ago.`)
  process.exit(0)
}

let outcome
let message = null
let httpStatus = null

try {
  const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': userAgent }, signal: AbortSignal.timeout(30_000) })
  httpStatus = res.status
  console.log(`StatShark answered HTTP ${res.status}`)

  if (!res.ok) {
    outcome = 'blocked'
    message = `StatShark answered HTTP ${res.status} (it requires a browser verification). Nothing was changed.`
  } else {
    let raw = null
    try {
      raw = JSON.parse(await res.text())
    } catch {
      /* not JSON: a verification page */
    }
    if (!raw) {
      outcome = 'blocked'
      message = 'The answer was not JSON (probably a verification page). Nothing was changed.'
    } else {
      const result = await importSquad(raw, { dataDir, sourceId })
      outcome = result.status === 'already' ? 'unchanged' : 'imported'
      message = `${result.players} players, source data from ${result.takenAt}.`
    }
  }
} catch (error) {
  outcome = 'error'
  message = error.message
}

await mkdir(dataDir, { recursive: true })
await writeFile(stateFile, JSON.stringify({ lastAttemptAt: new Date().toISOString(), outcome, httpStatus, message }, null, 1) + '\n')

if (outcome === 'blocked' || outcome === 'error') {
  console.log(`::warning title=StatShark not fetched::${message}`)
}
console.log(`Result: ${outcome}. ${message ?? ''}`)
