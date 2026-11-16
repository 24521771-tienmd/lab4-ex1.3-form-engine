# Claude Code Prompts — Lab 4 · Ex1.1

> **Cách dùng (VN):** mở terminal trong thư mục `Week4\Ex1.1`, chạy `claude --add-dir ..\_lab4-kit`.
> Dán **P0** trước, sau đó dán từng prompt **T01 → T17** theo thứ tự, mỗi lần một prompt.
> Sau mỗi prompt: đọc báo cáo, xem `git show --stat`, làm các *manual check* nếu Claude yêu cầu, rồi mới dán prompt tiếp theo.
> Nếu có sự cố, dùng các prompt **U1–U4** ở cuối file.

---

## P0 · Session primer (dán đầu mỗi phiên Claude Code mới)

```text
You are assisting me on Lab 4 Exercise 1.1 in this repository (Windows 11, PowerShell, Node 26).
Read these files before anything else. Until task T03 is committed in THIS repo, read the kit copies in ../_lab4-kit/Ex1.1/ (any root copies may still belong to the previous exercise); after T03 the root copies are the source of truth:
  1. CLAUDE.md  2. project-rules.md  3. TASK_DECOMPOSITION.md  4. AI_FAILURE_AUDIT.md
Then:
  a) Summarise the exercise goal in 3 bullets.
  b) Run `git log --oneline` and tell me which task IDs are already committed and which task is next.
  c) List anything in the current code that conflicts with the plan or the rules.
Do NOT modify files and do NOT commit in this step. Wait for my task prompt.
```

## T01 · ops

```text
Task T01 — ops — commit message: `docs(history): archive Ex1.2 plan, audit and verification`
Follow the CLAUDE.md protocol (use ../_lab4-kit/Ex1.1/CLAUDE.md if the root copy is not yet for Ex1.1): restate T01 and list the files you will touch; implement ONLY T01 exactly as specified in TASK_DECOMPOSITION.md; run the checks; there is no checkbox to tick yet (T03 ticks it); stage explicit paths; commit with the exact message above; report files, real command results and the commit hash; then stop.
Checks: `npm test`, `npm run lint`, `npm run build`, `git diff --check` — all must pass; paste the real summaries.
Task-specific notes: Read ../_lab4-kit/Ex1.1/CLAUDE.md, project-rules.md and TASK_DECOMPOSITION.md first (the repo still holds the Ex1.2 versions). Use `git mv` into docs/history/ex1.2/.
```

## T02 · ops

```text
Task T02 — ops — commit message: `docs(rules): scope project rules and Claude workflow to Ex1.1`
Follow the CLAUDE.md protocol (use ../_lab4-kit/Ex1.1/CLAUDE.md if the root copy is not yet for Ex1.1): restate T02 and list the files you will touch; implement ONLY T02 exactly as specified in TASK_DECOMPOSITION.md; run the checks; there is no checkbox to tick yet (T03 ticks it); stage explicit paths; commit with the exact message above; report files, real command results and the commit hash; then stop.
Checks: `npm test`, `npm run lint`, `npm run build`, `git diff --check` — all must pass; paste the real summaries.
Task-specific notes: Overwrite project-rules.md and CLAUDE.md with the ../_lab4-kit/Ex1.1/ versions, unchanged.
```

## T03 · ops

```text
Task T03 — ops — commit message: `docs(plan): add Ex1.1 task decomposition and AI audit log`
Follow the CLAUDE.md protocol (use ../_lab4-kit/Ex1.1/CLAUDE.md if the root copy is not yet for Ex1.1): restate T03 and list the files you will touch; implement ONLY T03 exactly as specified in TASK_DECOMPOSITION.md; run the checks; tick T03; stage explicit paths; commit with the exact message above; report files, real command results and the commit hash; then stop.
Checks: `npm test`, `npm run lint`, `npm run build`, `git diff --check` — all must pass; paste the real summaries.
Task-specific notes: Copy both files from ../_lab4-kit/Ex1.1/ and tick T01–T03.
```

## T04 · [1] Contract

