# Smith Luck Performance — Roadmap

## Working method

- `main` is the protected stable baseline.
- Development occurs on `development` or a short-lived branch from it.
- Changes reach `main` through an reviewed pull request.
- Do not claim completion until the implementation and relevant workflow are verified.

## Phase 0 — Intent and baseline

- [x] Preserve Sites version 4 in GitHub.
- [x] Create the `development` branch.
- [x] Protect `main` with an active ruleset.
- [x] Record product, brand, coaching, equipment and data rules.

## Phase 1 — No-change audit

- [x] Inspect version 4 source structure and behaviour.
- [x] Confirm a clean production build and lint result.
- [ ] Complete guided real-device testing on Ryan's iPhone.
- [ ] Approve the prioritized audit findings.

## Phase 2 — Stabilize the workout experience

- Split the monolithic page into shared components and programming data without changing the established design.
- Correct validated usability, validation, timer and navigation issues.
- Add automated tests for day identity, prescribed set counts, persistence, timers and completion.
- Complete every workout-day test on iPhone.

## Phase 3 — Durable accounts and data

- Confirm the production hosting choice.
- Design and approve the Supabase schema and row-level security.
- Connect authenticated profiles and persistent sessions.
- Add safe local-to-cloud migration and offline/retry behaviour.
- Verify cross-device history and incomplete-session recovery.

## Phase 4 — Coaching lifecycle

- Store versioned goals, constraints, cycles and variation families.
- Build explainable daily, weekly and cycle reviews.
- Add agent tools with explicit confirmation for meaningful writes.
- Integrate wearable summaries only with separate consent and reliable data access.

## Phase 5 — Production readiness

- Complete privacy, security, backup and restore tests.
- Add monitoring and recoverable error states.
- Test installed iPhone/PWA behaviour, background timers and updates.
- Release only after Ryan approves the end-to-end workflow.
