# Ex1.1 Verification — Chunk Split and CLS Evidence

> Task **T16**. Contract: `docs/contracts/ex1.1-lazy-loading.md`.
> Automated evidence (§1–§2) was produced by Claude Code by running the commands in this session on commit `8852ba0` (Node v26.8.2, Vite 8.3.8).
> Manual evidence (§3) is recorded by the developer from their own browser session.

## 1. Chunk split — `npm run build`

```
vite v8.3.8 building client environment for production...
transforming...
✓ 50 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                          0.56 kB │ gzip:  0.33 kB
dist/assets/PeopleLayout-aKE3Yc-1.css    1.92 kB │ gzip:  0.67 kB
dist/assets/index-Lpwr3t6j.css           9.00 kB │ gzip:  2.30 kB
dist/assets/NotFoundPage-DZnWpAnY.js     0.35 kB │ gzip:  0.24 kB
dist/assets/PeopleLayout-M8YIDfwm.js     0.55 kB │ gzip:  0.34 kB
dist/assets/PersonDetail-DYvnp8zh.js     0.63 kB │ gzip:  0.36 kB
dist/assets/ArenaPage-DIVIyU0K.js       16.55 kB │ gzip:  5.00 kB
dist/assets/index-DjQVtZdM.js          262.44 kB │ gzip: 83.57 kB

✓ built in 250ms
```

| Chunk | Contains | Size (gzip) |
|---|---|---|
| `index-*.js` (entry) | React, React Router, `App`, `AppLayout`, `PeopleIndex`, skeletons, loaders | 262.44 kB (83.57 kB) |
| `ArenaPage-*.js` | Arena page, kill feed, leaderboard, airdrop hooks | 16.55 kB (5.00 kB) |
| `PeopleLayout-*.js` + `PeopleLayout-*.css` | Dossier master list, preload handler, `people.css` | 0.55 kB + 1.92 kB |
| `PersonDetail-*.js` | Dossier detail view | 0.63 kB (0.36 kB) |
| `NotFoundPage-*.js` | 404 page | 0.35 kB (0.24 kB) |

Baseline before code splitting (T10 build, single bundle): `index-*.js` 277.18 kB (87.37 kB gzip).
Entry chunk after T15: 262.44 kB (83.57 kB gzip) → **−14.74 kB raw / −3.80 kB gzip** on first load; each route chunk is fetched only when its route renders (or, for `PersonDetail`, on link hover/focus).

## 2. Automated checks

| Command | Result |
|---|---|
| `npm test` → `test:node` | `tests 95`, `pass 95`, `fail 0`, `cancelled 0`, `skipped 0` |
| `npm test` → `test:ui` (Vitest) | `Test Files 8 passed (8)`, `Tests 27 passed (27)` |
| `npm run lint` | `oxlint src tests vite.config.js` — no diagnostics, exit 0 |
| `npm run build` | exit 0, output in §1 |
| `git diff --check` | no whitespace errors |

## 3. Manual browser checks (developer)

> Results below were observed and reported by the developer (24521771) on 2026-11-16 and transcribed verbatim by Claude Code, which did not run these checks itself.

Setup used (PowerShell): `npm.cmd run build` → `npm.cmd exec -- vite preview --port 4173` (production bundle; the project has no `preview` package script), tested at `http://localhost:4173/people/p-002` in a Chrome Incognito window with DevTools network throttling off; the Lighthouse results come from this production preview.
An earlier attempt on the dev server (`localhost:5173`, Slow 4G) was discarded because the unbundled dev build does not reflect the production chunk split or performance.

### 3.1 Slow 3G — skeleton then content, no visible jump

- Steps: Network → *Slow 3G*, *Disable cache* → open `/people/p-002` in a fresh tab.
- Expected: header + nav immediately; page skeleton in `<main>` → sidebar → dossier skeleton → dossier, with no visible jump.
- **Observed:** No visible jumps. ✅

### 3.2 CLS and Lighthouse

- Steps: Lighthouse → *Navigation*, *Mobile*, on `/people/p-002` (or Performance panel → *Layout shifts* track).
- **CLS:** 0 ✅ (target 0)
- **Lighthouse Accessibility score:** 100 ✅ (target 100)
- **Lighthouse Performance score (optional):** 99

### 3.3 Accessibility tree while loading

- Steps: Slow 3G → open `/people/p-002` → Elements → *Accessibility* pane on the skeleton `<section>`; optionally a screen reader (NVDA/Narrator).
- Expected: `busy: true`, live region `polite`; announcement *Loading player dossier*; placeholder rows not exposed.
- **Observed:** `busy: true`, live region: `polite` — confirmed. ✅ (Screen-reader announcement not separately reported.)

### 3.4 Reduced motion

- Steps: Rendering tab → *Emulate CSS media feature prefers-reduced-motion: reduce* → reload on Slow 3G.
- Expected: skeleton bars visible but static (no shimmer).
- **Observed:** Skeleton static, no shimmer — confirmed. ✅

### 3.5 Developer sign-off

- Checked by: 24521771 · Date: 2026-11-16
