# Lab 4 · Ex1.3 — KRAFTON x PUBG Vietnam Arena: Synchronous Context Form Engine

Lab 4 Exercise 1.3 + In-Class Sprint 2 (slides 13–15): deconstruct the legacy **5-`useEffect` validation waterfall**, then replace it with a **Context-driven form engine** that derives errors and validity **during render** — one keystroke, one React commit — with accessible fields (`useId`, `aria-invalid`, `aria-describedby`) and a semantic `<ShowData />` inspector, served at the new lazy route **`/register`**.

All Ex1.1 behaviour (lazy routes, Suspense boundaries, skeletons, preloading) and all Ex1.2 behaviour (React Router v7 routes, *Case Dossier*) is unchanged. The project is a frontend-only prototype; it is not connected to an official competition service, and registrations are not persisted.

## Lineage

```
Lab 3 HW3 (KRAFTON x PUBG Vietnam Arena)  →  Ex1.2  →  Ex1.1  →  Ex1.3 (this repository)  →  Ex1.7.1
```

- **Lab 3 HW3** — single-view PUBG Vietnam Arena. Rules, plan and AI audit archived in [`docs/history/lab3-hw3/`](./docs/history/lab3-hw3/).
- **Ex1.2** — React Router v7 multi-route SPA with `AppLayout`, `PeopleLayout` and `PersonDetail`. This repository starts from a snapshot of the finished Ex1.2 repository (commit `chore: import Ex1.2 baseline`); its plan, AI audit and DevTools checkpoints are archived in [`docs/history/ex1.2/`](./docs/history/ex1.2/). Its routing contract [`docs/contracts/ex1.2-routing.md`](./docs/contracts/ex1.2-routing.md) still applies.
- **Ex1.1** — code splitting, Suspense boundaries, skeletons and preloading. This repository starts from a snapshot of the finished Ex1.1 repository (commit `chore: import Ex1.1 baseline`); its plan, AI audit and performance record are archived in [`docs/history/ex1.1/`](./docs/history/ex1.1/). Its contract [`docs/contracts/ex1.1-lazy-loading.md`](./docs/contracts/ex1.1-lazy-loading.md) still applies.
- **Ex1.3** — this repository: legacy waterfall reproduction, synchronous form engine and `/register`.
- **Ex1.7.1** (next) — reuses the generic `SimpleForm` with a shared validator for client/server parity (decision D1).

## Routes

| Path | Element | Chunk | What it shows |
|---|---|---|---|
| `/` | `AppLayout` | entry | Layout route: header with the *Primary* navigation (`Arena`, `People`, `Register`), the single `<main>` with the route-level `<Suspense>` around `<Outlet />`, footer |
| `/` (index) | `ArenaPage` | **lazy** | The Lab 3 HW3 arena screen, unchanged |
| `/people` | `PeopleLayout` | **lazy** | *Player dossiers* sidebar of `NavLink`s (with chunk preloading) + nested `<Outlet />` |
| `/people` (index) | `PeopleIndex` | entry | "Select a player dossier." prompt |
| `/people/:id` | `PersonDetail` | **lazy** | Name and role in a `<dl>`, behind its own `<Suspense>`; unknown ids (e.g. `/people/p-999`, `/people/3`) show a `404: Person Not Found` alert with a *Back to dossiers* link |
| `/register` | `RegisterPage` | **lazy** | *Player registration* form (`SimpleForm` + four `InputField`s); after a valid submit, the `ShowData` inspector lists the submitted values (Ex1.3) |
| `*` | `NotFoundPage` | **lazy** | *Page not found* with a link back to the Arena |

- `src/main.jsx` mounts `<StrictMode><BrowserRouter><App /></BrowserRouter></StrictMode>`; `src/App.jsx` only declares `<Routes>`, so tests wrap it in `<MemoryRouter>`.
- Every router import comes from `'react-router'` (v7); `react-router-dom` is not used.
- Active links use `className={({ isActive }) => isActive ? 'active-link' : 'link'}` and receive `aria-current="page"`; the active state is shown with weight and a bar, not colour alone.
- The `/people` view is a CSS Grid (`minmax(280px, 1fr) 2fr`) that collapses to one column at ≤ 640px.

## Form engine architecture (Ex1.3)

Full contract: [`docs/contracts/ex1.3-form-engine.md`](./docs/contracts/ex1.3-form-engine.md). Evidence: [`docs/verification/ex1.3-form-engine.md`](./docs/verification/ex1.3-form-engine.md).

### Before: the slide-13 waterfall (evidence only)