```text
Task T04 — [1] Contract — commit message: `docs(contract): define lazy route boundaries and skeleton contract`
Follow the CLAUDE.md protocol (use ../_lab4-kit/Ex1.1/CLAUDE.md if the root copy is not yet for Ex1.1): restate T04 and list the files you will touch; implement ONLY T04 exactly as specified in TASK_DECOMPOSITION.md; run the checks; tick T04; stage explicit paths; commit with the exact message above; report files, real command results and the commit hash; then stop.
Checks: `npm test`, `npm run lint`, `npm run build`, `git diff --check` — all must pass; paste the real summaries.
Task-specific notes: Documentation only. Include the chunk map, loader names, boundary placement, Skeleton props, and Decision D1 (no class error boundary).
```

## T05 · [2] Fail Test (RED)

```text
Task T05 — [2] Fail Test (RED) — commit message: `test(skeleton): add failing tests for accessible Skeleton primitive`
Follow the CLAUDE.md protocol (use ../_lab4-kit/Ex1.1/CLAUDE.md if the root copy is not yet for Ex1.1): restate T05 and list the files you will touch; implement ONLY T05 exactly as specified in TASK_DECOMPOSITION.md; run the checks; tick T05; stage explicit paths; commit with the exact message above; report files, real command results and the commit hash; then stop.
Checks: run the relevant suite and show that ONLY the new tests fail, for the expected reason; every pre-existing test must still pass. Then lint and `git diff --check`.
Task-specific notes: RED task: tests only; the only failure must be the missing Skeleton module.
```

## T06 · [3] Implement (GREEN)

```text
Task T06 — [3] Implement (GREEN) — commit message: `feat(skeleton): add accessible Skeleton primitive`
Follow the CLAUDE.md protocol (use ../_lab4-kit/Ex1.1/CLAUDE.md if the root copy is not yet for Ex1.1): restate T06 and list the files you will touch; implement ONLY T06 exactly as specified in TASK_DECOMPOSITION.md; run the checks; tick T06; stage explicit paths; commit with the exact message above; report files, real command results and the commit hash; then stop.
Checks: `npm test`, `npm run lint`, `npm run build`, `git diff --check` — all must pass; paste the real summaries.
Task-specific notes: Add a global .visually-hidden utility only if it does not exist. Respect prefers-reduced-motion.
```

## T07 · [4] Refactor

```text
Task T07 — [4] Refactor — commit message: `refactor(people): extract dossier dimensions into CSS custom properties`
Follow the CLAUDE.md protocol (use ../_lab4-kit/Ex1.1/CLAUDE.md if the root copy is not yet for Ex1.1): restate T07 and list the files you will touch; implement ONLY T07 exactly as specified in TASK_DECOMPOSITION.md; run the checks; tick T07; stage explicit paths; commit with the exact message above; report files, real command results and the commit hash; then stop.
Checks: `npm test`, `npm run lint`, `npm run build`, `git diff --check` — all must pass; paste the real summaries.
Task-specific notes: Pure refactor of CSS sizes into custom properties: zero visual change. Extend the CSS guard test; do not weaken it.
```

## T08 · [2] Fail Test (RED)

```text
Task T08 — [2] Fail Test (RED) — commit message: `test(skeleton): add failing tests for PersonDetailSkeleton and PageSkeleton`
Follow the CLAUDE.md protocol (use ../_lab4-kit/Ex1.1/CLAUDE.md if the root copy is not yet for Ex1.1): restate T08 and list the files you will touch; implement ONLY T08 exactly as specified in TASK_DECOMPOSITION.md; run the checks; tick T08; stage explicit paths; commit with the exact message above; report files, real command results and the commit hash; then stop.
Checks: run the relevant suite and show that ONLY the new tests fail, for the expected reason; every pre-existing test must still pass. Then lint and `git diff --check`.
Task-specific notes: RED task: assert that placeholder dt/dd are hidden from the accessibility tree (aria-hidden).
```

## T09 · [3] Implement (GREEN)

