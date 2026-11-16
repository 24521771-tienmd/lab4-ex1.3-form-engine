# Task Decomposition — KRAFTON x PUBG Vietnam Championship & Airdrop Arena

## 1. Project Goal

Evolve the corresponding Lab 2 HW3 flash-sale implementation into a PUBG Vietnam Championship and Airdrop Arena experience.

The Lab 3 implementation must provide:

1. An absolute-deadline airdrop countdown React hook.
2. Optimistic claims for VIP Tickets and G-Coin crates.
3. A PUBG Vietnam squad leaderboard with filtering and sorting.
4. A kill-feed filter.
5. Responsive and accessible UI.
6. An AI failure audit containing at least three actual AI mistakes found and fixed during implementation.

## 2. Source Reuse Strategy

Reference repository:

`hw3-high-concurrency-flash-sale-e-commerce-engine`

The reference repository is not part of this repository and must remain unchanged.

| Lab 2 source | Lab 3 treatment | Reason |
|---|---|---|
| `src/utils/countdown.js` | Adapt relevant calculation | Preserve absolute-deadline semantics |
| `src/components/CountdownTimer.jsx` | Redesign around a custom hook | Add server offset and visibility resynchronization |
| `src/inventory/inventory-manager.js` | Reuse state-integrity concepts only | Lab 3 requires HTTP conflict handling |
| `src/hooks/useFlashSaleInventory.js` | Redesign claim state management | Introduce optimistic updates and claim locks |
| `src/data/products.js` | Replace with PUBG drop data | Different domain and contract |
| `formatVND()` | Reuse or adapt | Keep consistent Vietnamese currency formatting |
| Existing tests | Use as test-design reference | Add Lab 3-specific behavior and regression tests |
| Existing UI and CSS | Selectively reference | Build the PUBG championship experience |

## 3. Work Packages

### WP-01 — Repository and Project Foundation

Tasks:

- [x] Confirm repository metadata and branch.
- [x] Inspect the existing Lab 2 package configuration and tooling.
- [x] Establish the Lab 3 project structure.
- [x] Define data contracts and domain boundaries.
- [x] Configure or preserve lint, test, and build scripts.
- [ ] Confirm the claim API contract before integrating a real endpoint.

Status note: No production claim endpoint is integrated. Its endpoint, request,
and response contract remain unresolved, so API confirmation is intentionally
unchecked.

Acceptance criteria:

- The repository has a clear project structure.
- Existing tooling runs successfully.
- Lab 2 remains untouched.
- Project rules and task decomposition are committed.

### WP-02 — PUBG Domain Contracts and Data

Tasks:

- [x] Define `DropPhase`.
- [x] Define `PubgCrateDrop`.
- [x] Define `PubgVnSquadStanding`.
- [x] Add the four supported squad identities.
- [x] Add representative drop and leaderboard data.
- [ ] Add validation or tests for domain data where appropriate.

Acceptance criteria:

- Contract names and fields match the assignment.
- The four squad IDs are represented correctly.
- UI components do not contain duplicated domain data.

### WP-03 — Airdrop Timer Hook

Tasks:

- [x] Implement `usePubgAirdropTimer(targetEpochMs, serverOffsetMs = 0)`.
- [x] Calculate remaining time from the absolute deadline.
- [x] Handle zero and expired countdown states.
- [x] Refresh the countdown using an appropriate scheduling mechanism.
- [x] Resynchronize on `visibilitychange`.
- [x] Clean up scheduled callbacks and event listeners.
- [x] Add unit tests for deadline and offset behavior.
- [x] Add tests for visibility resynchronization and cleanup where the test environment supports them.

Acceptance criteria:

- The hook follows the required absolute-time formula.
- Delayed callbacks do not accumulate countdown drift.
- Returning to a visible tab immediately recalculates remaining time.
- No unnecessary callbacks remain after cleanup or expiry.

### WP-04 — Optimistic Claim State Management

Tasks:

- [x] Define claim state and result contracts.
- [x] Define the in-flight `claimId` lock behavior.
- [x] Implement the optimistic stock decrement.
- [x] Implement success handling.
- [x] Implement HTTP 409 rollback.
- [x] Handle unexpected request failures.
- [x] Release locks after every completed request.
- [x] Prevent stale responses from overwriting newer state.
- [x] Add tests for success, conflict, duplicate clicks, and failure handling.

Acceptance criteria:

- Duplicate concurrent claims are prevented.
- Stock is updated optimistically.
- HTTP 409 restores the previous stock state correctly.
- The lock is released after success and failure.
- Server-confirmed state remains authoritative.

### WP-05 — PUBG Drop and Claim UI

Tasks:

- [x] Build the VIP Ticket presentation.
- [x] Build the G-Coin crate presentation.
- [x] Display prices using Vietnamese currency formatting.
- [x] Display remaining stock and drop phase.
- [x] Connect claim controls to the claim state layer.
- [x] Display accessible pending, success, conflict, and error feedback.
- [ ] Verify disabled and loading states.

Acceptance criteria:

- Both claimable item types are represented.
- Prices use `Intl.NumberFormat('vi-VN')` with VND.
- Claim controls prevent duplicate submissions.
- Feedback is understandable without relying on color alone.

### WP-06 — PUBG Vietnam Leaderboard

Tasks:

