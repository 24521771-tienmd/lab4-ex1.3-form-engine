# Task Decomposition — Lab 4 · Ex1.2 (Exercises 1.2 / 1.2.1 / 1.2.2 + Sprint 1)

> **Goal:** turn the Lab 3 HW3 single-view PUBG Arena into a React Router v7 multi-route SPA with a nested layout, active `NavLink`s, and a responsive master–detail *Case Dossier* (`PeopleLayout` + `PersonDetail`).
> **Rules:** `project-rules.md` · **Workflow:** `CLAUDE.md` · **Slides:** 10, 11, 12.
> **Commit budget:** ≥ 10 atomic commits required → this plan has **19** (T01–T19), excluding the baseline import T00.

## Legend

Stages follow the 4-stage loop: **[1] Contract · [2] Fail Test (RED) · [3] Implement (GREEN) · [4] Refactor** · `ops` = docs/tooling task.
Every task is one commit with exactly the message shown. Tick `[x]` inside the same commit.

## Summary

| ID | Stage | Commit message |
|---|---|---|
| T00 | ops | `chore: import Lab 3 HW3 baseline` *(done manually during setup)* |
| T01 | ops | `docs(history): archive Lab 3 HW3 documentation` |
| T02 | ops | `docs(rules): add Lab 4 Ex1.2 project rules and Claude workflow` |
| T03 | ops | `docs(plan): add Ex1.2 task decomposition and AI audit log` |
| T04 | ops | `chore(git): ignore env files and coverage output` |
| T05 | ops | `build(test): add Vitest and Testing Library for component tests` |
| T06 | ops | `build(deps): add react-router v7` |
| T07 | [1] | `docs(contract): define Ex1.2 route map and people dossier contract` |
| T08 | [2] | `test(people): add failing tests for people dossier dataset` |
| T09 | [3] | `feat(data): add illustrative people dossier dataset` |
| T10 | [4] | `refactor(arena): extract arena screen into ArenaPage` |
| T11 | [2] | `test(router): add failing tests for app layout and primary navigation` |
| T12 | [3] | `feat(router): add React Router v7 app layout with NavLink and Outlet` |
| T13 | [2] | `test(people): add failing tests for PeopleLayout master list` |
| T14 | [3] | `feat(people): add PeopleLayout router layout with NavLink sidebar` |
| T15 | [2] | `test(people): add failing tests for PersonDetail param lookup and 404` |
| T16 | [3] | `feat(people): add PersonDetail detail route handling with 404 boundary` |
| T17 | [4] | `style(people): add responsive master-detail CSS grid` |
| T18 | ops | `docs(verification): record Ex1.2 DevTools checkpoints` |
| T19 | ops | `docs(readme): document Ex1.2 routes and scripts` |

Sprint 1 slide commits map to **T14** (*feat: router layout*) and **T16** (*feat: detail route handling*).

---

## Tasks

### T00 · ops · `chore: import Lab 3 HW3 baseline`
- [x] Done during setup (see `HUONG_DAN_SETUP.md`): HW3 code copied without its `.git`, `git init -b main`, first commit.

### T01 · ops · `docs(history): archive Lab 3 HW3 documentation`
- [x] Done *(ticked when T03 adds this file)*
- **Do:** `git mv` `project-rules.md`, `TASK_DECOMPOSITION.md`, `AI_FAILURE_AUDIT.md` → `docs/history/lab3-hw3/`. Keep `README.md` in place (updated in T19).
- **Done when:** the three files exist only under `docs/history/lab3-hw3/`; `npm test` still passes.

### T02 · ops · `docs(rules): add Lab 4 Ex1.2 project rules and Claude workflow`
- [x] Done *(ticked when T03 adds this file)*
- **Do:** copy `../_lab4-kit/Ex1.2/project-rules.md` and `../_lab4-kit/Ex1.2/CLAUDE.md` to the repo root, unchanged.

### T03 · ops · `docs(plan): add Ex1.2 task decomposition and AI audit log`
- [x] Done
- **Do:** copy `../_lab4-kit/Ex1.2/TASK_DECOMPOSITION.md` and `../_lab4-kit/Ex1.2/AI_FAILURE_AUDIT.md` to the root; tick T01–T03.

