# Smith Luck Performance — UI/UX repair acceptance plan

Status: implementation pending. This document is a tracked specification, not a claim that the features work.

## Work sequence
1. Standardize all 7 workout screens and fix known duplicate calendar, wrong day label, inconsistent set counts, interval timing/RPE and notes placement defects.
2. Implement timer alerts.
3. Implement unilateral set tracking.
4. Implement previous session summaries and exact-exercise history.
5. Test on iPhone installed PWA, including reload and resume.
6. Only after user approval, design and integrate Supabase.

## Timer alerts
- Rest and cycling interval countdowns must alert once at zero: visible status, optional sound, vibration when supported.
- Offer sound on/off; test iPhone Safari/Home Screen foreground and background separately. Never promise locked-screen alerts without validation.
- Pause/resume/reset must not duplicate or lose alerts.

## Bilateral/unilateral logging
- Keep bilateral movements as one set entry, with an explicit weight-unit convention (total/per-hand).
- Unilateral exercises store independent left/right weight, reps, RPE, done flags **per set**.
- Applicable current exercises include one-arm DB row, Bulgarian split squat, reverse lunge, single-leg RDL, alternating curl; confirm any other side-specific movement.
- Keep existing journal data readable when extending the model. Ensure session history includes both sides.

## Previous results
- On opening a workout, show a collapsible last completed comparable training-day summary with date, duration, sets, notes.
- On each exercise card show latest exact-exercise result with per-set weight/reps/RPE, left/right where applicable.
- Distinguish identical exercise from conjugate variation. Show an honest empty state if no prior session exists.
- Source all results from persisted sessions, not placeholder values.

## Definition of done
- Test days 1–7, all strength exercise cards, cycling work/rest transitions, recovery logging, and date navigation.
- Test separate side logging, reloading, saved session history and accurate prior comparisons.
- Verify accessible mobile layouts and no duplicate calendars or missing timers.
- Record evidence of testing before merging into main.
