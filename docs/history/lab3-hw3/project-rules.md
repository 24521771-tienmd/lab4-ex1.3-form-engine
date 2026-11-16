# Project Rules — KRAFTON x PUBG Vietnam Championship & Airdrop Arena

## 1. Project Scope

This repository contains the Lab 3 implementation of the KRAFTON x PUBG Vietnam Championship & Airdrop Arena assignment.

The implementation must evolve relevant concepts from the corresponding Lab 2 HW3 project while introducing the React hook, optimistic claim flow, PUBG Vietnam leaderboard, and AI failure audit required by Lab 3.

The Lab 2 source repository is reference-only. Do not modify, commit, or push changes to that repository as part of this project.

## 2. Assignment Requirements

### 2.1 Airdrop Countdown

Implement:

`usePubgAirdropTimer(targetEpochMs, serverOffsetMs = 0)`

Rules:

- Calculate remaining time from the absolute target timestamp.
- Use the formula:

  `Math.max(0, targetEpochMs - (Date.now() + serverOffsetMs))`

- Do not implement the countdown by subtracting one second from previous state.
- Refresh the displayed value using an appropriate browser scheduling mechanism.
- Listen for `visibilitychange` and immediately recalculate when the document becomes visible.
- Clean up animation frames, timers, and event listeners when the hook is no longer active or its dependencies change.
- Handle an expired target without scheduling unnecessary updates.
- Keep the hook independent of PUBG presentation components.

### 2.2 Optimistic Airdrop Claims

Support claims for:

- PVS Grand Finals VIP Tickets.
- G-Coin crates.

Rules:

- Prevent duplicate concurrent claims for the same claim operation using an in-flight `claimId` lock.
- Apply the optimistic stock update before the server response.
- Treat the server response as authoritative.
- Roll back the optimistic stock change when the server returns HTTP 409 Conflict.
- Release the in-flight lock on both success and failure.
- Prevent stale or unrelated responses from overwriting newer state.
- Handle loading, success, conflict, and unexpected failure states explicitly.
- Do not use browser alerts for feedback.
- Do not assume that client-side stock state guarantees inventory consistency.

The claim endpoint, request payload, and response contract must be confirmed from available project requirements or an explicitly documented implementation decision. Do not silently invent a production API contract.

### 2.3 PUBG Vietnam Leaderboard

Support these squad IDs:

- `te`
- `ces`
- `ge`
- `agg`

Support the supplied `PubgVnSquadStanding` contract:

- `squadId`
- `squadName`
- `wwcdCount`
- `placementPts`
- `killPts`

Rules:

- Provide filtering for the supported Vietnamese squads.
- Provide sorting by WWCD count, Placement Points, and Kill Points.
- Keep filtering and sorting deterministic.
- Do not mutate the original standings array.
- Provide a kill-feed filter.
- Handle empty and filtered-out states clearly.
- Keep leaderboard data and presentation logic separate.

### 2.4 Data Contracts

Use the supplied TypeScript contracts as the source of truth:

`DropPhase`:

- `WARMUP`
- `AIRDROP_LIVE`
- `LOOTED_OUT`
- `EXPIRED`

`PubgCrateDrop`:

- `id`
- `title`
- `priceVnd`
- `remainingStock`
- `dropEpochMs`

`PubgVnSquadStanding`:

- `squadId`
- `squadName`
- `wwcdCount`
- `placementPts`
- `killPts`

Preserve the declared field names and types. Do not introduce incompatible aliases without a documented reason.

## 3. React and JavaScript Standards

- Use modern React function components and hooks.
- Do not use class components.
- Do not use `ReactDOM.render`.
- Do not use `defaultProps` for function components.
- Do not use deprecated keyboard properties such as `keyCode`.
- Do not use `alert()`, `confirm()`, or `prompt()` for application feedback.
- Follow the Rules of Hooks.
- Keep effects and event listeners properly cleaned up.
- Avoid unnecessary state duplication.
- Use stable and meaningful keys when rendering collections.
- Keep business logic out of large presentation components.
- Avoid direct mutation of React state or shared input data.
- Validate external data at appropriate boundaries.

