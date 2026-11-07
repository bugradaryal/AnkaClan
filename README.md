# ANKA Thunder

Community site for the ANKA War Thunder squadron: home page + public statistics page.
**No server and no database.** Static site on GitHub Pages; the only cost is the domain name.

- React + TypeScript + Vite + Tailwind, TanStack Query, Recharts, Framer Motion
- Data: the StatShark squad response (`GET https://statshark.net/api/stat/MakeSquadRequest/1140764`), one request = all 128 members

## Where the data comes from
The squad endpoint returns the whole squadron (basic info + every player with Air/Ground/Ship/Helicopter modes,
Monthly and Total) in **one** response, so no per-player requests are needed.
StatShark sits behind Cloudflare and Turnstile, so the data cannot be fetched automatically, and we do not try to
get around that. Two ways bring data in; the site shows the newest:

1. **By hand (the normal way).** Save the `MakeSquadRequest/1140764` response from a normal browser visit as a `.json`
   file, then either
   - **locally:** `cd frontend && npm run data:import -- path/to/anka_squadron.json`, commit and push; or
   - **on GitHub:** upload it as `frontend/data-inbox/anka_squadron.json` (Add file -> Upload files, commit to `main`).
     The workflow imports it, commits the result and redeploys.
2. **A daily attempt by the GitHub Action** (`scripts/fetch-statshark.mjs`): one plain request, at most once every
   24 hours (counted from the last attempt and from the last import; the outcome is kept in `public/data/fetch-state.json`).
   It sends no tokens or cookies. If StatShark refuses (403, a verification page), the data stays as it is and the log shows
   a warning. Today StatShark is expected to refuse; the attempt only starts to matter if StatShark ever offers a normal way.

An import is skipped if that exact data (same `lastUpdated`) was already imported, and refused if the file is not a
StatShark squad response or lost more than half of the players (`--force` overrides the last check).
Please read StatShark's terms and consider asking them for an official/automatic way before relying on this long term.

## What the browser does (24-hour rule)
1. The browser keeps its own copy (localStorage) together with the time it was fetched.
2. Opening the site: if that copy is less than 24 hours old it is used and **no request is made**.
3. Otherwise the site's data file (`data/squad.json`) is requested; on success the copy and the fetch time are overwritten.
4. If the request fails, the old copy is shown with a notice; with no copy at all, an error message.
The Stats page shows both times: when StatShark updated the squadron (`lastUpdated`) and when this device last checked.
So after you publish new data, a visitor can see it up to 24 hours late.

## Data and history
Each import writes (never deleting older ones):
- `frontend/public/data/squad.json` - the latest data the site reads
- `frontend/public/data/snapshots/<time>.json` - one snapshot per import (about 125 KB each)
- `frontend/public/data/snapshots/index.json` - the list of snapshots

Players are identified by their StatShark `id` in every snapshot. `src/data/snapshotTools.js` (`diffSnapshots`) compares
any two snapshots, and `src/data/history.ts` loads them: the base for future "change over time" charts (no page uses it yet).

## What is shown (field names checked against a real response)
| Site | Source field |
|---|---|
| Player, ID, joined, role | `name`, `id`, `joinDate`, `role` |
| Activity | `activity.total` (also `activity.current`, and `periodActivity`, kept in the data) |
| Personal squadron rating | `rating` (0 for everyone in the ANKA data) |
| SR1 rating | `sr1rating.<mode>.<period>.wt8` (checked: a StatShark profile shows SR1 1356.75 for the player whose `wt8` is 1356.77) |
| Interaction, Games | `interaction`, `total_games` |
| Kills/spawn | `general_stats.kills` (StatShark "Kills per Spawn", **not** K/D: the source has no deaths) |
| Avg. team position, Win rate | `general_stats.position`, `general_stats.win` (fractions, shown as %) |
| Avg. score | `general_stats.score` |

Modes shown: Air Realistic, Air Arcade, Ground Realistic, Ground Arcade (`tank_*` = ground), each as Total or Monthly.
The data also has simulation, ship and helicopter modes; they are stored in the snapshots but not shown yet.

Rules the importer follows: `-1` inside `general_stats` means "no data" and `wt8 = 0` means "rating not calculated";
both become empty ("-"). Nothing is calculated or guessed. StatShark's own "suspicious" flags are not carried over.

Not available: **Avg. SR1** (no such field in the response, and we do not estimate it), K/D, deaths, kills, assists, and
StatShark's **Comparative rating** (a percentage that places a player among other players, shown next to SR1 on a
StatShark profile; it is not in the squad response). SR1 is the absolute rating; the comparative figure is only a ranking of it.
The squad's `squadronRating` (20,455,000) is not shown: its meaning could not be checked and it is far above the
squadron ratings Gaijin's own pages show, so it stays out until it can be confirmed.
Role names: role 0 is the commander (matches the creator id); the other codes follow War Thunder's rank order
(Deputy, Officer, Sergeant, Er = Private, the lowest rank, 110 of 128 members) and fit the member counts, but StatShark does not document them. Fix them in `src/data/roles.ts`.

## Run on your computer
```bash
cd frontend
npm install
npm run dev      # http://localhost:5173  (the current data is already in public/data)
npm test         # tests for the conversion, the history tools and the import script
```

## Publish (GitHub Pages)
1. Public GitHub repository (GitHub Pages is free only for public repositories), this folder as the repository root.
2. Settings -> Pages -> Source: **GitHub Actions**. Optional variables (Settings -> Secrets and variables -> Actions -> Variables):
   `SQUADRON_NAME`, `DISCORD_URL`, and `VITE_BASE` (only if the site is at `user.github.io/repo-name/`: set `/repo-name/`; empty for a custom domain).
3. Push to `main` (or Actions -> "Import data and deploy" -> Run workflow).
4. Custom domain: Settings -> Pages -> Custom domain, then the DNS records GitHub shows.

## Where to change things
| What | Where |
|---|---|
| Squadron name / Discord link | repository variables or `frontend/.env` |
| Achievements on the home page | `frontend/src/features/achievements/achievements.ts` |
| Role names | `frontend/src/data/roles.ts` |
| Default table sort / column order | `frontend/src/features/squad/PlayerTable.tsx` (`useState('rating')` and the `columns` list) |
| Modes shown | `frontend/src/data/modes.ts` |
| Data conversion | `frontend/src/data/normalizeStatShark.js` |

`archive/thunderskill/` holds the earlier ThunderSkill version of the data code (not used).
