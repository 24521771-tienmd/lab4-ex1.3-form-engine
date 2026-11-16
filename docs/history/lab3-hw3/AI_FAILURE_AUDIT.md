# AI Failure Audit — Lab 3

This audit records three actual AI-generated mistakes found and corrected
during this Lab 3 project. These are implementation findings, not hypothetical
risks, and are specific to Lab 3.

## A-01 — Incorrect TypeScript squad ID contract

- **Finding ID and title:** A-01 — Incorrect TypeScript squad ID contract
- **Context:** Initial implementation of
  `src/contracts/pubg-vn-arena-contract.ts`.
- **Incorrect AI-generated result:** The initial contract used `squadId:
  string` instead of the assignment's four-value literal union.
- **Why it was incorrect:** A general string weakened the supplied contract
  and allowed unsupported squad identifiers at the type level.
- **Impact:** Type-level consumers could accept squad IDs outside `te`, `ces`,
  `ge`, and `agg`.
- **Detection:** Code review against the assignment's supplied contract.
- **Correction:** Changed `squadId` to the exact literal union
  `'te' | 'ces' | 'ge' | 'agg'`.
- **Verification evidence:** The current contract contains the corrected
  literal union. This finding was verified by contract review; no separate
  TypeScript compile test is claimed.
- **Related source files and commit:** `src/contracts/pubg-vn-arena-contract.ts`;
  commit `3d1a3e0 chore(setup): scaffold PUBG Vietnam arena app`.

## A-02 — Claim observer exception could interrupt state transitions

- **Finding ID and title:** A-02 — Claim observer exception could interrupt
  state transitions
- **Context:** `src/utils/airdropClaimController.js`.
- **Incorrect AI-generated result:** The initial implementation allowed an
  exception from `onStateChange` to interrupt claim transitions.
- **Why it was incorrect:** Observer code is external to the controller's
  state transition and should not prevent the request flow or lock settlement.
- **Impact:** An observer exception after optimistic stock and lock state had
  changed could leave the claim flow inconsistent or prevent settlement.
- **Detection:** Review of the claim controller's error paths.
- **Correction:** Isolated observer exceptions in `publishState()` so they are
  reported without interrupting controller transitions.
- **Verification evidence:** Four regression tests cover observer exceptions
  during pending, success, conflict, and error notifications in
  `tests/airdropClaimController.test.js`.
- **Related source files and commit:** `src/utils/airdropClaimController.js`,
  `tests/airdropClaimController.test.js`; commit `7cb64e4 feat(claim): add
  optimistic airdrop claim controller`.

## A-03 — Future timestamps in illustrative kill-feed data

- **Finding ID and title:** A-03 — Future timestamps in illustrative kill-feed
  data
- **Context:** Initial illustrative fixtures in
  `src/data/killFeedEvents.js`.
- **Incorrect AI-generated result:** Six demo events were assigned timestamps
  later than the browser's current date at discovery.
- **Why it was incorrect:** Future event timestamps made the sample chronology
  misleading, even though the feed was labeled illustrative.
- **Impact:** The displayed sample events could appear chronologically
  impossible and reduce the credibility of the demonstration.
- **Detection:** The WP-06A read-only integration audit compared fixture
  timestamps with the browser's current date.
- **Correction:** Replaced the timestamps with fixed historical timestamps,
  retaining the six events and their content.
- **Verification evidence:** `tests/filterKillFeedEvents.test.js` checks that
  every fixture timestamp is earlier than the fixed November 12, 2026
  reference epoch. The project test suite subsequently passed with this test.
- **Related source files and commit:** `src/data/killFeedEvents.js`,
  `tests/filterKillFeedEvents.test.js`; commit `e0c09cf feat(integration): add
  demo countdown and fix kill feed timestamps`.

No additional hypothetical risks are presented as AI failures in this audit.
