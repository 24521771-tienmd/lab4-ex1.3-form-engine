# Project Rules — Lab 4 · Exercise 1.1

> UIT S3T · Lab 4: Multi-Route SPA Architecture, Context Form Engine & Full-Stack React 19 Systems
> Repository: `Week4/Ex1.1` — an independent Git repository for Exercise 1.1 only.

These rules are binding for every human and AI contribution to this repository (Claude Code, Copilot, ChatGPT, etc.).
`TASK_DECOMPOSITION.md` is the work plan; this file is the law the plan must obey.
If the two disagree, stop and ask the developer.

---

## 1. Lineage and Repository Boundaries

Lab 4 exercises are built cumulatively. Each exercise starts from a snapshot of the previous one:

```
Lab 3 HW3 (KRAFTON x PUBG Vietnam Arena)  →  Ex1.2  →  Ex1.1  →  Ex1.3  →  Ex1.7.1
```

- This repository starts from: **the finished `Week4/Ex1.2` repository** (imported as the first `chore` baseline commit).
- Every exercise folder is its **own Git repository** with its own remote.
- Never push to, commit in, or modify the Lab 3 HW3 repository or any sibling `Week4/Ex*` folder.
- The only sibling path an AI assistant may *read* is `../_lab4-kit/` (rules, plans, prompts).
- Previous plans are archived under `docs/history/` and are reference-only.

## 2. Current Exercise Scope — Ex1.1

Exercise **1.1** (Lab 4 slide 9): *Performance and resiliency upgrades — route-level code splitting with `React.lazy`, `<Suspense>` boundaries, dimension-matched skeletons (CLS = 0), and accessible loading states.*

Starting point: the finished Ex1.2 repository (router v7, `PeopleLayout`, `PersonDetail`, `ArenaPage`, `NotFoundPage`). All Ex1.2 behaviour and tests must keep passing.

Deliverables:

1. A reusable `Skeleton` primitive exposing `aria-busy="true"` and `aria-live="polite"`, with visually-hidden loading text and `aria-hidden` decorative shapes.
2. Dimension-matched skeleton variants: `PersonDetailSkeleton` (mirrors the `<dl>` rows of `PersonDetail`) and `PageSkeleton` (route-level fallback). Shared CSS custom properties guarantee identical box sizes → CLS = 0.
3. `PersonDetail` loaded with `React.lazy(() => import(...))` and wrapped in `<Suspense fallback={<PersonDetailSkeleton />}>` in its route element (slide 9 contract).
4. Route-level chunking for `ArenaPage`, `PeopleLayout`, and `NotFoundPage`, with a `<Suspense>` boundary scoped around `AppLayout`'s `<Outlet />` so the header and navigation never disappear while a chunk loads.
5. Intent-based preloading: hovering or focusing a person link starts downloading the `PersonDetail` chunk.
6. Evidence: separate chunks in `npm run build` output and a CLS = 0 measurement, recorded in `docs/verification/`.

Out of scope: forms (Ex1.3), data fetching/backend (Ex1.7.1), error-boundary class components (banned).

Anything not listed in this section or in `TASK_DECOMPOSITION.md` is **out of scope**. Do not add features, dependencies, or refactors "while you are there".

## 3. Stack and Version Pins

| Concern | Required | Forbidden / notes |
|---|---|---|
| Runtime | Node.js `>=22.12` (developer machine: Node 26.x), npm | — |
| UI | React `^19.3`, React DOM `^19.3`, JavaScript + JSX | TypeScript files for new code (existing `src/contracts/*.ts` may stay) |
| Bundler | Vite `^8` + `@vitejs/plugin-react` | CRA, Babel standalone |
| Routing | **`react-router@^7`** — import everything from `'react-router'` | `react-router-dom`, React Router v5/v6 APIs, **React Router v8** (npm `latest` is v8 — always pin `^7`) |
| Unit tests (pure logic) | Node built-in runner `node:test` + `node:assert/strict` in `tests/**/*.test.js` | — |
| Component / hook tests | Vitest `^5`, `@testing-library/react@^16`, `@testing-library/user-event@^14`, `@testing-library/jest-dom@^7`, `jsdom` in `src/**/*.test.jsx` | Enzyme, react-test-renderer |
| Lint | `oxlint` | — |

Rules:

