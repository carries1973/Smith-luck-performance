# Smith Luck Performance — Data Model

## Status

Version 4 uses browser-local storage only. Supabase is deliberately deferred until the workout UX and record semantics are approved.

## Persistent source of truth

Supabase will ultimately own authenticated user data. GitHub owns source-code and decision history; it must never store workout records, health inputs or secrets.

## Proposed entities

### Profiles

User identity, units, timezone, approved goals, preferences and current status.

### Goals and constraints

Versioned goal hierarchy, training constraints, equipment availability and effective dates.

### Training cycles

Cycle identity, name, dates, status, method, progression intent and approval record.

### Workout templates

Day/sequence position, workout type, cycle, objective, description and ordered template items.

### Exercises

Stable exercise identity, name, movement pattern, variation family, category, equipment and logging mode.

### Workout sessions

Template, date, start/pause/finish timestamps, duration, readiness result, completion status, notes and explicit overrides.

### Session exercises and sets

Exercise order and notes; each set stores prescribed values, actual load/assistance, reps/duration, RPE, completion and timestamp.

### Conditioning intervals

Ordered block, work/recovery type, target and actual duration, target and actual RPE, cadence/resistance, completion and timestamps.

### Recovery sessions

Module, target and actual duration, completion, notes and response.

### Coaching recommendations

Recommendation, evidence inputs, explanation, confidence/limitations, approval state and link to the resulting session or cycle.

## Required safeguards

- Row-level security for every user-owned table.
- No service-role key in the browser or repository.
- Server-side validation for writes.
- Stable identifiers and timestamps with timezone handling.
- Migration and backup strategy before production data is trusted.
- Idempotent saves and conflict handling for intermittent mobile connectivity.
- Export and account-deletion paths.

## Migration requirement

Before switching from local storage, provide an explicit one-time import or a clear reset decision. Never silently discard or duplicate locally stored workout history.
