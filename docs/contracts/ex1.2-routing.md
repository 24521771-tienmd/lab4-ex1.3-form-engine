# Ex1.2 Contract — Route Map and People Dossier

> Stage **[1] Contract** (task T07). Written before any implementation.
> Sources: `project-rules.md` §2 and §7, `TASK_DECOMPOSITION.md` T07–T17.
> Routing library: `react-router@^7`, declarative mode (`<BrowserRouter>` + `<Routes>` / `<Route element>`). Every import comes from `'react-router'`.

## 1. Route map

| Path | Element | Notes |
|---|---|---|
| `/` | `AppLayout` | layout route, renders `<Outlet />` inside `<main>` |
| `/` (index) | `ArenaPage` | former `App.jsx` body, no behaviour change |
| `/people` | `PeopleLayout` | master list + nested `<Outlet />` |
| `/people` (index) | `PeopleIndex` | "Select a player dossier" prompt |
| `/people/:id` | `PersonDetail` | 404 state when id is unknown |
| `*` | `NotFoundPage` | unknown URLs: heading *Page not found* + link back to `/` |

Route declaration shape (child paths are relative):

```jsx
<Routes>
  <Route path="/" element={<AppLayout />}>
    <Route index element={<ArenaPage />} />
    <Route path="people" element={<PeopleLayout people={people} />}>
      <Route index element={<PeopleIndex />} />
      <Route path=":id" element={<PersonDetail people={people} />} />
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Route>
</Routes>
```

- `main.jsx` mounts `<StrictMode><BrowserRouter><App /></BrowserRouter></StrictMode>` with `createRoot`.
- `App.jsx` declares `<Routes>` only and contains **no router provider**, so tests wrap it in `<MemoryRouter initialEntries={[path]}>`.

## 2. Component contracts

### `AppLayout()`

- `<header>` (site brand).
- `<nav aria-label="Primary">` with two `NavLink`s:
  - `Arena` → `/` with the `end` prop (active only on `/`, not on `/people`).
  - `People` → `/people`.
- `<main id="main-content"><Outlet /></main>` — the **only** `<main>` landmark on every page.
- `<footer>`.

### `PeopleLayout({ people })`

- Props: `people: Person[]`.
- Renders `<section className="people-frame">` containing:
  - `<nav aria-label="Player dossiers">` with one `NavLink` per person to `/people/{person.id}`, text = `person.name`, `key={person.id}`.
  - `<section className="content-area"><Outlet /></section>` (see Decision D1).

### `PeopleIndex()`

- Renders the prompt text *Select a player dossier*.

### `PersonDetail({ people })`

- Props: `people: Person[]`.
- `const { id } = useParams()` → `people.find((p) => p.id === id)`. Both sides are strings; no numeric coercion (`/people/3` is **not** `p-003`).
- Not found:
  - `<p role="alert">404: Person Not Found</p>`
  - a link *Back to dossiers* → `/people`.
  - Never a blank screen, never a thrown render error.
- Found:
  - `<article>` with `<h2>{name}</h2>`.
  - `<dl className="person-details">` with the terms `Name` and `Role` and their values as `<dd>`; mapped pairs use `<Fragment key={stableKey}>`.
- No `useEffect`, no state — the person is derived during render.

### `NotFoundPage()`

- Heading *Page not found* and a link back to `/`. Renders inside `AppLayout`'s `<main>`.

## 3. NavLink class contract

```jsx
className={({ isActive }) => (isActive ? 'active-link' : 'link')}
```

- React Router also sets `aria-current="page"` on the active link.
- Banned: `activeClassName`, `activeStyle`, `exact`, `<Switch>`, `component=`, imports from `react-router-dom`.

## 4. Data contract — `src/data/people.js`

```js
/**
 * @typedef {Object} Person
 * @property {string} id    e.g. 'p-001' (matches /^p-\d{3}$/)
 * @property {string} name
 * @property {string} role  one of PERSON_ROLES
 */
```

- Each `Person` has **exactly** the keys `id`, `name`, `role`; every value is a non-empty, trimmed string.
- Ids are unique and follow `p-001`, `p-002`, …
- `PERSON_ROLES` = `['In-Game Leader', 'Fragger', 'Support', 'Scout', 'Sniper', 'Analyst']`.
- `people` has at least 6 entries; the array and its objects are frozen.
- `PEOPLE_DATA_SOURCE` states that the data is illustrative/fictional.

## 5. Decisions

| ID | Decision | Reason |
|---|---|---|
| D1 | `PeopleLayout` wraps its `<Outlet />` in `<section className="content-area">` instead of the slide-22 sample's nested `<main>` | `AppLayout` already owns the single `<main>` landmark; a second `<main>` would violate the one-`main`-per-page rule (`project-rules.md` §7, WCAG landmark guidance) |