- Install with exact intent: `npm install react-router@^7`, `npm install mongoose@^8`. Never install an unpinned `latest` of a package that has a major version newer than this table.
- Never add a dependency that the current task in `TASK_DECOMPOSITION.md` does not list.
- Keep `package-lock.json` committed and in sync.

## 4. Banned Legacy APIs and Anti-Patterns

The slides' Deprecation Audit (Lab 4 slides 4–5) and Lab 3 rules apply. Any occurrence is a defect.

| Banned | Use instead |
|---|---|
| `<Switch>`, `<Redirect>`, `exact`, `component={...}`, `render={...}` | `<Routes>`, `<Route element={<X />}>`, `<Navigate replace />` |
| `activeClassName`, `activeStyle` | `<NavLink className={({ isActive }) => ...}>` |
| `react-media`, JSX media-query wrappers | Native CSS Grid + `@media` |
| `typeface-roboto` or other monolithic font packages | `@font-face` / system font stack |
| `Component.defaultProps` | Default parameters: `function X({ prop = value })` |
| Material-UI v4 (`@material-ui/core`) or any heavy UI kit | Semantic HTML + project CSS |
| `useEffect` used to compute derived values or validation | Compute during render (`const errors = validate(values)`), `useMemo` only if profiling justifies it |
| `useEffect` without an honest dependency array | Declare every reactive value read inside the effect |
| Chained effects that set state which triggers other effects | One event handler → one state update → derived values |
| `didCancel` / `isMounted` boolean flags | `AbortController` + `signal.aborted` guards |
| Hard-coded MongoDB URIs, passwords, tokens | `process.env.MONGODB_URI`, `.env` (git-ignored) + `.env.example` |
| Mongoose callbacks `.exec((err, doc) => ...)`, `useNewUrlParser`, `useUnifiedTopology` | `await Model.find().lean()`, `await mongoose.connect(uri)` |
| Class components, `ReactDOM.render`, `import * as React` | Function components, `createRoot`, named imports |
| `keyCode`, `keypress`, `alert()`, `confirm()`, `prompt()` | `e.key` / `e.code`, accessible inline messages |
| `key={index}`, `key={Math.random()}` | Stable entity ids |
| `dangerouslySetInnerHTML`, `innerHTML` | JSX text (auto-escaped) |

## 5. Full-Stack Verification Contract (slide 3)

1. **Contract-first** — interfaces, props, routes, and API shapes are written down before implementation.
2. **Client/server validation parity** — the same validation rules run on both sides (shared module in Ex1.7.1).
3. **Zero unhandled promise rejections** and **zero uncaught effect loops** — every `async` path has a `catch`; every effect has cleanup when it subscribes to anything.
4. **Deterministic state updates in a single render pass** — one user event must not cascade into extra commits.

## 6. Mandatory 4-Stage Loop (slide 8)

Every feature task in `TASK_DECOMPOSITION.md` is tagged with one stage:

| Stage | Commit type | What it contains | Test state after commit |
|---|---|---|---|
| **[1] Contract** | `docs(contract)` / `docs(plan)` | Interface/API spec, JSDoc typedefs, acceptance criteria | unchanged |
| **[2] Fail Test** | `test(scope)` | New tests only, run and confirmed failing for the *expected* reason | **RED allowed** (only the new tests may fail) |
| **[3] Implement** | `feat(scope)` / `fix(scope)` | Minimal code that makes the RED tests pass | all GREEN |
| **[4] Refactor** | `refactor(scope)` / `style(scope)` / `perf(scope)` | Cleanup with no behaviour change | all GREEN |

RED commit policy:

- A `test(...)` RED commit must be followed by the matching GREEN commit as the very next task.
- Before committing RED, run the tests and paste the failing assertion names into the task report — a test that fails because of a typo or a missing import of an unrelated file does not count.
- Every non-RED commit must leave `npm test`, `npm run lint`, and `npm run build` passing.

## 7. React and Routing Standards

- `main.jsx` mounts `<StrictMode><BrowserRouter><App /></BrowserRouter></StrictMode>` with `createRoot`. `App.jsx` declares `<Routes>` and contains **no router provider**, so tests can wrap `<App />` in `<MemoryRouter>`.
- Shared chrome lives in layout routes that render `<Outlet />`. Child routes are relative (`path="people"`, `path=":id"`, `index`).
- Exactly **one `<main>` landmark** per page. It belongs to the top-level layout; nested layouts use `<section>` / `<aside>` / `<nav>`.
- `useParams()` always returns strings. Entity ids are strings (`'p-001'`). Compare with `===` only after confirming both sides are strings.
- Missing entities render an explicit not-found state with `role="alert"` — never a blank screen, never a thrown render error.
- Key–value data uses `<dl>/<dt>/<dd>`; mapped pairs use `<Fragment key={stableKey}>`.
- Props flow down; no prop mutation; immutable state updates only.