[`src/legacy/LegacySimpleForm.jsx`](./src/legacy/LegacySimpleForm.jsx) reproduces the anti-pattern — derived data copied into state by chained effects. It is bounded (every `setState` has an equality guard), never routed, and never imported by app code.

```
keystroke
  └─ LegacyInputField setValue ............................ commit 1
       └─ effect #1 syncToParent     → setValues .......... commit 2
            └─ effect #2 validateField → setErrors ........ commit 3
                 ├─ effect #3 calcFormValidity  → setIsValid   ┐
                 └─ effect #4 syncErrorsToChild → setChildError┘ commit 4
                      └─ effect #5 autoScrollToError → scrollIntoView?.()
```

Measured by a `<Profiler>` test (`src/legacy/LegacySimpleForm.test.jsx`): **4 commits** for one keystroke that flips a field from invalid to valid.

### After: single render pass

```
keystroke
  └─ InputField onChange → setFieldValue → setValues ...... commit 1 (only)
       └─ SimpleForm render:
            errors  = validate(values)          ← pure, synchronous
            isValid = Object.keys(errors).length === 0
            <FormContext.Provider value={…}>    ← every InputField reads it
```

Asserted by a `<Profiler>` test (`src/forms/SimpleForm.test.jsx`): **exactly 1 commit** per keystroke. A static guard (`tests/no-effect-in-forms.test.js`) fails if `useEffect`/`useLayoutEffect` ever appears in `src/forms/`, or if app code imports `legacy/`.

### Modules

| Module | Role |
|---|---|
| [`src/forms/validateRegistration.js`](./src/forms/validateRegistration.js) | Pure rules → `{ [field]: message }` for failing fields only |
| [`src/forms/FormContext.js`](./src/forms/FormContext.js) | `FormContext` + `useFormContext()` (throws `useFormContext must be used inside <SimpleForm>` outside a provider) |
| [`src/forms/SimpleForm.jsx`](./src/forms/SimpleForm.jsx) | Generic engine: `SimpleForm({ initialValues, validate, onValidSubmit, submitLabel = 'Submit', children })` |
| [`src/forms/InputField.jsx`](./src/forms/InputField.jsx) | `InputField({ name, label, type = 'text', options, autoComplete, inputMode, hint })` — `<input>` or `<select>` |
| [`src/components/ShowData.jsx`](./src/components/ShowData.jsx) | `ShowData({ data, title = 'Submitted data' })` — `<section>` + `<h2>` + `<dl class="json-inspector">` |
| [`src/pages/register/RegisterPage.jsx`](./src/pages/register/RegisterPage.jsx) | Route `/register`; holds only `submitted` |

### Context value contract

```js
{
  values,           // state — current field values
  errors,           // derived — validate(values), never stored
  touched,          // state — { [field]: true } after blur
  submitAttempted,  // state — true after the first submit
  isValid,          // derived — Object.keys(errors).length === 0
  setFieldValue(name, value),  // setValues(prev => ({ ...prev, [name]: value }))
  markTouched(name),
}
```

- An error is shown when `errors[name] && (touched[name] || submitAttempted)` — derived, not stored.
- The submit button stays enabled; an invalid submit reveals every error plus a `role="alert"` summary *Fix N field(s) before submitting.* (decision D2).

### Registration form (`/register`)