```text
Task T09 — [3] Implement (GREEN) — commit message: `feat(skeleton): add dimension-matched PersonDetailSkeleton and PageSkeleton`
Follow the CLAUDE.md protocol (use ../_lab4-kit/Ex1.1/CLAUDE.md if the root copy is not yet for Ex1.1): restate T09 and list the files you will touch; implement ONLY T09 exactly as specified in TASK_DECOMPOSITION.md; run the checks; tick T09; stage explicit paths; commit with the exact message above; report files, real command results and the commit hash; then stop.
Checks: `npm test`, `npm run lint`, `npm run build`, `git diff --check` — all must pass; paste the real summaries.
Task-specific notes: Reuse the T07 custom properties so skeleton rows equal real rows (CLS = 0).
```

## T10 · [2] Fail Test (RED)

```text
Task T10 — [2] Fail Test (RED) — commit message: `test(routes): add failing tests for lazy PersonDetail Suspense fallback`
Follow the CLAUDE.md protocol (use ../_lab4-kit/Ex1.1/CLAUDE.md if the root copy is not yet for Ex1.1): restate T10 and list the files you will touch; implement ONLY T10 exactly as specified in TASK_DECOMPOSITION.md; run the checks; tick T10; stage explicit paths; commit with the exact message above; report files, real command results and the commit hash; then stop.
Checks: run the relevant suite and show that ONLY the new tests fail, for the expected reason; every pre-existing test must still pass. Then lint and `git diff --check`.
Task-specific notes: RED task. Use vi.mock with importOriginal + a deferred promise for loadPersonDetail, and vi.resetModules + dynamic import of App per test (lazy caches modules). No timing-based waits.
```

## T11 · [3] Implement (GREEN)

```text
Task T11 — [3] Implement (GREEN) — commit message: `feat(routes): lazy-load PersonDetail behind a Suspense skeleton boundary`
Follow the CLAUDE.md protocol (use ../_lab4-kit/Ex1.1/CLAUDE.md if the root copy is not yet for Ex1.1): restate T11 and list the files you will touch; implement ONLY T11 exactly as specified in TASK_DECOMPOSITION.md; run the checks; tick T11; stage explicit paths; commit with the exact message above; report files, real command results and the commit hash; then stop.
Checks: `npm test`, `npm run lint`, `npm run build`, `git diff --check` — all must pass; paste the real summaries.
Task-specific notes: lazy() must be called at module top level in App.jsx. If Ex1.2 tests need `await findBy...` because content is now async, change only the query style — never delete an assertion. List every Ex1.2 test you touched.
```

## T12 · [2] Fail Test (RED)

```text
Task T12 — [2] Fail Test (RED) — commit message: `test(routes): add failing tests for route-level chunk boundaries`
Follow the CLAUDE.md protocol (use ../_lab4-kit/Ex1.1/CLAUDE.md if the root copy is not yet for Ex1.1): restate T12 and list the files you will touch; implement ONLY T12 exactly as specified in TASK_DECOMPOSITION.md; run the checks; tick T12; stage explicit paths; commit with the exact message above; report files, real command results and the commit hash; then stop.
Checks: run the relevant suite and show that ONLY the new tests fail, for the expected reason; every pre-existing test must still pass. Then lint and `git diff --check`.
Task-specific notes: RED task: deferred mocks for loadArenaPage/loadPeopleLayout/loadNotFoundPage; assert header + Primary nav stay visible while 'Loading page' shows inside main.
```

## T13 · [3] Implement (GREEN)

```text
Task T13 — [3] Implement (GREEN) — commit message: `feat(routes): code-split ArenaPage, PeopleLayout and NotFoundPage`
Follow the CLAUDE.md protocol (use ../_lab4-kit/Ex1.1/CLAUDE.md if the root copy is not yet for Ex1.1): restate T13 and list the files you will touch; implement ONLY T13 exactly as specified in TASK_DECOMPOSITION.md; run the checks; tick T13; stage explicit paths; commit with the exact message above; report files, real command results and the commit hash; then stop.
Checks: `npm test`, `npm run lint`, `npm run build`, `git diff --check` — all must pass; paste the real summaries.
Task-specific notes: Suspense goes around <Outlet /> inside AppLayout's <main>, not around <Routes>. Paste the `npm run build` chunk list in your report.
```

## T14 · [2] Fail Test (RED)

