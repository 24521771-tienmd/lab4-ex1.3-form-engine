# Ex1.2 Verification — Sprint 1 DevTools Checkpoints

> Task T18 · Lab 4 Exercise 1.2 · Slides 10–12.
> Checks 1–5 are **manual** and performed by the student (`project-rules.md` §9). Check 6 was run by Claude Code in the same session and its output is pasted verbatim.

| Field | Value |
|---|---|
| Code under test | `eb48ce4 style(people): add responsive master-detail CSS grid` |
| Runtime | Node v26.8.2 · npm 11.19.1 · Windows 11 |
| Browser (student) | Google Chrome (desktop) with DevTools device toolbar |
| Date of manual checks | 2026-11-16 (Lighthouse run 20:25:28) |
| Checked by | Student (repository owner) |

Start the app with `npm run dev` and open `http://localhost:5173/`. Keep DevTools open (F12) for every check.

---

## 1. Console — zero warnings / errors

Navigate in this order using the UI and the address bar: `/` → `/people` → `/people/p-002` → `/people/p-999` → `/nope`.

- [x] Console shows **0 errors** and **0 warnings** (filter: *All levels*) across the whole sequence.
- [x] `/people/p-999` shows the *404: Person Not Found* alert (not a blank screen).
- [x] `/nope` shows *Page not found*.

**Result:** Pass — confirmed by student.
**Notes / screenshot:** No details reported beyond the pass confirmation.

## 2. Deep link survives a reload

- [x] Open `http://localhost:5173/people/p-004` directly in a new tab → the dossier for `p-004` renders.
- [x] Press F5 / Ctrl+R → the same dossier renders again (no 404 from the dev server).

**Result:** Pass — confirmed by student.

## 3. URL parameters and history stay in sync

- [x] Clicking a dossier link updates the address bar to `/people/p-00N` and that link becomes active (`aria-current="page"`, class `active-link` in the Elements panel).
- [x] Browser **Back** / **Forward** move between dossiers and the active link + detail panel follow the URL.
- [x] The primary nav shows *Arena* active only on `/`, and *People* active on `/people` and `/people/:id`.

**Result:** Pass — confirmed by student. The screenshot at `/people/p-005` shows *People* active (bold + underline bar) and *Hoang "Drift" Bao* active (bold + left bar) with its detail rendered.

## 4. Accessibility tree

Elements panel → *Accessibility* pane (or Lighthouse / axe), on `/people/p-002`:

- [x] Exactly **one** `main` landmark.
- [x] Two named `navigation` landmarks: *Primary* and *Player dossiers*.
- [x] The detail uses `dl` with `dt` (*Name*, *Role*) / `dd` pairs.

**Result:** Pass — confirmed by student.

## 5. Responsive layout and Lighthouse

Device toolbar (Ctrl+Shift+M) → *Responsive*:

- [x] **375px** wide on `/people/p-003`: single column, **no horizontal scroll** (`document.documentElement.scrollWidth <= 375` → `true` in the Console).
- [x] Above **640px**: two columns (list left, detail right).
- [x] Keyboard Tab shows a visible focus outline; the active link is distinguishable without colour (bold + bar).
- [x] Lighthouse → *Accessibility* category (run on `/people/p-005`).

**375px result:** Pass — screenshot at 375 × 812 on `/people/p-005`: single column (dossier list above the detail card), no horizontal overflow, long names wrap inside their cards; confirmed by student.
**Lighthouse Accessibility:** run in **snapshot** mode on `/people/p-005` → Accessibility **20/20** audits passed (Performance 1/1, Best Practices 4/4). Snapshot mode reports passed-audit counts, not a 0–100 score; no failing accessibility audits.
**Screenshot reference:** Chrome DevTools screenshot (375 × 812, `/people/p-005`, Lighthouse panel) shared by the student in the Claude Code session on 2026-11-16; not stored in the repository.

---

## 6. Automated checks (run by Claude Code at `eb48ce4`)

### `npm test`

`npm test` = `npm run test:node && npm run test:ui` → exit code **0**.

```
> node --test "tests/**/*.test.js"
ℹ tests 92
ℹ suites 0
ℹ pass 92
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 324.7501

> vitest run
 RUN  v5.1.0
 Test Files  3 passed (3)
      Tests  9 passed (9)
```

### `npm run lint`

```
> oxlint src tests vite.config.js
(no diagnostics) — exit code 0
```

### `npm run build`

```
vite v8.3.8 building client environment for production...
✓ 44 modules transformed.
dist/index.html                   0.56 kB │ gzip:  0.33 kB
dist/assets/index-CFTIRhfO.css    9.27 kB │ gzip:  2.20 kB
dist/assets/index-oD5yyaKB.js   277.18 kB │ gzip: 87.37 kB
✓ built in 213ms
```

### Legacy API guard

```
$ git grep -nE "Switch|activeClassName|react-router-dom|exact[ =]|component=\{" src
(no matches) — exit code 1
```

### `git diff --check`

```
(no output) — exit code 0
```
