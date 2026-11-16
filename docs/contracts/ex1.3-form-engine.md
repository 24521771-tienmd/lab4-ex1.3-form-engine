# Ex1.3 Contract — Synchronous Form Engine and Registration Form

> Stage **[1] Contract** (task T04). Written before any implementation.
> Sources: `project-rules.md` §2, §7, §7.2 and §8, `TASK_DECOMPOSITION.md` T04–T22, Lab 4 slides 13–15.
> Builds on `docs/contracts/ex1.2-routing.md` and `docs/contracts/ex1.1-lazy-loading.md` (existing routes, skeletons and lazy loaders are unchanged).
> Libraries: React `^19.3` (`createContext`, `use`/`useContext`, `useState`, `useId`, `Fragment`), `react-router@^7` for the `/register` route. No new dependencies.

## 1. Module map

| Module | Exports | Task |
|---|---|---|
| `src/forms/validateRegistration.js` | `validateRegistration(values)` | T07 → T08 |
| `src/forms/FormContext.js` | `FormContext`, `useFormContext()` | T09 → T10 |
| `src/forms/SimpleForm.jsx` | `export default SimpleForm` | T11 → T12 |
| `src/forms/InputField.jsx` | `export default InputField` | T13 → T14 |
| `src/components/ShowData.jsx` | `export default ShowData` | T15 → T16 |
| `src/pages/register/RegisterPage.jsx` | `export default RegisterPage` (lazy route `/register`) | T17 → T18 |

Components use `export default function X(…)`, matching the existing components (required by `lazy()` for the page). Non-component modules use named exports.
| `src/legacy/LegacySimpleForm.jsx` | slide-13 anti-pattern reproduction — **evidence only, never imported by app code** | T05 → T06 |

Hard rule: no file in `src/forms/**` contains `useEffect` or `useLayoutEffect` (guarded by T19).

## 2. Validation contract — `validate(values) → errors`

```js
/**
 * @template {Record<string, unknown>} V
 * @callback Validate
 * @param {V} values  Current form values (never mutated).
 * @returns {Partial<Record<keyof V, string>>}  Only the failing fields, mapped to a user-facing message.
 */
```

- **Pure:** same input → same output; no I/O, no mutation, no React imports, no dates or randomness.
- **Failing fields only:** a fully valid object returns `{}` (so `isValid === Object.keys(errors).length === 0`).
- **Synchronous:** called during render, never inside an effect.

## 3. Registration field table — `validateRegistration(values)`

`values` shape: `{ fullName: string, email: string, age: number | '', role: string }`.

| Field | Control | Rule | Error message (exact) |
|---|---|---|---|
| `fullName` | `<input type="text">` | required; length 2–50 **after trim** | `Full name must be 2–50 characters.` |
| `email` | `<input type="email">` | required; matches `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | `Enter a valid email address.` |
| `age` | `<input type="number">`, read via `e.target.valueAsNumber` | `''` → required; otherwise integer 16–100 inclusive | `Age is required.` / `Age must be a whole number from 16 to 100.` |
| `role` | `<select>` from `PERSON_ROLES` | required; must be one of `PERSON_ROLES` | `Choose a role.` |

`PERSON_ROLES` is imported from `src/data/people.js`: `In-Game Leader`, `Fragger`, `Support`, `Scout`, `Sniper`, `Analyst`.

Boundary cases the tests (T07) must cover: `fullName` 1 / 2 / 50 / 51 chars and whitespace-only; `email` without `@` and without a domain dot; `age` `''`, 15, 16, 100, 101, 20.5; `role` `''` and a value outside `PERSON_ROLES`; input object not mutated.

## 4. Form context value

```js
/**
 * @typedef {Object} FormContextValue
 * @property {Record<string, unknown>} values           Current field values.
 * @property {Record<string, string>}  errors           validate(values), derived during render.
 * @property {Record<string, true>}    touched          Fields that have been blurred at least once.
 * @property {boolean}                 submitAttempted  True after the first submit attempt.
 * @property {boolean}                 isValid          Object.keys(errors).length === 0, derived during render.
 * @property {(name: string, value: unknown) => void} setFieldValue
 * @property {(name: string) => void}  markTouched
 */
```

- `FormContext = createContext(null)`.
- `useFormContext()` returns the value, or **throws** `Error('useFormContext must be used inside <SimpleForm>')` when the context is `null`.
- Only `values`, `touched` and `submitAttempted` are state. `errors` and `isValid` are **never stored** — they are recomputed every render.

## 5. Component contracts

### 5.1 `SimpleForm`

```jsx
<SimpleForm
  initialValues={{ fullName: '', email: '', age: '', role: '' }}
  validate={validateRegistration}
  onValidSubmit={(values) => {}}
  submitLabel="Submit"            // default 'Submit'
>
  {children}