## 4. Accessibility and Responsive Design

Target WCAG 2.2 AA.

- Support a viewport width of 375px without horizontal page overflow.
- Use semantic HTML elements.
- Associate form labels with controls using `htmlFor` and `useId` where applicable.
- Ensure keyboard accessibility for interactive controls.
- Provide visible focus indicators.
- Maintain sufficient text and control contrast.
- Do not communicate state using color alone.
- Respect reduced-motion preferences.
- Use accessible names for icon-only controls.
- Use appropriate live-region announcements for important asynchronous claim feedback.
- Verify accessibility with automated checks and manual keyboard review.
- Target Lighthouse Accessibility score of 100.

Avoid unnecessary wrapper elements and deeply nested markup.

## 5. Currency and Formatting

Format Vietnamese Dong using `Intl.NumberFormat` with the `vi-VN` locale and `VND` currency.

Do not manually concatenate currency symbols or use inconsistent number formatting.

## 6. Security and State Integrity

- Never render untrusted content as raw HTML.
- Do not use `dangerouslySetInnerHTML` unless a reviewed and justified requirement exists.
- Do not trust client-side stock values as authoritative inventory.
- Do not allow duplicate in-flight claim operations.
- Ensure optimistic updates can be rolled back safely.
- Avoid leaking secrets or credentials into source control.
- Do not hardcode private tokens or credentials.
- Do not weaken validation merely to make tests pass.

## 7. Testing and Verification

Every meaningful feature must have appropriate tests.

At minimum, verify:

- Countdown calculation before, at, and after the deadline.
- Server clock offset handling.
- Visibility-change resynchronization.
- Countdown cleanup.
- Duplicate claim prevention.
- Optimistic stock update.
- HTTP 409 rollback.
- Claim lock release after success and failure.
- Leaderboard filtering and sorting.
- Kill-feed filtering.
- Empty states and invalid input handling where applicable.

Before committing a task, run the relevant tests and checks available in the repository.

The final verification should include:

- Tests.
- Lint.
- Production build.
- `git diff --check`.
- Responsive review at 375px.
- Accessibility review.

Report actual results. Do not claim a check passed unless it was executed successfully.

## 8. Lab 2 Reuse Policy

The corresponding Lab 2 HW3 repository is a reference for implementation evolution.

Reuse or adapt only relevant concepts:

- Absolute-deadline countdown calculations.
- Lifecycle cleanup patterns.
- Inventory state-integrity principles.
- Vietnamese currency formatting.
- Relevant test-design approaches.

Do not blindly copy the old flash-sale application into the PUBG project.

Do not treat the Lab 2 in-memory inventory manager as an authoritative server inventory system.

Keep both Git repositories independent.

## 9. AI Failure Audit

Maintain `AI_FAILURE_AUDIT.md`.

The audit must document at least three actual AI-generated mistakes discovered during Lab 3 implementation.

For each finding, record:

- Incorrect AI-generated behavior or code.
- Why it was incorrect.
- Impact or risk.
- How the issue was detected or reproduced.
- The correction.
- Evidence that the correction was verified.

Do not copy Lab 2 findings and present them as new Lab 3 failures.

Do not invent failures or claim that an issue was reproduced when it was only hypothesized.

## 10. Git Workflow

- Work on the `main` branch unless a different branch is explicitly agreed upon.
- Make at least 10 genuinely atomic commits in this HW3 repository.
- Each commit should represent one coherent and reviewable change.
- Use descriptive commit messages.
- Do not create artificial commits merely to increase the commit count.
- Run `git diff --check` before committing.
- Review staged changes before every commit.
- Never commit `.env`, credentials, build output, or `node_modules`.
- Keep the Lab 2 source repository untouched.

## 11. Decision and Documentation Rules

- Document important implementation decisions.
- Do not invent unspecified backend endpoints or API response contracts.
- Ask for clarification when a requirement cannot be resolved from the assignment or existing project evidence.
- Update task decomposition and audit documentation as implementation progresses.
- Keep documentation consistent with the actual code and test results.
