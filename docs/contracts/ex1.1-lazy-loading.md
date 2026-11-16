# Ex1.1 Contract — Lazy Route Boundaries and Skeleton Contract

> Stage **[1] Contract** (task T04). Written before any implementation.
> Sources: `project-rules.md` §2, §7.1 and §8, `TASK_DECOMPOSITION.md` T04–T15, Lab 4 slide 9.
> Builds on `docs/contracts/ex1.2-routing.md` (route map, component props and data contract are unchanged).
> Routing library: `react-router@^7`, declarative mode. Code splitting: `lazy` and `Suspense` from `'react'`.

## 1. Chunk map

| Module | Chunk | Loaded when |
|---|---|---|
| `src/main.jsx`, `src/App.jsx` | entry | initial load |
| `src/layouts/AppLayout.jsx` | entry | initial load — header, primary nav and footer must never wait for a chunk |
| `src/pages/people/PeopleIndex.jsx` | entry | initial load (tiny, no benefit from splitting) |
| `src/components/skeleton/*` | entry | initial load — fallbacks must be available before any lazy chunk |
| `src/pages/ArenaPage.jsx` | **lazy** `ArenaPage-[hash].js` | `/` is rendered |
| `src/pages/people/PeopleLayout.jsx` | **lazy** `PeopleLayout-[hash].js` | any `/people/*` route is rendered |
| `src/pages/people/PersonDetail.jsx` | **lazy** `PersonDetail-[hash].js` | `/people/:id` is rendered, or a person link is hovered/focused (§5) |
| `src/pages/NotFoundPage.jsx` | **lazy** `NotFoundPage-[hash].js` | an unknown URL is rendered |

Acceptance: `npm run build` lists separate JS chunks named after `ArenaPage`, `PeopleLayout`, `PersonDetail` and `NotFoundPage` (T13, evidence in T16).

## 2. Loaders — `src/routes/lazyRoutes.js`

```js
export const loadArenaPage = () => import('../pages/ArenaPage.jsx')
export const loadPeopleLayout = () => import('../pages/people/PeopleLayout.jsx')
export const loadNotFoundPage = () => import('../pages/NotFoundPage.jsx')
export const loadPersonDetail = () => import('../pages/people/PersonDetail.jsx')
```

