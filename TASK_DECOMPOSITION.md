# Task Decomposition — Lab 4 · Ex1.3 (Legacy Validation Anti-Patterns → Synchronous Context Form Engine + Sprint 2)

> **Goal:** prove why the 5-`useEffect` validation waterfall is broken, then replace it with a Context-driven form engine that derives errors and validity in a **single render pass**, with accessible fields (`useId`, `aria-invalid`, `aria-describedby`) and a live `<ShowData />` inspector.
> **Rules:** `project-rules.md` · **Workflow:** `CLAUDE.md` · **Slides:** 13, 14, 15.
> **Commit budget:** ≥ 10 required → this plan has **22** (T01–T22), excluding the baseline import T00.

## Legend

**[1] Contract · [2] Fail Test (RED) · [3] Implement (GREEN) · [4] Refactor** · `ops` = docs/tooling. One task = one commit with the exact message. Tick `[x]` in the same commit.

## Summary

| ID | Stage | Commit message |
|---|---|---|
| T00 | ops | `chore: import Ex1.1 baseline` *(manual, during setup)* |
| T01 | ops | `docs(history): archive Ex1.1 plan, audit and verification` |
| T02 | ops | `docs(rules): scope project rules and Claude workflow to Ex1.3` |
| T03 | ops | `docs(plan): add Ex1.3 task decomposition and AI audit log` |
| T04 | [1] | `docs(contract): define form engine and registration contracts` |
| T05 | ops | `chore(legacy): reproduce slide-13 useEffect validation waterfall` |
| T06 | ops | `test(legacy): measure render cascade of the legacy waterfall` |
| T07 | [2] | `test(forms): add failing tests for validateRegistration rules` |
| T08 | [3] | `feat(forms): implement pure validateRegistration rules` |
| T09 | [2] | `test(forms): add failing tests for FormContext and useFormContext` |
| T10 | [3] | `feat(forms): add form context provider contract and useFormContext hook` |
| T11 | [2] | `test(forms): add failing tests for SimpleForm derived validation` |
| T12 | [3] | `feat(forms): add SimpleForm with synchronous derived validation` |
| T13 | [2] | `test(forms): add failing accessibility tests for InputField` |
| T14 | [3] | `feat(forms): add InputField validation with useId and aria bindings` |
| T15 | [2] | `test(inspector): add failing tests for ShowData inspector` |
| T16 | [3] | `feat(inspector): add semantic ShowData inspector output` |
| T17 | [2] | `test(register): add failing integration tests for registration route` |
| T18 | [3] | `feat(register): add lazy /register route composing the form engine` |
| T19 | ops | `test(forms): guard form engine against useEffect` |
| T20 | [4] | `style(forms): add responsive accessible form styles` |
| T21 | ops | `docs(verification): record render-pass comparison and form a11y checks` |
| T22 | ops | `docs(readme): document Ex1.3 form engine architecture` |

Sprint 2 slide commits map to **T10** (*feat: form context*), **T14** (*feat: input field validation*), **T16** (*feat: inspector output*).

---

## Tasks

### T00 · ops · `chore: import Ex1.1 baseline`
- [x] Done during setup.

### T01 · ops · `docs(history): archive Ex1.1 plan, audit and verification`
- [x] Done *(ticked by T03)*
- **Do:** `git mv TASK_DECOMPOSITION.md AI_FAILURE_AUDIT.md docs/verification/ex1.1-performance.md docs/history/ex1.1/`.

### T02 · ops · `docs(rules): scope project rules and Claude workflow to Ex1.3`
- [x] Done *(ticked by T03)*
- **Do:** overwrite `project-rules.md`, `CLAUDE.md` from `../_lab4-kit/Ex1.3/`.

### T03 · ops · `docs(plan): add Ex1.3 task decomposition and AI audit log`
- [x] Done
- **Do:** copy `TASK_DECOMPOSITION.md`, `AI_FAILURE_AUDIT.md` from `../_lab4-kit/Ex1.3/`; tick T01–T03.

