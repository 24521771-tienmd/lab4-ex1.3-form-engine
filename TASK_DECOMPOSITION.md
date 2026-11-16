# Task Decomposition — Lab 4 · Ex1.1 (Performance & Resiliency Upgrades)

> **Goal:** route-level code splitting with `React.lazy`, `<Suspense>` boundaries with dimension-matched skeletons (CLS = 0), accessible loading states (`aria-busy`, `aria-live`), and intent-based chunk preloading — on top of the finished Ex1.2 app.
> **Rules:** `project-rules.md` · **Workflow:** `CLAUDE.md` · **Slide:** 9.
> **Commit budget:** ≥ 10 required → this plan has **17** (T01–T17), excluding the baseline import T00.

## Legend

**[1] Contract · [2] Fail Test (RED) · [3] Implement (GREEN) · [4] Refactor** · `ops` = docs/tooling. One task = one commit with the exact message. Tick `[x]` in the same commit.

## Summary

| ID | Stage | Commit message |
|---|---|---|
| T00 | ops | `chore: import Ex1.2 baseline` *(manual, during setup)* |
| T01 | ops | `docs(history): archive Ex1.2 plan, audit and verification` |
| T02 | ops | `docs(rules): scope project rules and Claude workflow to Ex1.1` |
| T03 | ops | `docs(plan): add Ex1.1 task decomposition and AI audit log` |
| T04 | [1] | `docs(contract): define lazy route boundaries and skeleton contract` |
| T05 | [2] | `test(skeleton): add failing tests for accessible Skeleton primitive` |
| T06 | [3] | `feat(skeleton): add accessible Skeleton primitive` |
| T07 | [4] | `refactor(people): extract dossier dimensions into CSS custom properties` |
| T08 | [2] | `test(skeleton): add failing tests for PersonDetailSkeleton and PageSkeleton` |
| T09 | [3] | `feat(skeleton): add dimension-matched PersonDetailSkeleton and PageSkeleton` |
| T10 | [2] | `test(routes): add failing tests for lazy PersonDetail Suspense fallback` |
| T11 | [3] | `feat(routes): lazy-load PersonDetail behind a Suspense skeleton boundary` |
| T12 | [2] | `test(routes): add failing tests for route-level chunk boundaries` |
| T13 | [3] | `feat(routes): code-split ArenaPage, PeopleLayout and NotFoundPage` |
| T14 | [2] | `test(people): add failing test for detail chunk preloading` |
| T15 | [3] | `perf(people): preload PersonDetail chunk on link hover and focus` |
| T16 | ops | `docs(verification): record chunk split and CLS evidence` |
| T17 | ops | `docs(readme): document Ex1.1 code-splitting architecture` |

---

## Tasks

### T00 · ops · `chore: import Ex1.2 baseline`
- [x] Done during setup: Ex1.2 copied without `.git`, `node_modules`, `dist`; `git init -b main`; first commit.

### T01 · ops · `docs(history): archive Ex1.2 plan, audit and verification`
- [x] Done *(ticked by T03)*
- **Do:** `git mv TASK_DECOMPOSITION.md AI_FAILURE_AUDIT.md docs/history/ex1.2/` and `git mv docs/verification/ex1.2-checkpoints.md docs/history/ex1.2/`. Leave `docs/contracts/ex1.2-routing.md` in place (still valid). `docs/history/lab3-hw3/` stays.

### T02 · ops · `docs(rules): scope project rules and Claude workflow to Ex1.1`
- [x] Done *(ticked by T03)*
- **Do:** overwrite `project-rules.md` and `CLAUDE.md` with `../_lab4-kit/Ex1.1/` versions.

### T03 · ops · `docs(plan): add Ex1.1 task decomposition and AI audit log`
- [x] Done
- **Do:** copy `TASK_DECOMPOSITION.md` and `AI_FAILURE_AUDIT.md` from `../_lab4-kit/Ex1.1/`; tick T01–T03.

### T04 · [1] Contract · `docs(contract): define lazy route boundaries and skeleton contract`
- [x] Done
- **Files:** `docs/contracts/ex1.1-lazy-loading.md`
- **Content:**
  - **Chunk map:** `ArenaPage`, `PeopleLayout`, `NotFoundPage`, `PersonDetail` become lazy chunks; `AppLayout`, `PeopleIndex`, skeletons stay in the entry chunk.
  - **Loaders:** `src/routes/lazyRoutes.js` exports `loadArenaPage`, `loadPeopleLayout`, `loadNotFoundPage`, `loadPersonDetail` — each `() => import('…')` returning a module with a `default` export. `lazy()` calls are made at the top level of `App.jsx`.
  - **Boundaries:** (a) `AppLayout`: `<Suspense fallback={<PageSkeleton />}>` around `<Outlet />` only; (b) `:id` route element: `<Suspense fallback={<PersonDetailSkeleton />}><PersonDetail people={people} /></Suspense>` (slide 9).
  - **`Skeleton({ label = 'Loading content', lines = 3, className = '' })`** → `<section className="skeleton …" aria-busy="true" aria-live="polite">` with `<span className="visually-hidden">{label}</span>` and `lines` decorative `<span className="skeleton-line" aria-hidden="true" />`.
  - **`PersonDetailSkeleton()`** → label *Loading player dossier*; reproduces the `PersonDetail` box model: heading bar + `<dl className="person-details">` with 2 rows of placeholder `dt/dd`, all `aria-hidden`, using the same CSS custom properties.
  - **`PageSkeleton()`** → label *Loading page*; height `var(--page-skeleton-min-height)`.
  - **Preload:** `PeopleLayout` calls `loadPersonDetail()` on a person link's `onPointerEnter` and `onFocus` (browser caches the module → `lazy` resolves instantly).
  - **Decision D1:** no error boundary for chunk-load failures in this exercise — React error boundaries require class components (banned) and declarative-mode routes have no `errorElement`. Recorded as a known limitation.