### T04 · ops · `chore(git): ignore env files and coverage output`
- [x] Done
- **Files:** `.gitignore`
- **Do:** append `.env`, `.env.*`, `!.env.example`, `coverage/`.
- **Done when:** `git check-ignore .env` prints `.env`; `git check-ignore .env.example` prints nothing.

### T05 · ops · `build(test): add Vitest and Testing Library for component tests`
- [x] Done
- **Files:** `package.json`, `package-lock.json`, `vitest.config.js`, `src/setupTests.js`, `src/App.test.jsx`
- **Do:**
  - `npm install -D vitest@^5 @testing-library/react@^16 @testing-library/user-event@^14 @testing-library/jest-dom@^7 jsdom`
  - `vitest.config.js`: `@vitejs/plugin-react`, `environment: 'jsdom'`, `include: ['src/**/*.test.jsx']`, `setupFiles: ['./src/setupTests.js']`.
  - `src/setupTests.js`: `import '@testing-library/jest-dom/vitest'` + `afterEach(cleanup)`.
  - Scripts: `"test": "npm run test:node && npm run test:ui"`, `"test:node": "node --test \"tests/**/*.test.js\""`, `"test:ui": "vitest run"`.
  - `src/App.test.jsx`: renders `<App />` and finds the heading *KRAFTON x PUBG Vietnam* (proves the harness works).
- **Done when:** `npm test` runs both suites green (HW3 had 84 `node:test` tests — the count must not drop); lint and build pass.
- **Trap:** do **not** create a `src/test/` folder (see `project-rules.md` §9).

### T06 · ops · `build(deps): add react-router v7`
- [x] Done
- **Do:** `npm install react-router@^7`. Do **not** install `react-router-dom` (v7 merged it into `react-router`); verify that `package.json` shows `^7.x`, not `^8`.
- **Done when:** `npm ls react-router` shows 7.x; build passes.

### T07 · [1] Contract · `docs(contract): define Ex1.2 route map and people dossier contract`
- [x] Done
- **Files:** `docs/contracts/ex1.2-routing.md`
- **Content:**
  - The route map table from `project-rules.md` §2.
  - Component contracts:
    - `AppLayout()` → header + `<nav aria-label="Primary">` (`Arena` → `/` with `end`, `People` → `/people`) + `<main id="main-content"><Outlet /></main>` + footer.
    - `PeopleLayout({ people })` → `<section className="people-frame">` with `<nav aria-label="Player dossiers">` list of `NavLink`s to `/people/:id` + `<section className="content-area"><Outlet /></section>`.
    - `PersonDetail({ people })` → `useParams()` → `people.find(p => p.id === id)` → not found: `<p role="alert">404: Person Not Found</p>` + link back to `/people`; found: `<article>` with `<h2>{name}</h2>` and `<dl className="person-details">` (`Name`, `Role`).
  - `NavLink` class contract: `({ isActive }) => isActive ? 'active-link' : 'link'` (React Router also sets `aria-current="page"`).
  - Data: `Person = { id: string, name: string, role: string }`, ids `p-001`…, `PERSON_ROLES` = `['In-Game Leader', 'Fragger', 'Support', 'Scout', 'Sniper', 'Analyst']`.
  - **Decision D1:** the slide-22 sample nests `<main>` inside the layout; we use `<section className="content-area">` because `AppLayout` already owns the single `<main>`.

### T08 · [2] Fail Test · `test(people): add failing tests for people dossier dataset`
- [x] Done
- **Files:** `tests/people.test.js` (`node:test`)
- **Assert:** `people` has ≥ 6 entries; each object has **exactly** the keys `id`, `name`, `role`; every value is a non-empty trimmed string; ids are unique and match `/^p-\d{3}$/`; every `role` is in `PERSON_ROLES`; `PEOPLE_DATA_SOURCE` mentions that the data is illustrative.
- **Done when:** `npm run test:node` fails **only** because `src/data/people.js` does not exist yet.