| Field | Control | Error message |
|---|---|---|
| `fullName` | text, 2–50 chars after trim | Full name must be 2–50 characters. |
| `email` | email, `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | Enter a valid email address. |
| `age` | number via `valueAsNumber` (empty → `''`, never `NaN`), integer 16–100 | Age is required. / Age must be a whole number from 16 to 100. |
| `role` | `<select>` from `PERSON_ROLES` | Choose a role. |

### Accessibility

- Each `InputField` calls its own `useId()` (decision D4) → `<label htmlFor>`, and an error element `${id}-error` linked through `aria-describedby` **only while it is visible**; `aria-invalid` mirrors the visible error.
- Errors never rely on colour alone: thicker border, a decorative ⚠ (`aria-hidden`), and a visible **Error:** label.
- One column at 375px, two columns from 768px; `:focus-visible` outlines; the inspector `dl` wraps long values instead of overflowing.
- `ShowData` renders values as JSX text, so untrusted input such as `<img src=x onerror=…>` is displayed literally.

## Code-splitting architecture (Ex1.1)

Full contract: [`docs/contracts/ex1.1-lazy-loading.md`](./docs/contracts/ex1.1-lazy-loading.md).

### Chunk map

Production build as recorded for Ex1.1 in [`docs/history/ex1.1/ex1.1-performance.md`](./docs/history/ex1.1/ex1.1-performance.md). Ex1.3 adds a lazy `RegisterPage-*.js` (3.67 kB, 1.63 kB gzip) + `RegisterPage-*.css` (1.79 kB) chunk; see [`docs/verification/ex1.3-form-engine.md`](./docs/verification/ex1.3-form-engine.md).

| Chunk | Contents | Size (gzip) |
|---|---|---|
| `index-*.js` (entry) | React, React Router, `App`, `AppLayout`, `PeopleIndex`, skeletons, loaders | 262.44 kB (83.57 kB) |
| `ArenaPage-*.js` | Arena page, kill feed, leaderboard, airdrop hooks | 16.55 kB (5.00 kB) |
| `PeopleLayout-*.js` + `PeopleLayout-*.css` | Dossier master list, preload handler, `people.css` | 0.55 kB + 1.92 kB |
| `PersonDetail-*.js` | Dossier detail view | 0.63 kB (0.36 kB) |
| `NotFoundPage-*.js` | 404 page | 0.35 kB (0.24 kB) |

Before splitting, the app shipped one 277.18 kB (87.37 kB gzip) bundle; the entry chunk is now 14.74 kB (3.80 kB gzip) smaller and each route chunk is fetched only when needed.

### Loaders and `lazy()`

- [`src/routes/lazyRoutes.js`](./src/routes/lazyRoutes.js) exports `loadArenaPage`, `loadPeopleLayout`, `loadNotFoundPage`, `loadPersonDetail` and (Ex1.3) `loadRegisterPage`, each `() => import('…')`.
- [`src/App.jsx`](./src/App.jsx) declares the five lazy components **at module top level** (`const PersonDetail = lazy(loadPersonDetail)`), never inside a component body.
- Keeping loaders separate from `lazy()` lets the same `import()` be reused for preloading and replaced by deferred mocks in tests.

### Suspense boundaries

```
<header> + <nav aria-label="Primary">      ← always mounted
<main>
  <Suspense fallback={<PageSkeleton />}>   ← AppLayout: around <Outlet /> only
    ArenaPage | RegisterPage | NotFoundPage | PeopleLayout
      <nav aria-label="Player dossiers">  ← stays mounted while a dossier loads
      <Suspense fallback={<PersonDetailSkeleton />}>   ← :id route element
        PersonDetail
