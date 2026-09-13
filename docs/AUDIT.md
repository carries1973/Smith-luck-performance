# Smith Luck Performance — Version 4 Audit

Audit date: 2026-09-13  
Scope: functionality, usability, maintainability and readiness for daily use  
Change boundary: no application behaviour or visual design changed

## Executive finding

Version 4 is a strong interactive prototype and can be used today for trial workouts on one device. It is not yet a dependable live coaching app. The highest risks are browser-only data, static programming, incomplete agent capabilities and insufficient real-device/automated testing.

The established Smith Luck design is coherent and should be preserved.

## Verified strengths

- Production build completes successfully.
- Lint completes successfully.
- The selected and displayed workout share one `selectedId` source.
- All seven days are present with correct identities and Day 4 recovery.
- Strength exercises generate one logging row per prescribed set.
- Each set has weight, reps, RPE and completion controls.
- Exercise notes are attached to the exercise card; workout notes are near completion.
- There is one workout date control and one total workout timer.
- Workout timers pause/resume and drafts can resume after reload on the same browser.
- Each strength exercise has a start/pause/reset/+15-second rest timer.
- Conditioning includes 5-minute warm-up, eight 2-minute hard/2-minute recovery pairs, 3-minute cool-down, targets, actual RPE, cadence/resistance and next-block display.
- Recovery modules accept actual duration and completion.
- Completed, modified and ended-early sessions appear in history.
- Previous comparable performance is surfaced by exercise ID.
- Readiness can trim optional volume and cap effort.
- Home-gym constraints and a medical-boundary statement are visible.
- Responsive CSS exists for tablet and narrow iPhone widths.

## Priority 0 — Required before trusting the app with training history

### P0.1 Browser-only persistence

History and drafts live only in `localStorage`. Clearing site data, changing browser/device, reinstalling, or storage failure can remove the journal. There is no backup, export, account synchronization or conflict handling.

**Required outcome:** authenticated Supabase persistence with row-level security, safe migration and a recoverable local/offline strategy—after UX approval.

### P0.2 Programming is static

The app displays only Cycle 1. Workouts, variations and the dashboard cycle medallion are hard-coded. No cycle state, rotation schedule, deload/recovery review or approved next-block workflow exists.

**Required outcome:** versioned training cycles and variation families that preserve movement patterns and historical comparability.

### P0.3 Coaching is descriptive, not agentic

The current WebMCP surface exposes only `open_workout`. An agent cannot read current goals/history/readiness, log a set, resume a timer, summarize training or propose an attributable cycle adjustment.

**Required outcome:** safe read tools first, followed by confirmation-gated write tools and a durable coaching-recommendation record.

### P0.4 No complete real-device test record

Build and lint pass, but there is no repeatable end-to-end test suite or signed-off iPhone workout run covering every day, reload, backgrounding and completion state.

**Required outcome:** automated critical-flow tests plus a guided iPhone acceptance checklist.

## Priority 1 — Required for reliable daily use

### P1.1 Readiness inputs can be accepted at defaults

All scales start at 3/5, so readiness can be confirmed without Ryan intentionally answering each question. This weakens the diagnosis.

**Required outcome:** explicit unanswered states or a clear “same as entered” confirmation model.

### P1.2 Readiness logic is too coarse

The score uses one fixed threshold model and does not consider recent workload, consecutive sessions, conditioning load, session outcomes or longitudinal fatigue. A red-session override is not stored as an explicit decision.

**Required outcome:** versioned rules, explainable factors and stored override acknowledgement/reason.

### P1.3 Set validation and logging modes are incomplete

Inputs accept unrestricted text and completed strength sets require reps and RPE but not a load or explicit bodyweight/assistance value. Timed holds, bodyweight work, band assistance and cycling need distinct logging semantics.

**Required outcome:** exercise-specific logging modes, validation, units and intentional zero/bodyweight/assistance handling.

### P1.4 Rest timers are not persistent

The total workout and conditioning timers are part of the saved draft, but each exercise rest timer exists only inside its rendered component. Navigation, reload or component remount resets it.

**Required outcome:** persist the active rest timer in the workout draft and define behaviour when the phone sleeps.

### P1.5 Mobile timer alerts are not guaranteed

Vibration and Web Audio depend on browser support and active-page restrictions. They should not be treated as dependable when an iPhone is locked or the app is backgrounded.

**Required outcome:** test foreground/background/lock-screen behaviour and provide a visible fallback; evaluate wake-lock or notification capabilities without promising unsupported behaviour.

### P1.6 Navigation is internal state only

Dashboard, workout, coach, equipment and history are not routes. Browser back/deep links do not represent app state, and reload returns to the dashboard even when a workout draft exists.

**Required outcome:** define route/resume behaviour appropriate for an installed phone app.

### P1.7 History cannot be corrected or exported

Sessions can be viewed and repeated but not edited, annotated after completion, deleted with safeguards or exported.

**Required outcome:** correction history, safe deletion, export and clear auditability.

## Priority 2 — Maintainability and clarity

### P2.1 The shared system is monolithic

The app conceptually shares components, but nearly all data and UI live in one `app/page.tsx` file of roughly 2,500 lines. This increases regression risk when cycles, persistence and agent tools are added.

**Required outcome:** extract typed programming data and shared components without changing the approved appearance.

### P2.2 The logo remains a placeholder construction

The visible shamrock is generated with CSS rather than using the approved original Smith Luck logo asset.

**Required outcome:** add the approved logo file and replace the placeholder without changing the surrounding brand system.

### P2.3 Dashboard recommendation is sequence-based

“Today’s recommendation” is the day after the latest locally stored session, or the weekday number when history is empty. It does not diagnose readiness before recommending, handle missed days or explain schedule changes.

**Required outcome:** separate scheduled/next session from readiness-adjusted recommendation and display the reason.

### P2.4 Previous-performance comparison will weaken under rotation

History lookup uses exact exercise IDs. A new conjugate variation will not automatically connect to its movement-pattern or variation-family history.

**Required outcome:** stable exercise identity plus movement-pattern and variation-family relationships.

### P2.5 Hosting architecture must be decided deliberately

The baseline is a Sites/Vinext/Cloudflare project. Moving production hosting to Vercel is not a simple account connection and should not occur during UX stabilization.

**Required outcome:** keep the working Sites deployment during validation, then approve whether Sites or Vercel is the long-term host before production data integration.

## Recommended implementation order

1. Run the iPhone acceptance checklist on all seven days using test entries.
2. Approve the P0/P1 findings and exact record semantics.
3. Refactor into shared modules with characterization tests; preserve the UI.
4. Fix readiness, logging validation, rest-timer persistence and navigation/resume behaviour.
5. Re-run iPhone acceptance testing.
6. Approve and implement Supabase schema/security/migration.
7. Add agent read tools, then confirmation-gated write tools.
8. Implement cycle rotation and coaching reviews using persistent evidence.

## Approval gate

No Priority 0 or Priority 1 application change should begin until Ryan approves this audit and the first implementation slice. Supabase remains deferred until the workout experience is accepted.
