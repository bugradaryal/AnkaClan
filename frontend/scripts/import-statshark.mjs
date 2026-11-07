// Imports a StatShark squad response (the JSON of GET /api/stat/MakeSquadRequest/<squad id>) saved by hand:
//   public/data/squad.json                  the latest data the site reads
//   public/data/snapshots/<time>.json       one snapshot per import, never deleted
//   public/data/snapshots/index.json        list of all snapshots (oldest first)
//
// Usage:  node scripts/import-statshark.mjs path/to/anka_squadron.json [--force]
// This script never contacts StatShark.
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { importSquad, readJson } from './lib/importer.mjs'

const args = process.argv.slice(2)
const force = args.includes('--force')
const input = args.find((a) => !a.startsWith('--'))
const sourceId = process.env.STATSHARK_SQUAD_ID || '1140764'
const dataDir = process.env.DATA_DIR ? resolve(process.env.DATA_DIR) : fileURLToPath(new URL('../public/data', import.meta.url))

function fail(message) {
  console.error(`Import failed: ${message}`)
  process.exit(1)
}

if (!input) fail('give the path of the StatShark JSON file.')

let raw
try {
  raw = await readJson(resolve(input))
} catch (error) {
  fail(`cannot read ${input}: ${error.message}`)
}

try {
  const result = await importSquad(raw, { dataDir, sourceId, force })
  if (result.status === 'already') {
    console.log(`Already imported (source data from ${result.takenAt}). Nothing to do.`)
  } else if (result.status === 'older') {
    console.log(`Saved ${result.players} players as an older snapshot (${result.takenAt}); the latest data was not changed.`)
  } else {
    console.log(`Saved ${result.players} players. Latest data is now from ${result.takenAt}.`)
  }
  console.log(`Snapshots stored: ${result.snapshots}`)
} catch (error) {
  fail(error.message)
}
