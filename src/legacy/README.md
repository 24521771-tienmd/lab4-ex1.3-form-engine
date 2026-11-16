# `src/legacy/` — evidence only

Anti-pattern reproduction for Exercise 1.3. Not routed. Do not import from app code.

`LegacySimpleForm.jsx` reproduces the Lab 4 slide-13 validation waterfall:

| # | Effect | What it copies into state |
|---|---|---|
| 1 | `syncToParent` | child input value → parent `values` |
| 2 | `validateField` | `values` → `errors` |
| 3 | `calcFormValidity` | `errors` → `isValid` |
| 4 | `syncErrorsToChild` | `errors` → error state fed back to the child |
| 5 | `autoScrollToError` | calls `scrollIntoView?.()` when an error is shown |

Each `setState` is guarded by an equality check so the cascade **terminates** — it is a measurement fixture, not a crash demo (decision D3).

Rules:

- Only test files (`*.test.jsx`) may import from this folder (enforced by T19).
- This folder is excluded from the "no `useEffect` in `src/forms/**`" guard.
- The correct, single-render-pass design lives in `src/forms/`.
