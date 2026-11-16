# Ex1.3 Verification — Render-Pass Comparison and Form Accessibility

> Task **T21**. Environment: Windows 11, PowerShell, Node `v26.8.2`, React `^19.3`, Vitest `5.1.0`.
> Recorded: 2026-11-16. Automated results were produced by Claude Code in this session; browser checks were performed and confirmed by the student.

## 1. Render-pass comparison (automated)

Both measurements use the same scenario: type an invalid prefix (`ab`), reset the `<Profiler>` commit counter, then type **one** character (`c`) that flips the field from invalid to valid.

| Implementation | Test | Commits for one keystroke |
|---|---|---|
| Legacy 5-`useEffect` waterfall (`src/legacy/LegacySimpleForm.jsx`) | `src/legacy/LegacySimpleForm.test.jsx` (T06) — logged by `console.info` | **4** |
| Context form engine (`src/forms/SimpleForm.jsx`) | `src/forms/SimpleForm.test.jsx` › *render budget* (T11) — `expect(commits).toBe(1)` | **1** |

Real test output:

```
[legacy waterfall] commits for one keystroke (invalid → valid): 4
✓ SimpleForm > render budget: one keystroke produces exactly 1 commit, even when it flips invalid → valid
```

Why the legacy form needs 4 commits:

| Commit | Cause |
|---|---|
| 1 | keystroke → `LegacyInputField` `setValue` |
| 2 | effect #1 `syncToParent` → parent `setValues` |
| 3 | effect #2 `validateField` → `setErrors` |
| 4 | effect #3 `calcFormValidity` → `setIsValid` + effect #4 `syncErrorsToChild` → `setChildError` (batched) |

The engine needs 1: the keystroke calls `setValues` once; `errors = validate(values)` and `isValid` are recomputed in that same render.

Static guard (T19, `tests/no-effect-in-forms.test.js`): all 3 tests pass. `git grep -n "useEffect" -- src/forms` → no matches.

## 2. Command summaries (automated, this session)

| Command | Result |
|---|---|
| `npm test` → `test:node` | `ℹ tests 111 · ℹ pass 111 · ℹ fail 0` |
| `npm test` → `test:ui` | `Test Files 14 passed (14) · Tests 53 passed (53)` |
| `npm run lint` | exit 0 |
| `npm run build` | `✓ built in 250ms`; lazy chunk `RegisterPage-Cw3C04G0.js` 3.67 kB (gzip 1.63 kB) + `RegisterPage-Crz9wwOb.css` 1.79 kB |
| `git diff --check` | exit 0 |

## 3. Browser checks (student)

The student ran the app (`npm run dev` → `/register`) and confirmed on 2026-11-16 that every check below behaved as expected.

| # | Check | Expected | Result |
|---|---|---|---|
| 1 | React DevTools **Profiler**: record one keystroke in *Full name* | 1 commit for the keystroke | Confirmed by student |
| 2 | Console during typing, blur and submit | No *Maximum update depth exceeded*, no warnings | Confirmed by student |
| 3 | Accessibility tree (DevTools → Accessibility) | Each control has a name; after an error shows: `invalid: true` and a description `Error: <message>` | Confirmed by student |
| 4 | Keyboard-only run-through | Tab reaches every field and *Submit* with a visible focus ring; submit via Enter; summary alert announced | Confirmed by student |
| 5 | 375px viewport (T20 manual) | No horizontal scroll; one column; two columns at ≥ 768px | Confirmed by student |
| 6 | Errors not by colour alone | Thick border + ⚠ + visible "Error:" text | Confirmed by student |
| 7 | Lighthouse on `/register` | Accessibility target 100 | **Accessibility 100**, **Performance 99** (reported by student) |

## 4. Conclusion

- The slide-13 waterfall costs **4 commits** per validity-flipping keystroke; the derived engine costs **1**, proven by an automated `<Profiler>` assertion rather than by inspection.
- `src/forms/**` contains no effects (guarded by T19); the legacy reproduction is never imported by app code.
- Accessibility bindings (`useId`, `aria-invalid`, `aria-describedby`) are covered by `src/forms/InputField.test.jsx` and were confirmed manually in the browser.
