# CLAUDE.md — Working Agreement for Claude Code (Lab 4 · Ex1.1)

You are assisting a student on **Lab 4 Exercise 1.1**. The student is accountable for every line; you generate, they verify.

## Read first, every session

1. `project-rules.md` — binding rules (stack pins, banned APIs, 4-stage loop, Git policy).
2. `TASK_DECOMPOSITION.md` — the ordered task list. Each task = exactly one commit with a pre-written message.
3. `AI_FAILURE_AUDIT.md` — known AI mistakes in this repo; do not repeat them.

## Protocol for every prompt

The student's prompt names **one task ID** (e.g. `T07`). Then:

1. **Restate** the task in 2–3 lines and list the exact files you will create/modify. If anything conflicts with `project-rules.md` or earlier tasks, stop and ask.
2. **Implement only that task.** Do not touch files outside its scope, do not start the next task, do not "improve" unrelated code.
3. **Verify** with the commands the task's *Done when* column requires (normally `npm test`, `npm run lint`, `npm run build`, `git diff --check`). For a RED task, run the new tests and show they fail for the expected reason.
4. **Tick** the task's checkbox `- [ ]` → `- [x]` in `TASK_DECOMPOSITION.md`.
5. **Commit**: `git add <explicit paths>` → show `git diff --cached --stat` → `git commit -m "<exact message from the task table>"`.
6. **Report**: files changed, commands run with their real output summary, the commit hash (`git log -1 --oneline`), and any *manual check* the student must do in the browser.
7. **Stop.** Wait for the next prompt.

## Hard limits

- Never `git push`, never rewrite history (`rebase`, `reset --hard`, `commit --amend`) unless the student explicitly asks.
- Never write outside this folder. You may only *read* `../_lab4-kit/`.
- Never install a package version that is not pinned in `project-rules.md` §3 (`react-router@^7`, `mongoose@^8`, …).
- Never claim a check passed unless you ran it in this session. Manual browser checks belong to the student.
- Never invent AI failures for the audit; if you notice that your own earlier output was wrong, say so and propose an audit entry for the student to confirm.

## Environment

- Windows 11, VS Code terminal = **PowerShell**. Use `npm` commands (they work in PowerShell); prefer cross-platform Node scripts over shell-specific syntax inside `package.json`.
- Node.js 26.x, npm workspaces available.