- Each loader is a zero-argument function returning `Promise<{ default: Component }>` (the page module's existing default export).
- `loadPersonDetail` is added in T11; the other three in T13.
- Loaders are separate from the `lazy()` declarations (Decision D3) so the same `import()` can be reused for preloading (§5) and replaced with deferred mocks in tests.

`lazy()` declarations live at the **top level of `src/App.jsx`**, never inside a component body:

```jsx
const ArenaPage = lazy(loadArenaPage)
const PeopleLayout = lazy(loadPeopleLayout)
const NotFoundPage = lazy(loadNotFoundPage)
const PersonDetail = lazy(loadPersonDetail)
```

## 3. Suspense boundaries

### (a) Route-level boundary — `AppLayout`

```jsx
<main className="arena-main" id="main-content">
  <Suspense fallback={<PageSkeleton />}>
    <Outlet />
  </Suspense>
</main>
```

- Wraps **only** the `<Outlet />`. `<header>`, `<nav aria-label="Primary">` and `<footer>` stay mounted while a route chunk loads (Decision D2).
- The fallback renders inside the single `<main>` landmark.

### (b) Detail boundary — `:id` route element (slide 9)

```jsx
<Route
  path=":id"
  element={
    <Suspense fallback={<PersonDetailSkeleton />}>
      <PersonDetail people={people} />
    </Suspense>
  }
/>
```

- Nearest boundary for `PersonDetail`: only the content area shows the dossier skeleton; the *Player dossiers* sidebar (`PeopleLayout`) stays visible.

Resulting route tree (after T13):

```jsx
<Routes>
  <Route path="/" element={<AppLayout />}>
    <Route index element={<ArenaPage />} />
    <Route path="people" element={<PeopleLayout people={people} />}>
      <Route index element={<PeopleIndex />} />
      <Route path=":id" element={<Suspense fallback={<PersonDetailSkeleton />}><PersonDetail people={people} /></Suspense>} />
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Route>
</Routes>
```

Rules: no `fallback={null}`, no spinners that change layout, no boundary around `<Routes>`.

## 4. Skeleton contract — `src/components/skeleton/`

### `Skeleton({ label = 'Loading content', lines = 3, className = '', children })`

```jsx
<section className={`skeleton ${className}`.trim()} aria-busy="true" aria-live="polite">
  <span className="visually-hidden">{label}</span>
  {/* `lines` times: */}
  <span className="skeleton-line" aria-hidden="true" />
  {children}
</section>
```

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `label` | `string` | `'Loading content'` | Visually hidden text announced by assistive technology |
| `lines` | `number` | `3` | Number of decorative `.skeleton-line` bars, each `aria-hidden="true"` |
| `className` | `string` | `''` | Appended to `skeleton` on the region |
| `children` | `ReactNode` | — | Optional extra decorative markup rendered after the lines; caller must mark it `aria-hidden="true"` (Decision D4) |

- Default parameters only (no `defaultProps`). Line keys are stable indices of a fixed-length placeholder list — not entity data.
- Styling (`skeleton.css`): shimmer via CSS `@keyframes`; `@media (prefers-reduced-motion: reduce)` sets `animation: none`.
- `.visually-hidden` is a global utility in `src/index.css` (T06).

### `PersonDetailSkeleton()`

Mirrors the `PersonDetail` box model (`<article>` → `<h2>` + `<dl className="person-details">` with 2 rows: *Name*, *Role*):

```jsx
<Skeleton label="Loading player dossier" lines={1} className="person-detail-skeleton">
  <dl className="person-details" aria-hidden="true">
    <dt /><dd />
    <dt /><dd />
  </dl>
</Skeleton>
```

- The single `.skeleton-line` is the heading bar, height `var(--dossier-heading-height)`.
- Each placeholder `dt`/`dd` is `var(--dossier-row-height)` tall; the grid gap is `var(--dossier-row-gap)`.
- Nothing inside is exposed to the accessibility tree: `queryByRole('term')` → `null`.

### `PageSkeleton()`

```jsx
<Skeleton label="Loading page" className="page-skeleton" />
```

- `.page-skeleton` has `min-height: var(--page-skeleton-min-height)`.

### Shared dimensions (CLS = 0)

Defined on `:root` (T07) and used by both the real content and the skeletons:

| Custom property | Defined in | Used by |
|---|---|---|
| `--dossier-heading-height` | `src/pages/people/people.css` | `.content-area h2` and the dossier heading bar |
| `--dossier-row-height` | `src/pages/people/people.css` | `.person-details dt/dd` and the placeholder rows |
| `--dossier-row-gap` | `src/pages/people/people.css` | `.person-details` row gap (content and skeleton) |
| `--dossier-panel-padding` | `src/pages/people/people.css` | `.content-area` padding |
| `--page-skeleton-min-height` | `src/index.css` (Decision D5) | `.page-skeleton` |

Concrete values are set in T07 with no visual change from Ex1.2. `--dossier-row-height` is `1lh` because the rows use `line-height: normal` (font-dependent); `1lh` resolves to exactly one line of the element's own inherited font, so real and placeholder rows match in any font.

## 5. Preloading — `PeopleLayout`

```jsx
<NavLink to={`/people/${person.id}`} className={navLinkClassName}
  onPointerEnter={loadPersonDetail} onFocus={loadPersonDetail}>
```

- Hover or keyboard focus on a person link calls `loadPersonDetail()`; the browser caches the module, so the `lazy` component resolves without a second request.
- No state, no effect. Nothing is preloaded on initial render.

## 6. Acceptance criteria (tested in T05–T14)

| Task | Behaviour |
|---|---|
| T05 | `Skeleton` region has `aria-busy="true"`, `aria-live="polite"`; default/custom label; `lines={4}` → 4 `aria-hidden` `.skeleton-line`; custom `className` appended |
| T08 | `PersonDetailSkeleton`: *Loading player dossier*, `.person-details` with 2 `dt` + 2 `dd`, no `term` role exposed. `PageSkeleton`: *Loading page*, class `page-skeleton` |
| T10 | `/people/p-001` with a deferred `loadPersonDetail` → dossier skeleton **and** *Player dossiers* nav visible; after resolve → dossier heading, no skeleton |
| T12 | `/` with deferred loaders → *Loading page* inside `main` while *Primary* nav and header are visible; then arena heading. `/nope` → *Loading page* then *Page not found*. All four loaders exported |
| T14 | Hover and focus on a person link call `loadPersonDetail`; initial render does not |

Tests use deferred promises, never timers.

## 7. Decisions

| ID | Decision | Reason |
|---|---|---|
| D1 | No error boundary for chunk-load failures in this exercise — **known limitation** | React error boundaries require class components (banned, `project-rules.md` §4) and declarative-mode routes have no `errorElement`. A failed chunk download surfaces as an uncaught render error. (Unrelated to Ex1.2 contract's D1.) |
| D2 | `Suspense` around `<Outlet />`, not around `<Routes>` | Header and navigation stay mounted → no layout shift |
| D3 | Loaders separated from `lazy()` declarations | Enables preloading and deterministic test mocking |
| D4 | `Skeleton` accepts optional decorative `children` | `PersonDetailSkeleton` must compose `Skeleton` and place its `<dl>` placeholder inside the same busy region (T08/T09); the T04 plan signature had no slot for it. Decided by the developer during T04 |
| D5 | `--page-skeleton-min-height` is declared in global `src/index.css`, not `people.css` | `people.css` is imported by `PeopleLayout`, which becomes a lazy chunk (T13); `PageSkeleton` renders on `/` and `*` before that CSS loads, so the variable would be undefined and the fallback would collapse. Decided by the developer during T07 |