### T05 · [2] Fail Test · `test(skeleton): add failing tests for accessible Skeleton primitive`
- [x] Done
- **Files:** `src/components/skeleton/Skeleton.test.jsx`
- **Assert:** the rendered region has `aria-busy="true"` and `aria-live="polite"`; default label text *Loading content* is present (and a custom `label` replaces it); `lines={4}` renders 4 elements with class `skeleton-line`, all `aria-hidden="true"`; a custom `className` is appended.
- **Done when:** fails only because `Skeleton.jsx` is missing.

### T06 · [3] Implement · `feat(skeleton): add accessible Skeleton primitive`
- [x] Done
- **Files:** `src/components/skeleton/Skeleton.jsx`, `src/components/skeleton/skeleton.css`, `src/index.css` (add a global `.visually-hidden` utility if not present)
- **Do:** implement per T04. Shimmer via CSS `@keyframes`; `@media (prefers-reduced-motion: reduce) { animation: none; }`.
- **Done when:** T05 green; all green.

### T07 · [4] Refactor · `refactor(people): extract dossier dimensions into CSS custom properties`
- [x] Done
- **Files:** `src/pages/people/people.css`, `tests/people-css.test.js`
- **Do:** replace the hard-coded sizes used by `.person-details` and the detail heading with custom properties on `:root` — `--dossier-heading-height`, `--dossier-row-height`, `--dossier-row-gap`, `--dossier-panel-padding`, plus `--page-skeleton-min-height`. Set explicit `min-height` values so content and skeleton share the same box. No visual change. Extend the CSS guard test to assert the properties exist.
- **Done when:** all green; **manual:** detail page looks identical to Ex1.2.

### T08 · [2] Fail Test · `test(skeleton): add failing tests for PersonDetailSkeleton and PageSkeleton`
- [x] Done
- **Files:** `src/components/skeleton/PersonDetailSkeleton.test.jsx`, `src/components/skeleton/PageSkeleton.test.jsx`
- **Assert:** `PersonDetailSkeleton` → busy region with text *Loading player dossier*, contains an element with class `person-details` holding exactly 2 `dt` and 2 `dd` placeholders, none exposed to the accessibility tree (`queryByRole('term')` → null); `PageSkeleton` → busy region with *Loading page* and class `page-skeleton`.

### T09 · [3] Implement · `feat(skeleton): add dimension-matched PersonDetailSkeleton and PageSkeleton`
- [x] Done
- **Files:** `src/components/skeleton/PersonDetailSkeleton.jsx`, `src/components/skeleton/PageSkeleton.jsx`, `src/components/skeleton/skeleton.css`
- **Do:** compose `Skeleton`; reuse the T07 custom properties so each placeholder row is exactly `--dossier-row-height` tall.
- **Done when:** T08 green; all green.

### T10 · [2] Fail Test · `test(routes): add failing tests for lazy PersonDetail Suspense fallback`
- [x] Done
- **Files:** `src/routes/lazyRoutes.test.jsx`, `src/App.lazy.test.jsx`
- **Assert:**
  - `loadPersonDetail` is a function; `await loadPersonDetail()` resolves to a module whose `default` is a component.
  - Rendering `/people/p-001` while `loadPersonDetail` is **controlled by a deferred promise** (`vi.mock('./routes/lazyRoutes.js', …)` returning a promise you resolve manually) shows the *Loading player dossier* busy region **and** the *Player dossiers* sidebar; after resolving, the dossier heading appears and the skeleton is gone.
- **Hint:** deferred mocks make Suspense observable deterministically; do not rely on timing. Use `vi.mock('./routes/lazyRoutes.js', async (importOriginal) => ({ ...(await importOriginal()), loadPersonDetail: … }))` so loaders added later (T13) are not lost, and `vi.resetModules()` + a dynamic `import('./App.jsx')` per test because `lazy()` caches its resolved module.