</SimpleForm>
```

| Prop | Type | Notes |
|---|---|---|
| `initialValues` | object | Seeds `values` once (`useState(initialValues)`). |
| `validate` | `Validate` | Pure function from §2; generic, not tied to registration (D1). |
| `onValidSubmit` | `(values) => void` | Called **once** per valid submit, with the current `values`. |
| `submitLabel` | string, default `'Submit'` | Default parameter, never `defaultProps`. |
| `children` | node | Usually `InputField`s. |

Behaviour:

- State: `values`, `touched` (`{ [field]: true }`), `submitAttempted` (boolean). `useState` only.
- During render: `const errors = validate(values)`; `const isValid = Object.keys(errors).length === 0`.
- `setFieldValue(name, value)` → `setValues(prev => ({ ...prev, [name]: value }))` (functional updater, immutable).
- `markTouched(name)` → `setTouched(prev => ({ ...prev, [name]: true }))`.
- Renders `<form noValidate onSubmit={handleSubmit}>` → `<FormContext.Provider value={…}>{children}</FormContext.Provider>` → `<button type="submit">{submitLabel}</button>`.
- `handleSubmit(e)`: `e.preventDefault()`; `setSubmitAttempted(true)`; if `isValid` → `onValidSubmit(values)`.
- When `submitAttempted && !isValid`: `<p role="alert">Fix N field(s) before submitting.</p>` where `N = Object.keys(errors).length`.
- The submit button is **never disabled** (D2).

### 5.2 `InputField`

```jsx
<InputField name="age" label="Age" type="number" inputMode="numeric" hint="16–100" />
<InputField name="role" label="Role" options={PERSON_ROLES} />
```

| Prop | Type | Notes |
|---|---|---|
| `name` | string | Key in `values` / `errors` / `touched`. |
| `label` | string | Visible `<label htmlFor={id}>` text. |
| `type` | `'text' \| 'email' \| 'number'`, default `'text'` | Ignored when `options` is given. |
| `options` | `readonly string[]` (optional) | Renders `<select>` with a placeholder `<option value="">` followed by one `<option>` per entry (key = the option string). |
| `autoComplete`, `inputMode` | string (optional) | Passed through to the control. |
| `hint` | string (optional) | Helper text shown under the control. |

Behaviour:

- Reads everything through `useFormContext()`; no local value state.
- `const id = useId()` **per field** (D4); `errorId = `${id}-error``.
- `showError = Boolean(errors[name]) && (touched[name] || submitAttempted)`.
- Control attributes: `id`, `name`, `value`, `aria-invalid={showError}` (`"true"`/`"false"`), `aria-describedby={showError ? errorId : undefined}`.
- `onChange`: number inputs store `e.target.valueAsNumber`, or `''` when it is `NaN` (empty) — **never `NaN`**; other controls store `e.target.value`. Calls `setFieldValue(name, next)`.
- `onBlur`: `markTouched(name)`.
- When `showError`: `<p id={errorId} className="field-error">{errors[name]}</p>`. When hidden, the element is not rendered and `aria-describedby` is removed.

### 5.3 `ShowData`

```jsx
<ShowData data={submitted} title="Submitted data" />
```

| Prop | Type | Notes |
|---|---|---|
| `data` | object | Rendered in insertion order of `Object.entries(data)`. |
| `title` | string, default `'Submitted data'` | Heading text. |

Renders `<section aria-labelledby={headingId}>` → `<h2 id={headingId}>{title}</h2>` → `<dl className="json-inspector">` with one `<Fragment key={key}><dt>{key}</dt><dd>{String(value)}</dd></Fragment>` per entry. Values are JSX text (auto-escaped): no `JSON.stringify` dump, no `dangerouslySetInnerHTML`.

### 5.4 `RegisterPage` — route `/register`

- Lazy: `loadRegisterPage = () => import('../pages/register/RegisterPage.jsx')` in `src/routes/lazyRoutes.js`; declared at module top level; rendered inside the existing `PageSkeleton` `<Suspense>` boundary.
- Primary nav gets a `<NavLink to="/register">Register</NavLink>` (active style via `className={({ isActive }) => …}`).
- Heading `<h1>Player registration</h1>`; four `InputField`s: *Full name* (`fullName`), *Email* (`email`), *Age* (`age`, number), *Role* (`role`, `options={PERSON_ROLES}`).
- State: `submitted` (`null` until a valid submit) → `onValidSubmit={setSubmitted}` → renders `<ShowData data={submitted} />` when set.
- No persistence, no people-list changes, no backend (Ex1.7.1).
- Uses the layout's single `<main>`; the page itself renders a `<section>`.

## 6. Render budget

| Event | Required | Forbidden |
|---|---|---|
| 1 keystroke in a field | **1 `setValues` call → exactly 1 React commit** for `SimpleForm` (asserted with `<Profiler>` in T11) | any effect that sets `errors`, `isValid` or child state |
| blur | 1 `setTouched` → 1 commit | — |
| submit | 1 batched update (`submitAttempted` ± parent `submitted`) | — |

Comparison baseline: the legacy waterfall (T05/T06) must show **≥ 3 commits** for the single keystroke that flips a field from invalid to valid; the measured number is recorded in T21.

## 7. Accessibility acceptance

- Every control has a visible `<label htmlFor>` bound via `useId()`; two fields never share an id.
- `aria-invalid` reflects `showError`; `aria-describedby` points only at an error element that exists.
- Errors are not communicated by colour alone (visible "Error:" text, T20).
- Invalid submit: summary `role="alert"` plus every invalid field shows its error.
- Works at 375px without horizontal scroll (T20, manual check).

## 8. Decisions

| ID | Decision | Reason |
|---|---|---|
| D1 | `SimpleForm` is generic and takes a `validate` prop | Ex1.7.1 reuses it with `validateMessage` for client/server validation parity |
| D2 | The submit button stays enabled; an invalid submit reveals all errors plus a summary alert | A disabled button hides *why* submission is blocked (a11y) |
| D3 | The legacy waterfall is kept as bounded evidence in `src/legacy/` | Lets the live defense demonstrate the cascade without crashing the app |
| D4 | `useId()` is called per `InputField` (slide 14 calls it once in the provider) | One id cannot uniquely bind several label/input/error triples |
