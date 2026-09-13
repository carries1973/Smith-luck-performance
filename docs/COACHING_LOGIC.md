# Smith Luck Performance — Coaching Logic

## Coaching contract

The app acts as a transparent training coach. It diagnoses training readiness and performance patterns, not medical conditions. Recommendations must remain traceable to Ryan's approved goals and recorded evidence.

## Goal hierarchy

1. Add muscle and maintain or build strength.
2. Improve cardiovascular fitness.
3. Preserve power, balance and leg endurance for snowboarding.
4. Manage fatigue and stress to sustain consistency.
5. Support gradual body-composition improvement without sacrificing performance.

The hierarchy cannot change silently. A material goal change requires Ryan's approval and a dated entry in `DECISIONS.md`.

## Daily diagnosis

Before training, collect:

- sleep quality;
- energy;
- stress;
- soreness;
- motivation;
- pain or problem area and movement impact;
- time available; and
- optional wearable summaries when integrations are approved later.

The recommendation must show the inputs used, the resulting readiness level, the adjustment and the reason. Pain, concerning symptoms and persistent fatigue remain clinician-led.

## Session-level adaptation

- Green: train as programmed unless performance indicates otherwise.
- Yellow: cap effort, trim optional volume and explain the reduction.
- Red: recommend recovery or easy work; continuing the planned session requires an explicit acknowledgement that is stored with the session.
- Time-limited: preserve the primary movement pattern and remove optional work first.

## Set-level evidence

Store every prescribed and completed set with exercise variation, load or assistance, reps or duration, RPE, completion, order and timestamp. Use the latest comparable exposures to suggest whether to progress, repeat or reduce.

Do not recommend a load increase from one top set alone. Consider all prescribed work, technique notes, RPE, readiness, pain flags and recent trend.

## Conjugate lifecycle

- Maintain stable movement-pattern coverage: upper push/pull, squat, hinge, single-leg, trunk, conditioning and recovery.
- Rotate max-effort and dynamic-effort variations on an approved cycle cadence.
- Preserve comparable history by linking each variation to its movement pattern and variation family.
- Review accessory effectiveness and fatigue at the end of each cycle.
- Never rotate exercises merely for novelty.

## Review cadence

- Every session: completion, performance, pain, notes and recovery response.
- Weekly: adherence, total working sets, conditioning exposure and fatigue pattern.
- Every cycle: variation performance, progression, plateaus, exercise tolerance and the next approved block.
- Periodically: confirm that the goal hierarchy still matches Ryan's intent.

## Agent behaviour

An agent may read approved training data, explain patterns, prepare recommendations and help operate the journal. It must not silently rewrite history, change goals, mark sets complete, alter a cycle or publish programming without an attributable user-approved action.

Recommended future agent tools:

- read current goals and constraints;
- get today's recommendation and explanation;
- read readiness and recent workload;
- open, start, pause and resume a session;
- log or correct an individual set with confirmation;
- read comparable previous performance;
- summarize a completed workout;
- propose a cycle change for approval; and
- flag missing or contradictory data.