```text
Task T14 — [2] Fail Test (RED) — commit message: `test(people): add failing test for detail chunk preloading`
Follow the CLAUDE.md protocol (use ../_lab4-kit/Ex1.1/CLAUDE.md if the root copy is not yet for Ex1.1): restate T14 and list the files you will touch; implement ONLY T14 exactly as specified in TASK_DECOMPOSITION.md; run the checks; tick T14; stage explicit paths; commit with the exact message above; report files, real command results and the commit hash; then stop.
Checks: run the relevant suite and show that ONLY the new tests fail, for the expected reason; every pre-existing test must still pass. Then lint and `git diff --check`.
Task-specific notes: RED task: mock loadPersonDetail as vi.fn(); use user-event hover and tab focus.
```

## T15 · [3] Implement (GREEN)

```text
Task T15 — [3] Implement (GREEN) — commit message: `perf(people): preload PersonDetail chunk on link hover and focus`
Follow the CLAUDE.md protocol (use ../_lab4-kit/Ex1.1/CLAUDE.md if the root copy is not yet for Ex1.1): restate T15 and list the files you will touch; implement ONLY T15 exactly as specified in TASK_DECOMPOSITION.md; run the checks; tick T15; stage explicit paths; commit with the exact message above; report files, real command results and the commit hash; then stop.
Checks: `npm test`, `npm run lint`, `npm run build`, `git diff --check` — all must pass; paste the real summaries.
Task-specific notes: No state and no effect — just onPointerEnter/onFocus handlers calling the loader. Tell me the manual Network-panel check.
```

## T16 · ops

```text
Task T16 — ops — commit message: `docs(verification): record chunk split and CLS evidence`
Follow the CLAUDE.md protocol (use ../_lab4-kit/Ex1.1/CLAUDE.md if the root copy is not yet for Ex1.1): restate T16 and list the files you will touch; implement ONLY T16 exactly as specified in TASK_DECOMPOSITION.md; run the checks; tick T16; stage explicit paths; commit with the exact message above; report files, real command results and the commit hash; then stop.
Checks: `npm test`, `npm run lint`, `npm run build`, `git diff --check` — all must pass; paste the real summaries.
Task-specific notes: Create docs/verification/ex1.1-performance.md, paste the real build chunk table and command summaries, then STOP and ask me for the manual Slow 3G / CLS / Lighthouse results. Commit only after I confirm.
```

## T17 · ops

```text
Task T17 — ops — commit message: `docs(readme): document Ex1.1 code-splitting architecture`
Follow the CLAUDE.md protocol (use ../_lab4-kit/Ex1.1/CLAUDE.md if the root copy is not yet for Ex1.1): restate T17 and list the files you will touch; implement ONLY T17 exactly as specified in TASK_DECOMPOSITION.md; run the checks; tick T17; stage explicit paths; commit with the exact message above; report files, real command results and the commit hash; then stop.
Checks: `npm test`, `npm run lint`, `npm run build`, `git diff --check` — all must pass; paste the real summaries.
Task-specific notes: README must describe the actual chunk map and boundaries; keep the lineage section.
```

---

## Utility prompts

### U1 · Checks failed inside the current task

```text
The checks for the current task failed (output above). Do not commit yet. Diagnose the root cause, fix it within the scope of the SAME task only, rerun all checks, and show me the diff before committing. If the fix needs files outside the task scope, stop and ask me.
```

### U2 · RED test fails for the wrong reason

```text
The new test fails for the wrong reason (import/typo/setup error), not because the feature is missing. Fix the test so it fails only on the missing behaviour, rerun, show me the failing assertion names, then commit with the task's exact message.
```

### U3 · Log an AI failure (only when it really happened)

```text
Earlier in this session you produced <describe the wrong output>. I verified it was wrong via <test / DevTools / grep>. Draft an AI_FAILURE_AUDIT.md entry using the template in that file, with real evidence only. Show me the draft; do not commit until I approve. When approved, commit it as: docs(audit): record <short title>
```

### U4 · Final verification before push

```text
Run the Final Verification checklist from TASK_DECOMPOSITION.md: `git log --oneline`, `npm test`, `npm run lint`, `npm run build`, `git diff --check`, and every git grep listed. Report each item as PASS/FAIL with real output. Do not push.
```