### T11 · [3] Implement · `feat(routes): lazy-load PersonDetail behind a Suspense skeleton boundary`
- [x] Done
- **Files:** `src/routes/lazyRoutes.js`, `src/App.jsx`
- **Do:** create `lazyRoutes.js` with `loadPersonDetail` (other loaders come in T13); in `App.jsx`: `const PersonDetail = lazy(loadPersonDetail)` at module top level; wrap the `:id` route element in `<Suspense fallback={<PersonDetailSkeleton />}>`.
- **Done when:** T10 green; Ex1.2 tests still green (adapt them to `await findBy…` only where lazy loading makes content async — **do not** delete assertions).

### T12 · [2] Fail Test · `test(routes): add failing tests for route-level chunk boundaries`
- [x] Done
- **Files:** `src/App.lazy.test.jsx`
- **Assert** (deferred mocks for `loadArenaPage`, `loadPeopleLayout`, `loadNotFoundPage`):
  - `/` → before resolution, the `main` landmark contains the *Loading page* busy region while the *Primary* navigation and header are visible; after resolution, the arena heading appears.
  - `/nope` → *Loading page* then *Page not found*.
  - `lazyRoutes.js` exports all four loaders.

### T13 · [3] Implement · `feat(routes): code-split ArenaPage, PeopleLayout and NotFoundPage`
- [x] Done
- **Files:** `src/routes/lazyRoutes.js`, `src/App.jsx`, `src/layouts/AppLayout.jsx`
- **Do:** add the three loaders; top-level `lazy()` in `App.jsx`; `<Suspense fallback={<PageSkeleton />}>` around `<Outlet />` inside `AppLayout`'s `<main>`.
- **Done when:** T12 green; all green; `npm run build` output lists separate chunks named after `ArenaPage`, `PeopleLayout`, `NotFoundPage`, `PersonDetail`.

### T14 · [2] Fail Test · `test(people): add failing test for detail chunk preloading`
- [x] Done
- **Files:** `src/pages/people/PeopleLayout.test.jsx`
- **Assert:** with `loadPersonDetail` mocked as `vi.fn()`, hovering (`user.hover`) a person link calls it once; tabbing focus onto a link calls it; nothing is called on initial render.

### T15 · [3] Implement · `perf(people): preload PersonDetail chunk on link hover and focus`
- [x] Done
- **Files:** `src/pages/people/PeopleLayout.jsx`
- **Do:** import `loadPersonDetail` from `lazyRoutes.js`; attach `onPointerEnter` and `onFocus` to each `NavLink`. No state, no effect.
- **Done when:** T14 green; all green. **Manual:** DevTools → Network → hover a name → the `PersonDetail-*.js` request fires before clicking.

### T16 · ops · `docs(verification): record chunk split and CLS evidence`
- [x] Done
- **Files:** `docs/verification/ex1.1-performance.md`
- **Do:** Claude pastes the real `npm run build` chunk table. The **student** records (before the commit):
  1. Network → *Slow 3G* → open `/people/p-002` → the skeleton is visible, then content replaces it with no visible jump.
  2. Lighthouse (Navigation, mobile) or Performance panel → **CLS value** (target 0) and Accessibility score.
  3. Accessibility tree while loading: the region shows `busy: true`; a screen reader announces *Loading player dossier*.
  4. `prefers-reduced-motion` emulation (Rendering tab) → no shimmer.
  5. Real output summaries of `npm test`, `npm run lint`, `npm run build`.

### T17 · ops · `docs(readme): document Ex1.1 code-splitting architecture`
- [x] Done
- **Files:** `README.md`
- **Do:** describe the chunk map, Suspense boundary placement, skeleton contract, preloading, and lineage (HW3 → Ex1.2 → Ex1.1).

---

## Final Verification

- [x] `git log --oneline` shows T00–T17, one commit each.
- [x] `npm test`, `npm run lint`, `npm run build`, `git diff --check` pass.
- [x] `git grep -n "lazy(" src` → only top-level declarations in `App.jsx`.
- [x] Every Ex1.2 test still exists and passes.

## Decisions

| ID | Decision | Reason |
|---|---|---|
| D1 | No chunk-load error boundary | Would require a class component (banned) or data-router `errorElement` (out of the agreed declarative mode) |
| D2 | `Suspense` around `<Outlet />`, not around `<Routes>` | Header and navigation stay mounted → no layout shift, better perceived performance |
| D3 | Loaders separated from `lazy()` declarations | Allows preloading and deterministic test mocking |
| D4 | `Skeleton` accepts optional decorative `children` (added to the T04 signature) | `PersonDetailSkeleton` must compose `Skeleton` with its `<dl>` placeholder inside the same busy region (T08/T09); decided by the developer during T04 |
| D5 | `--page-skeleton-min-height` declared in global `src/index.css` instead of `people.css` (T07) | `people.css` loads with the lazy `PeopleLayout` chunk (T13); `PageSkeleton` on `/` and `*` would see an undefined variable and collapse; decided by the developer during T07 |