### T04 · [1] Contract · `docs(contract): define form engine and registration contracts`
- [x] Done
- **Files:** `docs/contracts/ex1.3-form-engine.md`
- **Content:**
  - `validate(values) → errors` — pure; returns `{ [field]: message }` for failing fields only.
  - `SimpleForm({ initialValues, validate, onValidSubmit, submitLabel = 'Submit', children })` — state: `values`, `touched` (`{ [field]: true }`), `submitAttempted` (boolean). Derived during render: `errors = validate(values)`, `isValid = Object.keys(errors).length === 0`. Renders `<form noValidate onSubmit>` → `{children}` → submit button `type="submit"`; when `submitAttempted && !isValid` a summary `<p role="alert">Fix N field(s) before submitting.</p>`.
  - Context value: `{ values, errors, touched, submitAttempted, isValid, setFieldValue(name, value), markTouched(name) }`.
  - `useFormContext()` — throws `Error('useFormContext must be used inside <SimpleForm>')` when context is `null`.
  - `InputField({ name, label, type = 'text', options, autoComplete, inputMode, hint })` — renders `<select>` when `options` is given, otherwise `<input>`; `showError = Boolean(errors[name]) && (touched[name] || submitAttempted)`.
  - `ShowData({ data, title = 'Submitted data' })` — `<section aria-labelledby>` + `<h2>` + `<dl className="json-inspector">` mapping `Object.entries(data)` with `<Fragment key={key}>`; values via `String(value)`.
  - Registration field table (copy from `project-rules.md` §2).
  - **Render budget:** 1 keystroke = 1 `setValues` = **1 commit**.
  - **Decision D1:** `SimpleForm` is generic (`validate` prop) so Ex1.7.1 can reuse it with `validateMessage`.

### T05 · ops · `chore(legacy): reproduce slide-13 useEffect validation waterfall`
- [x] Done
- **Files:** `src/legacy/LegacySimpleForm.jsx`, `src/legacy/README.md`
- **Do:** faithful but **bounded** reproduction of the slide-13 trace:
  - `LegacyInputField` keeps local `value` state; **effect #1** `syncToParent` calls `onValueChange(value)`.
  - `LegacySimpleForm` stores `values`; **effect #2** `validateField` sets `errors`; **effect #3** `calcFormValidity` sets `isValid`; **effect #4** `syncErrorsToChild` pushes the error into child state; **effect #5** `autoScrollToError` calls `scrollIntoView?.()` when an error exists.
  - Guard each `setState` with an equality check so it terminates (we measure the cascade; we do not ship an infinite loop).
  - File header + `README.md`: "Anti-pattern reproduction for Exercise 1.3. Not routed. Do not import from app code."
- **Done when:** lint/build pass; nothing under `src/` outside `src/legacy/` imports it (`git grep -n "legacy/" src` shows only tests).

### T06 · ops · `test(legacy): measure render cascade of the legacy waterfall`
- [x] Done
- **Files:** `src/legacy/LegacySimpleForm.test.jsx`
- **Do:** wrap `LegacySimpleForm` in `<Profiler id="legacy" onRender={…}>`. Type a prefix that is still invalid (e.g. `ab`), **reset the counter**, then type **one** character that flips the field from invalid to valid (`c`) — the waterfall only fully cascades when the error actually changes. Assert `commits >= 3` and log the exact number with `console.info` (recorded in T21). Characterisation test: GREEN. *(Kit smoke test measured 4 commits for this keystroke vs 1 for the derived engine.)*

### T07 · [2] Fail Test · `test(forms): add failing tests for validateRegistration rules`
- [x] Done
- **Files:** `tests/validateRegistration.test.js` (`node:test`)
- **Assert:** a fully valid object → `{}`; boundary cases — `fullName` 1/2/50/51 chars and whitespace-only; `email` missing `@`/domain; `age` `''`, 15, 16, 100, 101, 20.5; `role` `''` and a role outside `PERSON_ROLES`; exact error messages from the field table; the input object is not mutated.