### T09 · [3] Implement · `feat(data): add illustrative people dossier dataset`
- [x] Done
- **Files:** `src/data/people.js`
- **Do:** export `PEOPLE_DATA_SOURCE`, `PERSON_ROLES`, and `people` (6 fictional PUBG VN dossier entries, e.g. `{ id: 'p-001', name: 'Tran "Viper" Minh', role: 'In-Game Leader' }`). JSDoc `@typedef Person`. Freeze the array and objects.
- **Done when:** all tests green, lint, build.

### T10 · [4] Refactor · `refactor(arena): extract arena screen into ArenaPage`
- [x] Done
- **Files:** `src/pages/ArenaPage.jsx`, `src/App.jsx`, `tests/app-shell.test.js`, `src/App.test.jsx`
- **Do:** move the arena body (intro, leaderboard, kill feed, airdrop section, hooks used by it) from `App.jsx` into `ArenaPage`. `ArenaPage` must **not** render `<main>`, the header, or the footer — `App.jsx` keeps them for now and renders `<ArenaPage />` inside `<main>`. Update `tests/app-shell.test.js` (it reads `App.jsx` source with regexes) so it checks `<main` in `App.jsx` and the `<h1>` in `ArenaPage.jsx`.
- **Done when:** no visual/behaviour change; all tests green.

### T11 · [2] Fail Test · `test(router): add failing tests for app layout and primary navigation`
- [x] Done
- **Files:** `src/App.test.jsx`
- **Assert** (render `<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>`):
  - `/` → exactly one `main` landmark; `navigation` named *Primary* with links *Arena* (`href="/"`) and *People* (`href="/people"`); *Arena* link has `aria-current="page"` and class `active-link`; arena heading visible.
  - `/does-not-exist` → heading *Page not found* and a link back to `/`.
- **Done when:** these tests fail because `App` has no routes yet (and `MemoryRouter` context is unused); all older tests still pass.

### T12 · [3] Implement · `feat(router): add React Router v7 app layout with NavLink and Outlet`
- [x] Done
- **Files:** `src/main.jsx`, `src/App.jsx`, `src/layouts/AppLayout.jsx`, `src/pages/NotFoundPage.jsx`, `tests/app-shell.test.js` (path updates only)
- **Do:** `main.jsx` wraps `<App />` in `<BrowserRouter>` (inside `StrictMode`). `App.jsx` = `<Routes><Route path="/" element={<AppLayout />}><Route index element={<ArenaPage />} /><Route path="*" element={<NotFoundPage />} /></Route></Routes>`. `AppLayout` owns header/nav/main/footer and renders `<Outlet />`. All imports from `'react-router'`.
- **Done when:** T11 tests green; no `Switch`/`exact`/`component=`/`activeClassName` anywhere (`git grep` proves it); lint, build.

### T13 · [2] Fail Test · `test(people): add failing tests for PeopleLayout master list`
- [x] Done
- **Files:** `src/pages/people/PeopleLayout.test.jsx`
- **Assert:**
  - `/people` → `navigation` named *Player dossiers* contains one link per person (`href="/people/p-00N"`), the index prompt *Select a player dossier* is shown, and the primary *People* link is active.
  - `/people/p-002` → that person's link has `aria-current="page"` and class `active-link`; the others have class `link`.
- **Done when:** fails because `PeopleLayout` does not exist yet.

### T14 · [3] Implement · `feat(people): add PeopleLayout router layout with NavLink sidebar`
- [x] Done
- **Files:** `src/pages/people/PeopleLayout.jsx`, `src/pages/people/PeopleIndex.jsx`, `src/App.jsx`
- **Do:** implement per the T07 contract. Route: `<Route path="people" element={<PeopleLayout people={people} />}><Route index element={<PeopleIndex />} /></Route>`. Keys = `person.id`.
- **Done when:** T13 green; everything else green.

### T15 · [2] Fail Test · `test(people): add failing tests for PersonDetail param lookup and 404`
- [x] Done
- **Files:** `src/pages/people/PersonDetail.test.jsx`
- **Assert:**
  - `/people/p-003` → `heading` with the person's name; a definition list whose terms are *Name* and *Role* and whose descriptions equal the dataset values.
  - `/people/p-999` → `alert` with text *404: Person Not Found* and a link *Back to dossiers* (`href="/people"`); the sidebar is still rendered.
  - `/people/3` (numeric-looking id) → also 404 (proves string ids, no coercion).