<footer>                                   ← always mounted
```

- The route-level boundary wraps only `<Outlet />` inside `AppLayout`'s `<main>` — not `<Routes>` — so the header, navigation and footer never unmount while a chunk loads.
- The `:id` boundary is the nearest one for `PersonDetail`, so only the content area shows a skeleton; the dossier sidebar stays visible.

### Skeleton contract

| Component | Renders |
|---|---|
| `Skeleton({ label = 'Loading content', lines = 3, className = '', children })` | `<section className="skeleton …" aria-busy="true" aria-live="polite">` with a `.visually-hidden` label, `lines` decorative `.skeleton-line` bars (`aria-hidden="true"`), and optional decorative `children` |
| `PersonDetailSkeleton()` | Label *Loading player dossier*; one heading bar + an `aria-hidden` `<dl className="person-details">` with 2 placeholder `dt`/`dd` rows, mirroring `PersonDetail` |
| `PageSkeleton()` | Label *Loading page*; class `page-skeleton` with `min-height: var(--page-skeleton-min-height)` |

- **CLS = 0 by construction:** real content and skeletons share CSS custom properties — `--dossier-heading-height`, `--dossier-row-height` (`1lh`), `--dossier-row-gap`, `--dossier-panel-padding` in `people.css`, and the global `--page-skeleton-min-height` in `index.css`.
- **Accessibility:** assistive technology hears the label once (`aria-live="polite"`) and sees the region as busy; decorative shapes are hidden.
- **Motion:** the shimmer is a CSS `@keyframes` animation, disabled under `prefers-reduced-motion: reduce`.

### Intent-based preloading

`PeopleLayout` calls `loadPersonDetail()` on each person link's `onPointerEnter` and `onFocus` (no state, no effect). The browser caches the module, so clicking a dossier after hovering or tabbing to it usually renders without a skeleton. A failed preload is caught and ignored; navigation retries the import.

### Known limitation

There is **no error boundary for chunk-load failures** (contract Decision D1): React error boundaries require class components, which the project rules ban, and declarative-mode routes have no `errorElement`. A chunk that fails to download surfaces as an uncaught render error.

## Main features

Form engine (Ex1.3):

- `/register` *Player registration* form with live, synchronous validation and a `ShowData` inspector.
- 1 commit per keystroke (vs 4 in the legacy waterfall), proven by `<Profiler>` tests.
- Accessible fields: `useId` label binding, `aria-invalid`, `aria-describedby`, error text not by colour alone.

Performance & resiliency (Ex1.1):

- Route-level code splitting with four lazy chunks and scoped Suspense boundaries.
- Accessible, dimension-matched skeleton fallbacks (CLS 0, Lighthouse Accessibility 100 — see the verification record).
- Dossier chunk preloading on hover and keyboard focus.

Case Dossier (Ex1.2):

- Six fictional player dossiers (`src/data/people.js`, `{ id, name, role }` with string ids `p-001`…`p-006`); the data is illustrative, not real players.
- URL-driven detail view: the person is derived from `useParams()` during render (no effects, no state), so deep links such as `/people/p-004` work after a reload.

Arena (from Lab 3 HW3, unchanged):

- PUBG Vietnam Airdrop demo with VIP Ticket and G-Coin crate claim interactions.
- A visibility-aware countdown timer.
- Optimistic local claim updates with stock rollback on request failure.
- Squad leaderboard with filtering and sorting by WWCD, placement points, and kill points.
- Kill-feed filtering and player search.

## Technology stack

- React and React DOM 19 (`lazy`, `Suspense`, `createContext`, `useId`, `Profiler` in tests)
- React Router 7 (`react-router`, declarative mode)
- JavaScript and JSX with Vite 8
- Node.js built-in test runner (`node:test`) for pure logic and source/CSS contract guards
- Vitest 5 + React Testing Library 16 + user-event 14 + jsdom for component tests; lazy routes are tested with deferred-promise loader mocks (no timers)
- Oxlint

## Prerequisites

Node.js `^22.22.2`, `^24.15.0` or `>=26.0.0` (the strictest range among the locked dev dependencies, set by jsdom 31; Vitest 5 and Vite 8 accept it). Developed on Node.js 26.8.2. npm is also required.

## Installation

```sh
npm install
```

## Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `vite` | Start the dev server at `http://localhost:5173/` |
| `npm test` | `npm run test:node && npm run test:ui` | Run both test suites |
| `npm run test:node` | `node --test "tests/**/*.test.js"` | Pure-logic and contract tests in `tests/` (`node:test`) |
| `npm run test:ui` | `vitest run` | Component tests in `src/**/*.test.jsx` (Vitest + jsdom, setup in `src/setupTests.js`) |
| `npm run lint` | `oxlint src tests vite.config.js` | Lint |
| `npm run build` | `vite build` | Production build into `dist/` (prints the chunk table) |

There is no `preview` package script. After building, use the installed Vite CLI:

```sh
npm exec -- vite preview --host 127.0.0.1 --port 4174 --strictPort
```

The dev server serves every module separately, so chunk splitting and Lighthouse performance should be checked against the production preview.

## Demo limitations

- People dossiers are fictional and illustrative.
- Claims are handled by a local demo adapter; no production backend or API is connected.
- VIP Ticket and G-Coin stock values are illustrative.
- Squad standings and kill-feed events are illustrative, not official or live.
- The drop phase is statically set to `WARMUP`.
- The 15-minute countdown is independent of the drop phase and restarts when the page reloads.
- No live server synchronization or official competition data is claimed.
- No chunk-load error boundary (see *Known limitation*).
- Registrations are shown in the inspector only; they are not saved or added to the people list (backend arrives in Ex1.7.1).

## Related documentation

- [Project rules](./project-rules.md)
- [Claude Code working agreement](./CLAUDE.md)
- [Task decomposition (Ex1.3)](./TASK_DECOMPOSITION.md)
- [AI failure audit (Ex1.3)](./AI_FAILURE_AUDIT.md)
- [Form engine and registration contract (Ex1.3)](./docs/contracts/ex1.3-form-engine.md)
- [Form engine verification: render passes and a11y (Ex1.3)](./docs/verification/ex1.3-form-engine.md)
- [Legacy waterfall reproduction (Ex1.3, evidence only)](./src/legacy/README.md)
- [Lazy routes and skeleton contract (Ex1.1)](./docs/contracts/ex1.1-lazy-loading.md)
- [Routing and dossier contract (Ex1.2)](./docs/contracts/ex1.2-routing.md)
- [Ex1.1 archive (plan, audit, performance record)](./docs/history/ex1.1/)
- [Ex1.2 archive](./docs/history/ex1.2/)
- [Lab 3 HW3 archive](./docs/history/lab3-hw3/)