### T08 · [3] Implement · `feat(forms): implement pure validateRegistration rules`
- [x] Done
- **Files:** `src/forms/validateRegistration.js`
- **Do:** import `PERSON_ROLES` from `src/data/people.js`; no React imports.

### T09 · [2] Fail Test · `test(forms): add failing tests for FormContext and useFormContext`
- [x] Done
- **Files:** `src/forms/FormContext.test.jsx`
- **Assert:** a probe component using `useFormContext()` outside a provider throws the exact message; inside `<FormContext.Provider value={…}>` it receives that value.

### T10 · [3] Implement · `feat(forms): add form context provider contract and useFormContext hook`
- [x] Done
- **Files:** `src/forms/FormContext.js`
- **Do:** `export const FormContext = createContext(null)`; `export function useFormContext()` per T04. JSDoc typedef of the context value.

### T11 · [2] Fail Test · `test(forms): add failing tests for SimpleForm derived validation`
- [x] Done
- **Files:** `src/forms/SimpleForm.test.jsx`
- **Assert** (use a tiny probe child reading context, plus a raw `<input>` bound via `setFieldValue`):
  - initial render: `errors` derived from `initialValues`, `isValid` false, no error UI shown;
  - submitting while invalid → `onValidSubmit` **not** called, `submitAttempted` true, summary alert shows the count;
  - after valid values → submitting calls `onValidSubmit(values)` once;
  - **render budget:** inside `<Profiler>`, typing one character produces **exactly 1** commit.

### T12 · [3] Implement · `feat(forms): add SimpleForm with synchronous derived validation`
- [x] Done
- **Files:** `src/forms/SimpleForm.jsx`
- **Do:** implement per T04 — `useState` only, no `useEffect`, no `useMemo` unless a test proves the need; `setFieldValue` uses the functional updater `setValues(prev => ({ ...prev, [name]: value }))`.

### T13 · [2] Fail Test · `test(forms): add failing accessibility tests for InputField`
- [x] Done
- **Files:** `src/forms/InputField.test.jsx`
- **Assert** (inside a real `SimpleForm`):
  - `getByLabelText('Full name')` finds the input (label binding via `useId`); two `InputField`s get different ids;
  - before blur: `aria-invalid="false"`, no `aria-describedby`;
  - after blur with an invalid value: `aria-invalid="true"`, `aria-describedby` points to an element whose text is the error message;
  - after fixing the value: the error element is gone and `aria-describedby` is removed;
  - number field stores a number (`valueAsNumber`) and `''` when cleared — never `NaN`;
  - `options` renders a `<select>` with a placeholder option and the given options.

### T14 · [3] Implement · `feat(forms): add InputField validation with useId and aria bindings`
- [ ] Done
- **Files:** `src/forms/InputField.jsx`
- **Do:** implement per T04; `onChange` → `setFieldValue`, `onBlur` → `markTouched`; error text in `<p id={errorId} className="field-error">`.

### T15 · [2] Fail Test · `test(inspector): add failing tests for ShowData inspector`
- [ ] Done
- **Files:** `src/components/ShowData.test.jsx`
- **Assert:** heading *Submitted data* (or custom `title`); a `dl` with one `dt`/`dd` pair per key, in insertion order; numbers and booleans rendered as text; untrusted strings such as `<img src=x onerror=alert(1)>` render as literal text (no element created).

### T16 · [3] Implement · `feat(inspector): add semantic ShowData inspector output`
- [ ] Done
- **Files:** `src/components/ShowData.jsx`