- [x] Implement the squad standings data model.
- [x] Add filtering for `te`, `ces`, `ge`, and `agg`.
- [x] Add WWCD sorting.
- [x] Add Placement Points sorting.
- [x] Add Kill Points sorting.
- [x] Ensure sorting does not mutate source data.
- [x] Add empty-state behavior.
- [x] Add unit tests for filtering and sorting.

Acceptance criteria:

- All four squads can be displayed and filtered.
- Each required sorting criterion works deterministically.
- The source standings array remains unchanged.

### WP-07 — Kill Feed

Tasks:

- [x] Define the kill-feed event shape based on available assignment requirements.
- [x] Render representative kill-feed events.
- [x] Implement the required filter.
- [x] Handle empty filtered results.
- [x] Add tests for filter behavior.

Acceptance criteria:

- The kill feed displays relevant events.
- Filtering produces predictable results.
- No unsupported event contract is silently assumed.

### WP-08 — Responsive UI and Accessibility

Tasks:

- [x] Build the championship and airdrop page layout.
- [x] Review semantic HTML structure.
- [x] Associate labels and inputs using `htmlFor` and `useId`.
- [x] Verify keyboard navigation.
- [x] Add visible focus states.
- [ ] Verify color contrast.
- [x] Support reduced motion.
- [x] Test at 375px viewport width.
- [x] Eliminate horizontal page overflow.
- [ ] Run Lighthouse accessibility review.

Acceptance criteria:

- No horizontal overflow at 375px.
- Interactive elements are keyboard accessible.
- Labels and accessible names are correctly associated.
- Target Lighthouse Accessibility score is 100.

### WP-09 — Integration and Regression Testing

Tasks:

- [x] Integrate countdown, drops, claims, leaderboard, and kill feed.
- [x] Test interactions between UI and state.
- [x] Test error and empty states.
- [x] Run the complete test suite.
- [x] Run lint and production build.
- [ ] Review console errors and warnings.
- [x] Review responsive behavior.

Acceptance criteria:

- All required features work together.
- No known regression remains.
- Final verification results are recorded accurately.

### WP-10 — AI Failure Audit and Final Documentation

Tasks:

- [x] Record actual AI mistakes discovered during implementation.
- [x] Reproduce or otherwise verify each finding.
- [x] Document the impact and correction.
- [x] Record evidence from tests or code review.
- [x] Ensure at least three genuine Lab 3 findings are documented.
- [ ] Review README and project instructions.
- [x] Review Git history for atomic commits.

Acceptance criteria:

- `AI_FAILURE_AUDIT.md` contains at least three actual Lab 3 AI failures.
- Each finding includes detection, correction, and verification evidence.
- Documentation reflects the final implementation.

Status note: README review remains outstanding because no README was found in
the repository. Lighthouse and complete contrast verification remain
outstanding; sample contrast ratios are not a complete audit.

## 4. Proposed Atomic Commit Plan

The following is a planning baseline. A commit should be created only after its corresponding change is implemented and verified. Split or adjust tasks when implementation evidence warrants it.

1. `docs(spec): define PUBG airdrop arena requirements`
2. `docs(plan): add Lab 3 task decomposition`
3. `chore(project): establish Lab 3 application structure`
4. `feat(contracts): define PUBG drop and squad contracts`
5. `feat(data): add PUBG drop and squad fixtures`
6. `feat(timer): implement absolute-time airdrop hook`
7. `test(timer): cover deadline and server offset behavior`
8. `feat(timer): resync countdown on visibility changes`
9. `feat(claim): define claim state and request contracts`
10. `feat(claim): implement optimistic stock updates`
11. `fix(claim): rollback stock on HTTP 409 conflicts`
12. `test(claim): cover duplicate and failed claim requests`
13. `feat(leaderboard): implement squad filtering and sorting`
14. `test(leaderboard): cover standings filters and sort modes`
15. `feat(kill-feed): implement event filtering`
16. `feat(ui): build PUBG airdrop and championship interface`
17. `feat(a11y): improve responsive and accessible interactions`
18. `test(integration): verify complete arena workflows`
19. `docs(audit): document verified Lab 3 AI failures`
20. `docs(readme): document setup and verification`

The final history must contain at least 10 genuinely atomic commits. The proposed list is not a requirement to create artificial or empty commits.

## 5. Implementation Order

Recommended order:

1. Foundation and contracts.
2. Timer hook and timer tests.
3. Claim state model and claim tests.
4. Leaderboard and kill-feed logic.
5. UI integration.
6. Responsive and accessibility improvements.
7. Integration testing.
8. AI failure audit and final documentation.

Do not begin backend integration until the claim API contract is known or explicitly agreed upon.

## 6. Final Verification Checklist

- [ ] All assignment requirements implemented.
- [x] Countdown uses absolute time and server offset.
- [x] Visibility resynchronization works.
- [x] Claim duplicate prevention works.
- [x] HTTP 409 rollback works.
- [x] VIP Ticket and G-Coin claims are supported.
- [x] Leaderboard filters and sorts all four squads.
- [x] Kill-feed filter works.
- [x] VND formatting uses `Intl.NumberFormat`.
- [x] Responsive review at 375px passes.
- [x] No horizontal overflow.
- [ ] Accessibility review completed.
- [x] Tests pass.
- [x] Lint passes.
- [x] Production build passes.
- [x] `git diff --check` passes.
- [x] At least three genuine Lab 3 AI failures are documented.
- [x] At least 10 atomic commits exist in this repository.
- [x] Lab 2 source repository remains unchanged.