### 7.1 Code-Splitting and Suspense Standards (from Ex1.1)

- Lazy components are declared at **module top level** (`const X = lazy(loadX)`), never inside a component body.
- Loader functions live in `src/routes/lazyRoutes.js` so the same `import()` can be reused for preloading.
- Every `lazy` component renders inside a `<Suspense>` whose fallback is a dimension-matched skeleton — never `null`, never a spinner that changes layout.
- Suspense boundaries are scoped so persistent chrome (header, nav, sidebar) stays mounted while a chunk loads.
- Skeletons expose `aria-busy="true"` + `aria-live="polite"`, contain visually-hidden loading text, and mark decorative shapes `aria-hidden="true"`. Shimmer animation is disabled under `prefers-reduced-motion: reduce`.

## 8. Accessibility and Responsive Design

- Target WCAG 2.2 AA and Lighthouse Accessibility 100.
- No horizontal overflow at 375px; master–detail grids collapse to one column on narrow screens.
- Every form control has a `<label htmlFor>` bound with `useId()`; errors are linked with `aria-describedby` and flagged with `aria-invalid`.
- Loading regions expose `aria-busy="true"` and `aria-live="polite"`; skeletons are dimension-matched (target CLS = 0).
- Visible focus indicators; state never communicated by colour alone; respect `prefers-reduced-motion`.
- Icon-only controls require `aria-label`.

## 9. Testing and Verification

| Command | Purpose |
|---|---|
| `npm test` | Runs **both** suites: `npm run test:node && npm run test:ui` |
| `npm run test:node` | `node --test "tests/**/*.test.js"` — pure logic only |
| `npm run test:ui` | `vitest run` — components and hooks (`src/**/*.test.jsx`) |
| `npm run lint` | `oxlint` |
| `npm run build` | Production build must succeed |
| `git diff --check` | No whitespace errors before every commit |

Rules:

- Vitest setup file is `src/setupTests.js`. **Never create a folder named `test/`** — `node --test` globs `**/test/**/*.js` and would execute Vitest files.
- Vitest files use the `.test.jsx` extension only; `node:test` files live in `tests/` with `.test.js`.
- Tests assert behaviour through roles, labels, and text (Testing Library queries), not implementation details.
- Never weaken, skip, or delete a test to make a commit pass. Never mark a check as passed unless it was executed in this session.
- Manual checks (DevTools, Slow 3G, 375px, Lighthouse) are performed by the developer; the AI lists them and waits for the result.

## 10. Git Workflow

- Branch: `main`. One task in `TASK_DECOMPOSITION.md` = exactly one commit.
- Conventional Commits 1.0: `type(scope): imperative summary` — types: `feat`, `fix`, `test`, `refactor`, `perf`, `style`, `docs`, `build`, `chore`. Use the exact message written in the task table.
- Stage files explicitly (`git add <paths>`); review `git diff --cached` before committing.
- Tick the task checkbox in `TASK_DECOMPOSITION.md` inside the same commit.
- Never commit `.env`, `node_modules/`, `dist/`, `coverage/`, or editor settings.
- AI assistants **never push**. The developer pushes after reviewing `git log --oneline`.
- No artificial commits: a commit that changes nothing meaningful is a defect, even if it raises the count.

## 11. AI Governance

- One task ID per AI prompt. The AI must not start the next task, "pre-implement" future tasks, or bundle changes.
- Before editing, the AI restates the task, lists the files it will touch, and flags any conflict with these rules.
- After each task the AI reports: files changed, commands run with real results, commit hash.
- When AI output is wrong (hallucinated API, legacy syntax, effect loop, insecure code), record it in `AI_FAILURE_AUDIT.md` with real evidence. Never invent failures.
- If a requirement is ambiguous, the AI stops and asks instead of guessing.

## 12. Documentation

- Keep `TASK_DECOMPOSITION.md` checkboxes and `README.md` consistent with the actual code.
- Verification evidence goes in `docs/verification/` as Markdown.
- Design decisions that deviate from slide code samples are recorded in the decomposition's *Decisions* section with the reason.
