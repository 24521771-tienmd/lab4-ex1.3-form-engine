# AI Failure Audit — Lab 4 · Ex1.1

> Graded deliverable. Log **only real** AI mistakes observed while building this exercise — hallucinated APIs, legacy syntax, broken effect loops, insecure code, false claims of passing checks. Never invent or copy entries from another exercise.

## What to watch for in this exercise

- `lazy()` declared inside a component body (remounts on every render).
- `fallback={null}` or spinners that shift layout (CLS > 0).
- Class-based error boundaries (banned) suggested for chunk errors.
- Timing-based tests (`setTimeout`) instead of deferred promises.

## Entry template

```markdown
### F-XX — <short title>
- **Task:** T?? (commit `<hash>` or "caught before commit")
- **AI prompt (summary):** …
- **AI output (excerpt):** `…` (≤ 10 lines)
- **Why it is wrong:** rule / API / spec it violates (cite project-rules.md § or official docs)
- **Impact:** what would break (render loop, memory leak, security hole, failing a11y…)
- **Detection:** how it was caught (failing test name, DevTools panel, `git grep`, review) with evidence
- **Fix:** what was changed manually and why
- **Verification:** command/test/DevTools result after the fix
```

## Findings

### F-01 — Instructed a non-existent `npm run preview` script
- **Task:** T15 / T16 (recorded in commit `2ffcb28`; corrected in `0eda1b5`)
- **AI prompt (summary):** Give the manual Network-panel check (T15); draft the verification evidence and manual steps (T16).
- **AI output (excerpt):** "run `npm run build` then `npm run preview`, open `http://localhost:4173`"; evidence §3: "Setup used: `npm run build` → `npm run preview` (production bundle, `localhost:4173`)".
- **Why it is wrong:** `package.json` has no `preview` script (README already stated "There is no `preview` package script"); the project's documented command is `npm exec -- vite preview --host 127.0.0.1 --port 4174 --strictPort`. Violates project-rules.md §12 (docs must match the actual code) and §9 (evidence must reflect what was executed).
- **Impact:** Manual verification steps fail as written; the committed evidence file states a setup command that cannot have run, weakening the CLS/Lighthouse evidence.
- **Detection:** Claude Code noticed it while rewriting README.md in T17 (`grep -c '"preview"' package.json` → 0).
- **Fix:** Setup line corrected to `npm exec -- vite preview --port 4173`, which is the command actually used.
- **Verification:** Student confirmed the corrected line matches the executed command; `grep -c '"preview"' package.json` → 0 confirms no preview script exists.