### T17 · [2] Fail Test · `test(register): add failing integration tests for registration route`
- [ ] Done
- **Files:** `src/pages/register/RegisterPage.test.jsx`
- **Assert** (`MemoryRouter` at `/register`, deferred/real lazy as in Ex1.1 tests):
  - primary nav has a *Register* link that is active;
  - heading *Player registration*; fields *Full name*, *Email*, *Age*, *Role*;
  - submitting empty → summary alert, each field `aria-invalid="true"`, no inspector;
  - filling valid data and submitting → `ShowData` shows `fullName`, `email`, `age`, `role` with the entered values.

### T18 · [3] Implement · `feat(register): add lazy /register route composing the form engine`
- [ ] Done
- **Files:** `src/pages/register/RegisterPage.jsx`, `src/routes/lazyRoutes.js` (`loadRegisterPage`), `src/App.jsx`, `src/layouts/AppLayout.jsx`
- **Do:** `RegisterPage` keeps `submitted` state (`null` until a valid submit) → `<SimpleForm initialValues={{ fullName: '', email: '', age: '', role: '' }} validate={validateRegistration} onValidSubmit={setSubmitted}>` with four `InputField`s; renders `<ShowData data={submitted} />` when set. Route `register` is lazy with the `PageSkeleton` boundary. Add `NavLink` *Register*.

### T19 · ops · `test(forms): guard form engine against useEffect`
- [ ] Done
- **Files:** `tests/no-effect-in-forms.test.js` (`node:test`)
- **Do:** read every file in `src/forms/` (excluding `*.test.jsx`) and assert none contains `useEffect` or `useLayoutEffect`; also assert no file outside `src/legacy/` imports `legacy/` (except tests).

### T20 · [4] Refactor · `style(forms): add responsive accessible form styles`
- [ ] Done
- **Files:** `src/forms/forms.css`, `src/components/show-data.css`
- **Do:** single-column fields at 375px, two-column at ≥ 768px; error text prefixed with a visible "Error:" label and an icon marked `aria-hidden` (not colour alone); `:focus-visible`; `[aria-invalid="true"]` border style; inspector `dl` grid.
- **Done when:** all green. **Manual:** 375px no horizontal scroll.

### T21 · ops · `docs(verification): record render-pass comparison and form a11y checks`
- [ ] Done
- **Files:** `docs/verification/ex1.3-form-engine.md`
- **Do:** Claude records the legacy commit count printed by T06 vs the 1-commit assertion of T11. The **student** adds:
  1. React DevTools **Profiler** recording of one keystroke in `/register` → 1 commit (screenshot description / numbers).
  2. Console: no *Maximum update depth exceeded*, no warnings.
  3. Accessibility tree: each input has a name, `invalid: true` and a description when the error shows.
  4. Keyboard-only run-through of the form; Lighthouse Accessibility score.
  5. Real summaries of `npm test`, `npm run lint`, `npm run build`.

### T22 · ops · `docs(readme): document Ex1.3 form engine architecture`
- [ ] Done
- **Files:** `README.md`
- **Do:** explain the waterfall vs single-pass architecture (diagram in Markdown/ASCII), the context value contract, route `/register`, and lineage (HW3 → Ex1.2 → Ex1.1 → Ex1.3).

---

## Final Verification

- [ ] `git log --oneline` shows T00–T22, one commit each.
- [ ] `npm test`, `npm run lint`, `npm run build`, `git diff --check` pass.
- [ ] `git grep -n "useEffect" src/forms` → no matches.
- [ ] All Ex1.2 and Ex1.1 tests still present and green.

## Decisions

| ID | Decision | Reason |
|---|---|---|
| D1 | Generic `SimpleForm` with a `validate` prop | Reused by Ex1.7.1 for client/server validation parity |
| D2 | The submit button stays enabled; invalid submit reveals all errors + summary alert | Disabled buttons hide *why* submission is blocked (a11y) |
| D3 | Legacy waterfall kept as bounded evidence in `src/legacy/` | Lets the live defense demonstrate the cascade without crashing the app |
| D4 | Slide 14 places one `useId()` in the provider; we call `useId()` per `InputField` | One id cannot uniquely bind several label/input/error triples |