- **Done when:** fails because the `:id` route/component is missing.

### T16 · [3] Implement · `feat(people): add PersonDetail detail route handling with 404 boundary`
- [x] Done
- **Files:** `src/pages/people/PersonDetail.jsx`, `src/App.jsx`
- **Do:** route `<Route path=":id" element={<PersonDetail people={people} />} />` inside `people`. Implement per T07. No `useEffect`, no state.
- **Done when:** T15 green; all green; no console warnings in the test output.

### T17 · [4] Refactor · `style(people): add responsive master-detail CSS grid`
- [x] Done
- **Files:** `src/pages/people/people.css` (imported by `PeopleLayout`), `src/App.css` (primary-nav styles only), `tests/people-css.test.js`
- **Do:**
  - `.people-frame { display: grid; grid-template-columns: minmax(280px, 1fr) 2fr; gap: … }`, and `@media (max-width: 640px) { grid-template-columns: 1fr; }`.
  - Active links are distinguishable **without colour** (e.g. font-weight + left border), use `:focus-visible` outlines, and respect reduced motion.
  - `.person-details`: two-column `dt/dd` grid.
  - `tests/people-css.test.js` (`node:test`) reads the CSS and asserts the `minmax(280px, 1fr) 2fr` declaration and the 640px breakpoint exist (contract guard).
- **Done when:** all green. **Manual (student):** DevTools device toolbar at 375px → no horizontal scroll; screenshot noted for T18.

### T18 · ops · `docs(verification): record Ex1.2 DevTools checkpoints`
- [x] Done
- **Files:** `docs/verification/ex1.2-checkpoints.md`
- **Do:** Claude creates the checklist; the **student** runs `npm run dev`, performs the checks, and fills in the results before the commit:
  1. Console: zero warnings/errors navigating `/` → `/people` → `/people/p-002` → `/people/p-999` → `/nope`.
  2. Deep link: open `http://localhost:5173/people/p-004` directly and reload — the detail renders.
  3. URL params: the address bar matches the active `NavLink`; back/forward buttons keep the UI in sync.
  4. Accessibility tree: one `main`, two named `navigation` landmarks, `dl` with `dt/dd`.
  5. 375px responsive check; Lighthouse Accessibility score.
  6. Output of `npm test`, `npm run lint`, `npm run build` (Claude pastes the real summaries).

### T19 · ops · `docs(readme): document Ex1.2 routes and scripts`
- [x] Done
- **Files:** `README.md`
- **Do:** update the title/intro to Lab 4 Ex1.2, add the route map, the scripts table (`dev`, `test`, `test:node`, `test:ui`, `lint`, `build`), and the lineage note (HW3 → Ex1.2). Remove claims that no longer hold.

---

## Final Verification (before pushing)

- [x] `git log --oneline` shows T00–T19 in order, one commit each.
- [x] `npm test`, `npm run lint`, `npm run build`, `git diff --check` all pass.
- [x] `git grep -nE "Switch|activeClassName|react-router-dom|exact[ =]|component=\{"` → no matches in `src/`.
- [x] `AI_FAILURE_AUDIT.md` contains only real, evidenced findings.

## Decisions

| ID | Decision | Reason |
|---|---|---|
| D1 | `PeopleLayout` uses `<section className="content-area">` instead of the slide's `<main>` | Only one `<main>` landmark per page (WCAG / Lab 3 rule) |
| D2 | Declarative mode (`BrowserRouter` + `<Routes>`) rather than `createBrowserRouter` | Slides 10/12 contracts are written in declarative syntax; `App` stays testable with `MemoryRouter` |
| D3 | People data are fictional dossier entries with exactly `{ id, name, role }` | Agreed data contract; avoids presenting invented facts about real players |
| D4 | Two test runners (`node:test` for pure logic, Vitest for components) | Keeps the 84 existing HW3 tests untouched while adding RTL |
