"use client";

/* Timers and local-device hydration intentionally use the current clock and client effects. */
/* eslint-disable react-hooks/purity, react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Dumbbell,
  Flame,
  Gauge,
  HeartPulse,
  History,
  Home,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Snowflake,
  Target,
  TimerReset,
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

type Exercise = {
  id: string;
  name: string;
  type: string;
  sets: number;
  reps: string;
  rpe: string;
  rest: number;
  note: string;
  unilateral?: boolean;
};
type RecoveryModule = {
  id: string;
  name: string;
  duration: string;
  note: string;
  icon: "heat" | "cold" | "mobility" | "breath" | "walk";
};
type WorkoutDay = {
  id: number;
  name: string;
  type: "strength" | "conditioning" | "recovery";
  cycle: string;
  objective: string;
  description: string;
  exercises?: Exercise[];
  recovery?: RecoveryModule[];
};
type SideEntry = { weight: string; reps: string; rpe: string; done: boolean };
type SetEntry = SideEntry & { left?: SideEntry; right?: SideEntry };
type Readiness = {
  sleep: number;
  energy: number;
  stress: number;
  soreness: number;
  motivation: number;
  time: string;
  pain: boolean;
  painArea: string;
};
type ReadinessResult = "green" | "yellow" | "red" | "unrated";
type ExerciseLog = { sets: SetEntry[]; notes: string };
type ConditioningLog = {
  block: number;
  remaining: number;
  startedAt: number | null;
  running: boolean;
  completed: boolean;
  actualRpe: string;
  cadence: string;
  logs: { name: string; actualRpe: string; cadence: string }[];
};
type WorkoutDraft = {
  dayId: number;
  date: string;
  elapsed: number;
  startedAt: number | null;
  running: boolean;
  updatedAt: number;
  sets: Record<string, SetEntry[]>;
  exerciseNotes: Record<string, string>;
  workoutNotes: string;
  readiness: Readiness;
  readinessConfirmed: boolean;
  recoveryDurations: Record<string, string>;
  recoveryCompleted: Record<string, boolean>;
  conditioning: ConditioningLog;
};
type CompletionStatus = "complete" | "modified" | "ended-early";
type SessionLog = {
  id: string;
  dayId: number;
  name: string;
  date: string;
  duration: number;
  completedAt: string;
  readiness: ReadinessResult;
  readinessDetails?: Readiness;
  completionStatus?: CompletionStatus;
  exercises: Record<string, ExerciseLog>;
  workoutNotes: string;
  recoveryDurations: Record<string, string>;
  recoveryCompleted: Record<string, boolean>;
  conditioning?: ConditioningLog;
};
type View = "dashboard" | "workout" | "coach" | "equipment" | "history";

const workoutDays: WorkoutDay[] = [
  {
    id: 1,
    name: "Upper Strength",
    type: "strength",
    cycle: "Cycle 1 · Max Effort Upper",
    objective: "Strength + hypertrophy",
    description:
      "Build the primary push and pull, then add balanced upper-body volume.",
    exercises: [
      {
        id: "bench",
        name: "Barbell Bench Press",
        type: "Max effort push",
        sets: 4,
        reps: "4–6",
        rpe: "8",
        rest: 180,
        note: "Leave one clean rep in reserve. Maintain a firm pause on the chest.",
      },
      {
        id: "row",
        unilateral: true,
        name: "One-arm Dumbbell Row",
        type: "Strength pull",
        sets: 4,
        reps: "6–8 / side",
        rpe: "8",
        rest: 120,
        note: "Brace against the bench and finish each rep at the hip.",
      },
      {
        id: "incline",
        name: "Incline Dumbbell Press",
        type: "Hypertrophy push",
        sets: 3,
        reps: "8–10",
        rpe: "8",
        rest: 90,
        note: "Pair with chest-supported rows as a controlled superset.",
      },
      {
        id: "chest-row",
        name: "Chest-supported Dumbbell Row",
        type: "Hypertrophy pull",
        sets: 3,
        reps: "8–10",
        rpe: "8",
        rest: 90,
        note: "Keep the chest fixed and squeeze for one count.",
      },
      {
        id: "lateral",
        name: "Dumbbell Lateral Raise",
        type: "Accessory",
        sets: 3,
        reps: "12–15",
        rpe: "8",
        rest: 60,
        note: "Controlled tempo; stop before the traps take over.",
      },
      {
        id: "triceps",
        name: "Cable or Band Triceps Pressdown",
        type: "Accessory",
        sets: 3,
        reps: "12–15",
        rpe: "8",
        rest: 60,
        note: "Use a full lockout without shoulder movement.",
      },
    ],
  },
  {
    id: 2,
    name: "Lower Strength",
    type: "strength",
    cycle: "Cycle 1 · Max Effort Lower",
    objective: "Strength + structural balance",
    description:
      "Develop squat strength, posterior-chain capacity and single-leg control.",
    exercises: [
      {
        id: "squat",
        name: "Back Squat",
        type: "Max effort lower",
        sets: 4,
        reps: "3–5",
        rpe: "8",
        rest: 180,
        note: "Use a controlled descent and stop the set if bar speed drops sharply.",
      },
      {
        id: "rdl",
        name: "Barbell Romanian Deadlift",
        type: "Strength hinge",
        sets: 4,
        reps: "6–8",
        rpe: "8",
        rest: 150,
        note: "Keep the bar close and finish with the glutes, not the lower back.",
      },
      {
        id: "split-squat",
        unilateral: true,
        name: "Bulgarian Split Squat",
        type: "Single-leg",
        sets: 3,
        reps: "8 / side",
        rpe: "8",
        rest: 90,
        note: "Use dumbbells and a stable bench; control the bottom position.",
      },
      {
        id: "hip-thrust",
        name: "Barbell Hip Thrust",
        type: "Posterior chain",
        sets: 3,
        reps: "8–10",
        rpe: "8",
        rest: 90,
        note: "Pause at lockout without overextending the lower back.",
      },
      {
        id: "calf",
        name: "Standing Calf Raise",
        type: "Accessory",
        sets: 3,
        reps: "12–15",
        rpe: "8",
        rest: 60,
        note: "Use a full stretch and a deliberate peak contraction.",
      },
      {
        id: "dead-bug",
        name: "Dead Bug",
        type: "Trunk",
        sets: 3,
        reps: "8 / side",
        rpe: "7",
        rest: 60,
        note: "Keep the lower back gently pressed into the floor.",
      },
    ],
  },
  {
    id: 3,
    name: "Indoor Cycling + Conditioning",
    type: "conditioning",
    cycle: "Cycle 1 · Aerobic Power",
    objective: "Cardiovascular fitness",
    description:
      "Eight controlled work intervals with complete timing and clear effort targets.",
  },
  {
    id: 4,
    name: "Recovery",
    type: "recovery",
    cycle: "Cycle 1 · Restore",
    objective: "Reduce fatigue + improve readiness",
    description:
      "A deliberate recovery day placed early enough to support the dynamic sessions.",
    recovery: [
      {
        id: "sauna",
        name: "Far-infrared Sauna",
        duration: "45–60 min",
        note: "Hydrate before and after. Keep the session comfortable, not competitive.",
        icon: "heat",
      },
      {
        id: "cold",
        name: "Cold Plunge",
        duration: "2–4 min",
        note: "Use after sauna with controlled nasal breathing. Exit if you feel unwell.",
        icon: "cold",
      },
      {
        id: "mobility",
        name: "Mobility Flow",
        duration: "12–15 min",
        note: "Hips, thoracic spine, shoulders and ankles. Move slowly through comfortable ranges.",
        icon: "mobility",
      },
      {
        id: "breath",
        name: "Breath Work",
        duration: "5 min",
        note: "Longer exhales: inhale 4 seconds, exhale 6 seconds.",
        icon: "breath",
      },
    ],
  },
  {
    id: 5,
    name: "Upper Dynamic / Hypertrophy",
    type: "strength",
    cycle: "Cycle 1 · Dynamic Effort Upper",
    objective: "Speed + muscle",
    description:
      "Fast, technically crisp pressing followed by upper-body hypertrophy work.",
    exercises: [
      {
        id: "speed-bench",
        name: "Speed Bench Press",
        type: "Dynamic effort",
        sets: 8,
        reps: "3",
        rpe: "6–7",
        rest: 60,
        note: "Use a load that moves fast. Reset fully between repetitions.",
      },
      {
        id: "pullup",
        name: "Pull-up or Band-assisted Pull-up",
        type: "Vertical pull",
        sets: 4,
        reps: "6–10",
        rpe: "8",
        rest: 120,
        note: "Choose the variation that keeps every rep smooth.",
      },
      {
        id: "db-press",
        name: "Dumbbell Overhead Press",
        type: "Hypertrophy push",
        sets: 3,
        reps: "8–10",
        rpe: "8",
        rest: 90,
        note: "Keep ribs stacked and avoid leaning back.",
      },
      {
        id: "band-row",
        name: "Seated Cable or Band Row",
        type: "Hypertrophy pull",
        sets: 3,
        reps: "10–12",
        rpe: "8",
        rest: 75,
        note: "Pause with elbows behind the body.",
      },
      {
        id: "rear-delt",
        name: "Rear-delt Dumbbell Fly",
        type: "Accessory",
        sets: 3,
        reps: "12–15",
        rpe: "8",
        rest: 60,
        note: "Lead with the elbows and keep the neck relaxed.",
      },
      {
        id: "curl",
        unilateral: true,
        name: "Alternating Dumbbell Curl",
        type: "Accessory",
        sets: 3,
        reps: "10–12",
        rpe: "8",
        rest: 60,
        note: "No torso swing; lower under control.",
      },
    ],
  },
  {
    id: 6,
    name: "Lower Dynamic / Hypertrophy",
    type: "strength",
    cycle: "Cycle 1 · Dynamic Effort Lower",
    objective: "Power + snowboard durability",
    description:
      "Explosive lower-body work, muscle-building volume and athletic single-leg control.",
    exercises: [
      {
        id: "speed-squat",
        name: "Speed Squat to Bench",
        type: "Dynamic effort",
        sets: 8,
        reps: "2",
        rpe: "6–7",
        rest: 60,
        note: "Use the stable bench as the depth target. Drive up fast while keeping every rep technically identical.",
      },
      {
        id: "db-rdl",
        name: "Dumbbell Romanian Deadlift",
        type: "Hypertrophy hinge",
        sets: 4,
        reps: "8",
        rpe: "8",
        rest: 120,
        note: "Own the stretch; keep both dumbbells close to the legs.",
      },
      {
        id: "reverse-lunge",
        unilateral: true,
        name: "Dumbbell Reverse Lunge",
        type: "Single-leg",
        sets: 3,
        reps: "8 / side",
        rpe: "8",
        rest: 90,
        note: "Step back quietly and drive through the whole front foot.",
      },
      {
        id: "single-rdl",
        unilateral: true,
        name: "Single-leg Romanian Deadlift",
        type: "Balance + posterior chain",
        sets: 3,
        reps: "8 / side",
        rpe: "7–8",
        rest: 75,
        note: "Use one dumbbell and light support if balance limits the target muscle.",
      },
      {
        id: "wall-sit",
        name: "Wall Sit",
        type: "Snowboard capacity",
        sets: 3,
        reps: "30–45 sec",
        rpe: "8",
        rest: 60,
        note: "Stay tall through the torso and maintain even pressure through both feet.",
      },
      {
        id: "bike-easy",
        name: "Easy Indoor Bike",
        type: "Aerobic finish",
        sets: 1,
        reps: "10–15 min",
        rpe: "3–4",
        rest: 0,
        note: "Conversational pace. This is a flush, not another hard interval session.",
      },
    ],
  },
  {
    id: 7,
    name: "Rest / Flexible Recovery",
    type: "recovery",
    cycle: "Cycle 1 · Readiness Choice",
    objective: "Prepare for the next cycle week",
    description:
      "Choose gentle movement or complete rest based on fatigue and readiness.",
    recovery: [
      {
        id: "walk",
        name: "Easy Walk",
        duration: "20–30 min",
        note: "Comfortable pace. Skip if complete rest is the better choice.",
        icon: "walk",
      },
      {
        id: "mobility-7",
        name: "Light Mobility",
        duration: "8–10 min",
        note: "Address only the areas that feel restricted; do not force range.",
        icon: "mobility",
      },
      {
        id: "breath-7",
        name: "Downshift Breathing",
        duration: "5 min",
        note: "Slow nasal breathing with a longer exhale.",
        icon: "breath",
      },
    ],
  },
];

const equipmentByExercise: Record<string, string> = {
  bench: "Power rack · Olympic barbell · adjustable bench",
  row: "Dumbbells · adjustable bench",
  incline: "Dumbbells · adjustable bench",
  "chest-row": "Dumbbells · adjustable bench",
  lateral: "Dumbbells",
  triceps: "Cable tower or resistance band",
  squat: "Power rack · Olympic barbell · plates",
  rdl: "Olympic barbell · plates",
  "split-squat": "Dumbbells · adjustable bench",
  "hip-thrust": "Olympic barbell · plates · bench",
  calf: "Dumbbells or barbell",
  "dead-bug": "Exercise mat",
  "speed-bench": "Power rack · Olympic barbell · adjustable bench",
  pullup: "Rack pull-up bar · assistance bands",
  "db-press": "Dumbbells · adjustable bench",
  "band-row": "Cable tower or resistance band",
  "rear-delt": "Dumbbells or cable tower",
  curl: "Dumbbells",
  "speed-squat": "Power rack · Olympic barbell · stable bench",
  "db-rdl": "Dumbbells",
  "reverse-lunge": "Dumbbells",
  "single-rdl": "Dumbbell · rack support",
  "wall-sit": "Open wall space",
  "bike-easy": "Indoor spin bike",
};
const equipmentGroups = [
  {
    title: "Strength",
    items: [
      "Power rack with multi-grip pull-up station",
      "Olympic barbells and plate collection",
      "Adjustable / flat bench",
      "Dumbbells and kettlebells",
      "Chains and specialty-bar attachment",
    ],
  },
  {
    title: "Cable + bodyweight",
    items: [
      "Lat-pulldown / cable tower",
      "Low-cable attachments",
      "Resistance bands in multiple strengths",
      "Suspension straps",
      "Dip and pull-up options",
    ],
  },
  {
    title: "Conditioning",
    items: [
      "Indoor spin bike",
      "Treadmill",
      "Rowing machine",
      "Heavy bag and freestanding bag",
      "Medicine balls and jump ropes",
    ],
  },
  {
    title: "Recovery + mobility",
    items: [
      "Far-infrared sauna",
      "BOSU and stability ball",
      "Exercise mat and foam roller",
      "Mobility and balance accessories",
    ],
  },
];
const coachingGoals = [
  "Build visible muscle and maintain or improve strength",
  "Improve cardiovascular fitness",
  "Preserve power, balance and leg endurance for snowboarding",
  "Use recovery to manage fatigue, stress and long-term consistency",
  "Support gradual fat loss without sacrificing performance",
];
const defaultReadiness: Readiness = {
  sleep: 3,
  energy: 3,
  stress: 3,
  soreness: 3,
  motivation: 3,
  time: "60",
  pain: false,
  painArea: "",
};
const pad = (v: number) => v.toString().padStart(2, "0");
const formatTime = (s: number) =>
  `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
const formatShortTime = (s: number) =>
  `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
const localDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const freshConditioning = (): ConditioningLog => ({
  block: 0,
  remaining: 300,
  startedAt: null,
  running: false,
  completed: false,
  actualRpe: "",
  cadence: "",
  logs: [],
});
const freshDraft = (dayId: number): WorkoutDraft => ({
  dayId,
  date: localDate(),
  elapsed: 0,
  startedAt: null,
  running: false,
  updatedAt: Date.now(),
  sets: {},
  exerciseNotes: {},
  workoutNotes: "",
  readiness: { ...defaultReadiness },
  readinessConfirmed: false,
  recoveryDurations: {},
  recoveryCompleted: {},
  conditioning: freshConditioning(),
});
const currentElapsed = (draft: WorkoutDraft) =>
  draft.elapsed +
  (draft.running && draft.startedAt
    ? Math.floor((Date.now() - draft.startedAt) / 1000)
    : 0);
const pauseDraft = (draft: WorkoutDraft): WorkoutDraft => {
  const stoppedAt = Date.now();
  const conditioning = draft.conditioning.running
    ? {
        ...draft.conditioning,
        remaining: Math.max(
          0,
          draft.conditioning.remaining -
            Math.floor(
              (stoppedAt - (draft.conditioning.startedAt ?? stoppedAt)) / 1000,
            ),
        ),
        running: false,
        startedAt: null,
      }
    : draft.conditioning;
  return {
    ...draft,
    elapsed: currentElapsed(draft),
    running: false,
    startedAt: null,
    conditioning,
    updatedAt: stoppedAt,
  };
};
const normalizeDraft = (
  value: Partial<WorkoutDraft> & { dayId: number },
): WorkoutDraft => {
  const base = freshDraft(value.dayId);
  return {
    ...base,
    ...value,
    readiness: { ...defaultReadiness, ...value.readiness },
    readinessConfirmed: value.readinessConfirmed ?? false,
    conditioning: { ...freshConditioning(), ...value.conditioning },
  };
};
const readinessResult = (r: Readiness): ReadinessResult => {
  if (r.pain || r.sleep <= 1 || r.energy <= 1) return "red";
  const score =
    r.sleep + r.energy + r.motivation + (6 - r.stress) + (6 - r.soreness);
  return score >= 19 ? "green" : score >= 13 ? "yellow" : "red";
};
const readinessCopy = {
  green: "Train as programmed",
  yellow: "Cap effort and trim optional volume",
  red: "Choose recovery or easy work; do not push through pain",
  unrated: "Complete the check before training",
};
const adjustedExercise = (
  exercise: Exercise,
  result: ReadinessResult,
  time: string,
): Exercise => {
  const timeLimited = time === "30" || time === "45";
  if (result !== "yellow" && !timeLimited) return exercise;
  const optional =
    /accessory|hypertrophy|single-leg|posterior chain|trunk|balance|aerobic/i.test(
      exercise.type,
    );
  const trim = optional ? (time === "30" ? 2 : 1) : 0;
  return {
    ...exercise,
    sets: Math.max(1, exercise.sets - trim),
    rpe:
      result === "yellow" && Number(exercise.rpe.split("–")[0]) > 7
        ? "7"
        : exercise.rpe,
  };
};

function ShamrockMark({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`brand-mark ${compact ? "brand-mark-compact" : ""}`}
      role="img"
      aria-label="Smith Luck shamrock"
    >
      <span className="leaf leaf-a" />
      <span className="leaf leaf-b" />
      <span className="leaf leaf-c" />
      <span className="stem" />
    </div>
  );
}
function AppHeader({
  view,
  onView,
}: {
  view: View;
  onView: (view: View) => void;
}) {
  const nav = [
    { id: "dashboard" as View, label: "Dashboard", Icon: Home },
    { id: "coach" as View, label: "Coach", Icon: HeartPulse },
    { id: "equipment" as View, label: "Home Gym", Icon: Dumbbell },
    { id: "history" as View, label: "History", Icon: History },
  ];
  return (
    <header className="app-header">
      <button
        className="brand-lockup"
        onClick={() => onView("dashboard")}
        aria-label="Go to dashboard"
      >
        <ShamrockMark compact />
        <span>
          <strong>SMITH LUCK</strong>
          <small>PERFORMANCE · EST 1971</small>
        </span>
      </button>
      <nav className="header-actions" aria-label="Primary navigation">
        {nav.map(({ id, label, Icon }) => (
          <Button
            key={id}
            variant="ghost"
            className={`nav-button ${view === id ? "active" : ""}`}
            onClick={() => onView(id)}
            aria-label={label}
          >
            <Icon />
            <span>{label}</span>
          </Button>
        ))}
      </nav>
    </header>
  );
}
function ReadinessBadge({ result }: { result: ReadinessResult }) {
  return (
    <span className={`readiness-badge ${result}`}>
      <i />
      {result === "unrated" ? "Check readiness" : `${result} readiness`}
    </span>
  );
}
function ReadinessPanel({
  value,
  confirmed,
  onChange,
  onConfirm,
}: {
  value: Readiness;
  confirmed: boolean;
  onChange: (value: Readiness) => void;
  onConfirm: () => void;
}) {
  const result = confirmed ? readinessResult(value) : "unrated";
  const scale = (
    key: "sleep" | "energy" | "stress" | "soreness" | "motivation",
    label: string,
    invert = false,
  ) => (
    <label>
      <span>{label}</span>
      <NativeSelect
        value={String(value[key])}
        onChange={(e) => onChange({ ...value, [key]: Number(e.target.value) })}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <NativeSelectOption key={n} value={n}>
            {n}
            {n === 1
              ? invert
                ? " · Low"
                : " · Poor"
              : n === 5
                ? invert
                  ? " · High"
                  : " · Excellent"
                : ""}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </label>
  );
  return (
    <section className={`readiness-panel ${result}`}>
      <div className="readiness-head">
        <div>
          <div className="eyebrow">
            <ClipboardCheck />
            Daily coaching check
          </div>
          <h2>How ready are you?</h2>
        </div>
        <div>
          <ReadinessBadge result={result} />
          <strong>{readinessCopy[result]}</strong>
        </div>
      </div>
      <div className="readiness-grid">
        {scale("sleep", "Sleep")}
        {scale("energy", "Energy")}
        {scale("stress", "Stress", true)}
        {scale("soreness", "Soreness", true)}
        {scale("motivation", "Motivation")}
        <label>
          <span>Time available</span>
          <NativeSelect
            value={value.time}
            onChange={(e) => onChange({ ...value, time: e.target.value })}
          >
            <NativeSelectOption value="30">30 min</NativeSelectOption>
            <NativeSelectOption value="45">45 min</NativeSelectOption>
            <NativeSelectOption value="60">60 min</NativeSelectOption>
            <NativeSelectOption value="75">75+ min</NativeSelectOption>
          </NativeSelect>
        </label>
      </div>
      <label className={`pain-check ${value.pain ? "active" : ""}`}>
        <input
          type="checkbox"
          checked={value.pain}
          onChange={(e) =>
            onChange({
              ...value,
              pain: e.target.checked,
              painArea: e.target.checked ? value.painArea : "",
            })
          }
        />
        <span>
          <AlertTriangle />I have pain or a problem area today
        </span>
      </label>
      {value.pain && (
        <label className="pain-area">
          Pain / problem area
          <Input
            placeholder="Where, and what movement aggravates it?"
            value={value.painArea}
            onChange={(e) => onChange({ ...value, painArea: e.target.value })}
          />
        </label>
      )}
      <div className="readiness-confirm">
        <p className="coach-disclaimer">
          Training guidance only—not a medical diagnosis. Stop and seek
          appropriate care for concerning or persistent symptoms.
        </p>
        <Button
          onClick={onConfirm}
          disabled={value.pain && !value.painArea.trim()}
        >
          {confirmed ? (
            <>
              <Check />
              Readiness confirmed
            </>
          ) : (
            <>
              <ClipboardCheck />
              Confirm readiness
            </>
          )}
        </Button>
      </div>
    </section>
  );
}

function Dashboard({
  selectedId,
  setSelectedId,
  onOpen,
  history,
  drafts,
  onCoach,
}: {
  selectedId: number;
  setSelectedId: (id: number) => void;
  onOpen: (id: number) => void;
  history: SessionLog[];
  drafts: Record<number, WorkoutDraft>;
  onCoach: () => void;
}) {
  const nextId = history[0]
    ? (history[0].dayId % 7) + 1
    : ((new Date().getDay() + 6) % 7) + 1;
  const next = workoutDays[nextId - 1];
  const chosen = workoutDays[selectedId - 1];
  const resume = Object.values(drafts)
    .filter(
      (draft) =>
        currentElapsed(draft) > 0 ||
        draft.readinessConfirmed ||
        draft.workoutNotes.trim() ||
        Object.values(draft.sets).some((rows) =>
          rows.some((row) => row.done || row.weight || row.reps || row.rpe),
        ) ||
        Object.values(draft.recoveryCompleted).some(Boolean) ||
        draft.conditioning.logs.length > 0,
    )
    .sort((a, b) => b.updatedAt - a.updatedAt)[0];
  const completedThisWeek = history.filter(
    (x) => Date.now() - new Date(x.completedAt).getTime() < 604800000,
  ).length;
  return (
    <main className="page-shell dashboard-page">
      <section className="dashboard-lead">
        <div className="eyebrow">
          <span className="status-dot" />
          Today’s recommendation
        </div>
        <div className="dashboard-heading">
          <div>
            <p className="day-kicker">
              Day {next.id} · {next.objective}
            </p>
            <h1>{next.name}</h1>
            <p>{next.description}</p>
          </div>
          <div className="cycle-medallion">
            <span>CYCLE</span>
            <strong>01</strong>
            <small>FOUNDATION</small>
          </div>
        </div>
        {resume && (
          <div className="resume-banner">
            <div>
              <span>Saved workout draft</span>
              <strong>
                Day {resume.dayId} · {workoutDays[resume.dayId - 1].name}
              </strong>
              <small>
                {formatTime(currentElapsed(resume))} ·{" "}
                {resume.running ? "timer active" : "ready to resume"} · stored
                on this device
              </small>
            </div>
            <Button onClick={() => onOpen(resume.dayId)}>
              <Play />
              Resume workout
            </Button>
          </div>
        )}
        <div className="dashboard-actions">
          <Button
            size="lg"
            className="primary-cta"
            onClick={() => onOpen(next.id)}
          >
            <Play />
            Open today’s workout
          </Button>
          <div className="choose-workout">
            <label htmlFor="workout-choice">Choose another workout</label>
            <NativeSelect
              id="workout-choice"
              value={selectedId}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="workout-select"
            >
              {workoutDays.map((day) => (
                <NativeSelectOption key={day.id} value={day.id}>
                  Day {day.id} — {day.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          <Button
            variant="outline"
            size="lg"
            className="open-selected"
            onClick={() => onOpen(chosen.id)}
          >
            Open Day {chosen.id}
            <ChevronRight />
          </Button>
        </div>
      </section>
      <section className="metric-grid" aria-label="Training summary">
        <article>
          <span>Current cycle</span>
          <strong>Cycle 1</strong>
          <small>Foundation · establish baselines</small>
        </article>
        <article>
          <span>Sessions · 7 days</span>
          <strong>{completedThisWeek}</strong>
          <small>
            {completedThisWeek
              ? "Consistency is the first progression"
              : "Ready for your first complete entry"}
          </small>
        </article>
        <article>
          <span>Last workout</span>
          <strong>{history[0]?.name ?? "No entry"}</strong>
          <small>{history[0]?.date ?? "Complete a session to begin"}</small>
        </article>
      </section>
      <section className="coach-strip">
        <div>
          <Target />
          <span>Coach intent</span>
          <strong>Muscle + strength lead. Recovery governs.</strong>
        </div>
        <p>
          Every recommendation stays tied to cardiovascular fitness, snowboard
          durability and long-term consistency.
        </p>
        <Button variant="outline" onClick={onCoach}>
          View coaching framework
        </Button>
      </section>
      <section className="week-section">
        <div className="section-heading">
          <div>
            <span>Seven-day sequence</span>
            <h2>This cycle’s programming</h2>
          </div>
          <p>
            One shared system. The programming changes; the controls stay
            consistent.
          </p>
        </div>
        <div className="week-grid">
          {workoutDays.map((day) => (
            <button
              key={day.id}
              className={`week-card ${day.id === next.id ? "is-today" : ""}`}
              onClick={() => onOpen(day.id)}
            >
              <span className="week-number">{pad(day.id)}</span>
              <span className="week-copy">
                <small>{day.cycle.split(" · ")[1]}</small>
                <strong>{day.name}</strong>
                <em>{day.objective}</em>
              </span>
              <ChevronRight />
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
function WorkoutHeader({
  day,
  onBack,
  onPrev,
  onNext,
}: {
  day: WorkoutDay;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <section className="workout-hero">
      <Button variant="ghost" className="back-button" onClick={onBack}>
        <ChevronLeft />
        Dashboard
      </Button>
      <div className="workout-title-row">
        <div className="day-block">
          <span>DAY</span>
          <strong>{pad(day.id)}</strong>
        </div>
        <div className="workout-title">
          <p>{day.cycle}</p>
          <h1>{day.name}</h1>
          <div>
            <span>{day.objective}</span>
            <i />
            <span>
              {day.type === "strength"
                ? `${day.exercises?.length ?? 0} exercises`
                : day.type === "conditioning"
                  ? "40 minutes"
                  : `${day.recovery?.length ?? 0} modules`}
            </span>
          </div>
        </div>
        <div className="day-arrows">
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous workout"
            onClick={onPrev}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next workout"
            onClick={onNext}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
      <p className="workout-description">{day.description}</p>
    </section>
  );
}
function WorkoutTimer({
  draft,
  canStart,
  onChange,
  onRequestFinish,
}: {
  draft: WorkoutDraft;
  canStart: boolean;
  onChange: (draft: WorkoutDraft) => void;
  onRequestFinish: () => void;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!draft.running) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [draft.running]);
  const elapsed =
    draft.elapsed +
    (draft.running && draft.startedAt
      ? Math.floor((now - draft.startedAt) / 1000)
      : 0);
  const start = () =>
    onChange({
      ...draft,
      running: true,
      startedAt: Date.now(),
      updatedAt: Date.now(),
    });
  const pause = () =>
    onChange({
      ...draft,
      elapsed,
      running: false,
      startedAt: null,
      updatedAt: Date.now(),
    });
  return (
    <section
      className={`workout-control ${draft.running || elapsed ? "active" : ""}`}
    >
      <div className="date-control">
        <CalendarDays />
        <label htmlFor="session-date">Session date</label>
        <Input
          id="session-date"
          type="date"
          value={draft.date}
          onChange={(e) =>
            onChange({ ...draft, date: e.target.value, updatedAt: Date.now() })
          }
        />
      </div>
      <div className="timer-display">
        <span>Total workout time</span>
        <strong>{formatTime(elapsed)}</strong>
        <small>
          {draft.running
            ? "Workout active"
            : canStart
              ? "Draft safely stored"
              : "Confirm readiness to start"}
        </small>
      </div>
      <div className="timer-actions">
        {!draft.running && elapsed === 0 && (
          <Button className="primary-cta" onClick={start} disabled={!canStart}>
            <Play />
            Start workout
          </Button>
        )}
        {draft.running && (
          <Button variant="outline" onClick={pause}>
            <Pause />
            Pause
          </Button>
        )}
        {!draft.running && elapsed > 0 && (
          <Button variant="outline" onClick={start} disabled={!canStart}>
            <Play />
            Resume
          </Button>
        )}
        {elapsed > 0 && (
          <Button className="finish-button" onClick={onRequestFinish}>
            <Check />
            Finish
          </Button>
        )}
      </div>
    </section>
  );
}
function RestTimer({ initial }: { initial: number }) {
  const [remaining, setRemaining] = useState(initial);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [base, setBase] = useState(initial);
  const [alertDone, setAlertDone] = useState(false);
  useEffect(() => {
    if (!startedAt) return;
    const tick = () => {
      const next = Math.max(
        0,
        base - Math.floor((Date.now() - startedAt) / 1000),
      );
      setRemaining(next);
      if (next === 0) {
        setAlertDone(true);
        setStartedAt(null);
        try {
          navigator.vibrate?.([200, 100, 200]);
          const AudioCtor = window.AudioContext ||
            (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
          if (AudioCtor) {
            const audio = new AudioCtor();
            const tone = audio.createOscillator();
            const volume = audio.createGain();
            tone.frequency.value = 880;
            volume.gain.value = 0.12;
            tone.connect(volume);
            volume.connect(audio.destination);
            tone.start();
            tone.stop(audio.currentTime + 0.35);
            tone.onended = () => void audio.close();
          }
        } catch {
          // Foreground audio may be restricted by the browser.
        }
      }
    };
    tick();
    const timer = window.setInterval(tick, 500);
    return () => window.clearInterval(timer);
  }, [startedAt, base]);
  const toggle = () => {
    if (startedAt) {
      setBase(remaining);
      setStartedAt(null);
    } else { setAlertDone(false); setStartedAt(Date.now()); }
  };
  const reset = () => {
    setAlertDone(false);
    setStartedAt(null);
    setBase(initial);
    setRemaining(initial);
  };
  return (
    <div className="rest-timer">
      <div>
        <TimerReset />
        <span>{alertDone ? "Rest complete — next set" : "Rest timer"}</span>
        <strong>{formatShortTime(remaining)}</strong>
      </div>
      <div>
        <Button size="sm" variant="outline" onClick={toggle}>
          {startedAt ? <Pause /> : <Play />}
          {startedAt ? "Pause" : "Start"}
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Reset rest timer"
          onClick={reset}
        >
          <RotateCcw />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setStartedAt(null);
            setBase(remaining + 15);
            setRemaining(remaining + 15);
          }}
        >
          <Plus />
          15
        </Button>
      </div>
    </div>
  );
}
function SetLogger({
  exercise,
  values,
  onChange,
}: {
  exercise: Exercise;
  values: SetEntry[];
  onChange: (rows: SetEntry[]) => void;
}) {
  const rows = Array.from(
    { length: exercise.sets },
    (_, i) => values[i] ?? { weight: "", reps: "", rpe: "", done: false },
  );
  const updateSide = (index: number, side: "left" | "right", key: keyof SideEntry, value: string | boolean) => {
    const next = [...rows];
    const old = next[index][side] ?? { weight: "", reps: "", rpe: "", done: false };
    next[index] = { ...next[index], [side]: { ...old, [key]: value } };
    onChange(next);
  };
  if (exercise.unilateral) return (
    <div className="set-logger">
      {rows.map((row, index) => (
        <div className="previous-stack" key={index}>
          <strong>Set {index + 1} · Left / Right</strong>
          {(["left", "right"] as const).map((side) => {
            const entry = row[side] ?? { weight: "", reps: "", rpe: "", done: false };
            return (
              <div className="set-grid" key={side}>
                <strong>{side === "left" ? "L" : "R"}</strong>
                <Input inputMode="decimal" aria-label={`${exercise.name} set ${index + 1} ${side} weight`} placeholder="lb" value={entry.weight} onChange={(e) => updateSide(index, side, "weight", e.target.value)} />
                <Input inputMode="numeric" aria-label={`${exercise.name} set ${index + 1} ${side} reps`} placeholder="reps" value={entry.reps} onChange={(e) => updateSide(index, side, "reps", e.target.value)} />
                <Input inputMode="decimal" aria-label={`${exercise.name} set ${index + 1} ${side} RPE`} placeholder="RPE" value={entry.rpe} onChange={(e) => updateSide(index, side, "rpe", e.target.value)} />
                <button className={`set-check ${entry.done ? "checked" : ""}`} aria-label={`Mark ${exercise.name} set ${index + 1} ${side} complete`} aria-pressed={entry.done} onClick={() => updateSide(index, side, "done", !entry.done)}>{entry.done && <Check />}</button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
  const change = (
    index: number,
    key: keyof SetEntry,
    value: string | boolean,
  ) => {
    const next = [...rows];
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  };
  return (
    <div className="set-logger">
      <div className="set-grid set-grid-head">
        <span>Set</span>
        <span>Weight</span>
        <span>Reps</span>
        <span>RPE</span>
        <span>Done</span>
      </div>
      {rows.map((row, index) => (
        <div className="set-grid" key={index}>
          <strong>{index + 1}</strong>
          <Input
            inputMode="decimal"
            aria-label={`${exercise.name} set ${index + 1} weight`}
            placeholder="lb"
            value={row.weight}
            onChange={(e) => change(index, "weight", e.target.value)}
          />
          <Input
            inputMode="numeric"
            aria-label={`${exercise.name} set ${index + 1} reps`}
            placeholder={exercise.reps.split(" ")[0]}
            value={row.reps}
            onChange={(e) => change(index, "reps", e.target.value)}
          />
          <Input
            inputMode="decimal"
            aria-label={`${exercise.name} set ${index + 1} RPE`}
            placeholder={exercise.rpe}
            value={row.rpe}
            onChange={(e) => change(index, "rpe", e.target.value)}
          />
          <button
            className={`set-check ${row.done ? "checked" : ""}`}
            aria-label={`Mark ${exercise.name} set ${index + 1} complete`}
            aria-pressed={row.done}
            onClick={() => change(index, "done", !row.done)}
          >
            {row.done && <Check />}
          </button>
        </div>
      ))}
    </div>
  );
}
function PreviousPerformance({
  exercise,
  history,
}: {
  exercise: Exercise;
  history: SessionLog[];
}) {
  const previous = [...history]
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .find((session) => session.exercises?.[exercise.id])
    ?.exercises[exercise.id];
  const completed =
    previous?.sets.filter((set) => exercise.unilateral ? set.left?.done && set.right?.done : set.done && set.weight && set.reps) ?? [];
  if (!completed.length)
    return (
      <div className="previous-performance">
        <span>Previous performance</span>
        <strong>Establish your baseline today</strong>
      </div>
    );
  if (exercise.unilateral) return (
    <div className="previous-performance">
      <span>Previous left / right performance</span>
      {completed.map((set, index) => <p key={index}>Set {index + 1}: L {set.left?.weight || "—"} lb × {set.left?.reps || "—"} (RPE {set.left?.rpe || "—"}) · R {set.right?.weight || "—"} lb × {set.right?.reps || "—"} (RPE {set.right?.rpe || "—"})</p>)}
    </div>
  );
  const top = [...completed].sort(
    (a, b) => Number(b.weight) - Number(a.weight),
  )[0];
  const upperRep = Number((exercise.reps.match(/\d+/g) ?? ["0"]).at(-1));
  const targetRpe = Number(exercise.rpe.split("–")[0]);
  const progressionReady =
    completed.length === exercise.sets &&
    completed.every(
      (set) =>
        set.rpe && Number(set.rpe) <= targetRpe && Number(set.reps) >= upperRep,
    );
  return (
    <div className="previous-stack">
      <div className="previous-performance">
        <span>Previous performance</span>
        <strong>
          {top.weight} lb × {top.reps} · RPE {top.rpe || "—"}
        </strong>
      </div>
      <p>
        {progressionReady
          ? "Coach: every prescribed set reached the top of the rep range at target RPE—consider a small load increase."
          : "Coach: repeat or adjust the load until every prescribed set reaches the target range with a recorded RPE."}
      </p>
    </div>
  );
}
function ExerciseCard({
  exercise,
  index,
  values,
  notes,
  onChange,
  onNotes,
  history,
}: {
  exercise: Exercise;
  index: number;
  values: SetEntry[];
  notes: string;
  onChange: (rows: SetEntry[]) => void;
  onNotes: (value: string) => void;
  history: SessionLog[];
}) {
  return (
    <article className="exercise-card">
      <header className="exercise-header">
        <div className="exercise-order">{pad(index + 1)}</div>
        <div className="exercise-name">
          <span>{exercise.type}</span>
          <h2>{exercise.name}</h2>
        </div>
        <div className="prescription">
          <div>
            <small>SETS × REPS</small>
            <strong>
              {exercise.sets} × {exercise.reps}
            </strong>
          </div>
          <div>
            <small>TARGET</small>
            <strong>RPE {exercise.rpe}</strong>
          </div>
          <div>
            <small>REST</small>
            <strong>
              {exercise.rest
                ? `${exercise.rest >= 60 ? exercise.rest / 60 : exercise.rest} ${exercise.rest >= 60 ? "min" : "sec"}`
                : "—"}
            </strong>
          </div>
        </div>
      </header>
      <div className="exercise-body">
        <PreviousPerformance exercise={exercise} history={history} />
        <div className="equipment-fit">
          <Check />
          <span>Home-gym ready</span>
          <strong>
            {equipmentByExercise[exercise.id] ?? "Available equipment"}
          </strong>
        </div>
        <p className="coach-note">{exercise.note}</p>
        <SetLogger exercise={exercise} values={values} onChange={onChange} />
        {exercise.rest > 0 && <RestTimer initial={exercise.rest} />}
        <label className="notes-label">
          Exercise notes
          <Textarea
            placeholder={`Technique, pain or adjustment for ${exercise.name}…`}
            rows={2}
            value={notes}
            onChange={(e) => onNotes(e.target.value)}
          />
        </label>
      </div>
    </article>
  );
}

const conditioningBlocks = [
  {
    name: "Warm-up",
    duration: 300,
    rpe: "2–4",
    cue: "Build cadence gradually",
  },
  ...Array.from({ length: 8 }, (_, i) => [
    {
      name: `Hard interval ${i + 1}`,
      duration: 120,
      rpe: "8",
      cue: "Strong, repeatable power",
    },
    {
      name: `Recovery ${i + 1}`,
      duration: 120,
      rpe: "3–4",
      cue: "Easy spin · regain control",
    },
  ]).flat(),
  { name: "Cool-down", duration: 180, rpe: "2–3", cue: "Let breathing settle" },
];
function IntervalTimer({
  state,
  onChange,
}: {
  state: ConditioningLog;
  onChange: (state: ConditioningLog) => void;
}) {
  const [now, setNow] = useState(Date.now());
  const current =
    conditioningBlocks[state.block] ??
    conditioningBlocks[conditioningBlocks.length - 1];
  const elapsedInBlock =
    state.running && state.startedAt
      ? Math.floor((now - state.startedAt) / 1000)
      : 0;
  const remaining = state.running
    ? Math.max(0, state.remaining - elapsedInBlock)
    : state.remaining;
  useEffect(() => {
    if (!state.running) return;
    const timer = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(timer);
  }, [state.running]);
  const signal = () => {
    try {
      navigator.vibrate?.([180, 80, 180]);
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AudioContextClass) {
        const context = new AudioContextClass();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.frequency.value = 740;
        gain.gain.value = 0.08;
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.18);
        oscillator.onended = () => void context.close();
      }
    } catch {}
  };
  const advance = useCallback(() => {
    let block = state.block;
    let spill =
      state.running && state.startedAt
        ? Math.max(
            0,
            Math.floor((Date.now() - state.startedAt) / 1000) - state.remaining,
          )
        : 0;
    const logs = [
      ...state.logs,
      {
        name: current.name,
        actualRpe: state.actualRpe,
        cadence: state.cadence,
      },
    ];
    while (block < conditioningBlocks.length - 1) {
      block += 1;
      const duration = conditioningBlocks[block].duration;
      if (spill < duration) {
        signal();
        onChange({
          ...state,
          block,
          remaining: duration - spill,
          startedAt: Date.now(),
          running: true,
          actualRpe: "",
          cadence: "",
          logs,
        });
        return;
      }
      logs.push({
        name: conditioningBlocks[block].name,
        actualRpe: "",
        cadence: "",
      });
      spill -= duration;
    }
    signal();
    onChange({
      ...state,
      block: conditioningBlocks.length - 1,
      remaining: 0,
      startedAt: null,
      running: false,
      completed: true,
      actualRpe: "",
      cadence: "",
      logs,
    });
  }, [state, current.name, onChange]);
  useEffect(() => {
    if (state.running && remaining === 0) advance();
  }, [state.running, remaining, advance]);
  const toggle = () =>
    state.running
      ? onChange({ ...state, remaining, startedAt: null, running: false })
      : onChange({ ...state, startedAt: Date.now(), running: true });
  const reset = () => onChange(freshConditioning());
  const next = conditioningBlocks[state.block + 1];
  return (
    <section className="interval-panel">
      <div className="interval-overview">
        <div>
          <span>Complete session</span>
          <h2>5:00 warm-up · 8 × 2:00 / 2:00 · 3:00 cool-down</h2>
          <p>
            Every block is timed and recorded · 40 minutes total · sound and
            vibration alert at transitions
          </p>
        </div>
        <Gauge />
      </div>
      <div className="interval-stage">
        <div
          className={`phase-badge ${current.name.includes("Hard") ? "work" : "recovery"}`}
        >
          {state.completed ? "SESSION COMPLETE" : current.name.toUpperCase()}
        </div>
        <p>
          Block {Math.min(state.block + 1, conditioningBlocks.length)} of{" "}
          {conditioningBlocks.length}
        </p>
        <strong>{formatShortTime(remaining)}</strong>
        <div className="rpe-target">
          <span>Target RPE</span>
          <b>{current.rpe}</b>
          <small>{current.cue}</small>
        </div>
        <div className="interval-inputs">
          <label>
            Actual RPE
            <Input
              inputMode="decimal"
              placeholder={current.rpe}
              value={state.actualRpe}
              onChange={(e) =>
                onChange({ ...state, actualRpe: e.target.value })
              }
            />
          </label>
          <label>
            Cadence / resistance
            <Input
              placeholder="e.g. 90 rpm / level 7"
              value={state.cadence}
              onChange={(e) => onChange({ ...state, cadence: e.target.value })}
            />
          </label>
        </div>
        <div className="interval-actions">
          <Button
            className="primary-cta"
            onClick={toggle}
            disabled={state.completed}
          >
            {state.running ? <Pause /> : <Play />}
            {state.running
              ? "Pause block"
              : state.block === 0 && state.remaining === 300
                ? "Start warm-up"
                : "Resume block"}
          </Button>
          <Button
            variant="outline"
            onClick={advance}
            disabled={state.completed}
          >
            Complete block
          </Button>
          <Button variant="outline" onClick={reset}>
            <RotateCcw />
            Reset
          </Button>
        </div>
      </div>
      <div className="next-interval">
        <span>Next</span>
        <strong>
          {next
            ? `${next.name} · ${formatShortTime(next.duration)} · RPE ${next.rpe}`
            : "Workout timer can now be finished"}
        </strong>
      </div>
    </section>
  );
}
const recoveryIcon = {
  heat: Flame,
  cold: Snowflake,
  mobility: Activity,
  breath: Wind,
  walk: Activity,
};
function RecoveryGrid({
  modules,
  draft,
  onChange,
}: {
  modules: RecoveryModule[];
  draft: WorkoutDraft;
  onChange: (draft: WorkoutDraft) => void;
}) {
  return (
    <section className="recovery-grid">
      {modules.map((module) => {
        const Icon = recoveryIcon[module.icon];
        const completed = draft.recoveryCompleted[module.id];
        return (
          <article
            key={module.id}
            className={`recovery-card ${completed ? "completed" : ""}`}
          >
            <div className="recovery-icon">
              <Icon />
            </div>
            <div className="recovery-copy">
              <span>Recovery module</span>
              <h2>{module.name}</h2>
              <p>{module.note}</p>
            </div>
            <div className="recovery-log">
              <label>
                Target<strong>{module.duration}</strong>
              </label>
              <label>
                Actual duration
                <Input
                  aria-label={`${module.name} actual duration`}
                  placeholder="e.g. 15 min"
                  value={draft.recoveryDurations[module.id] ?? ""}
                  onChange={(e) =>
                    onChange({
                      ...draft,
                      recoveryDurations: {
                        ...draft.recoveryDurations,
                        [module.id]: e.target.value,
                      },
                      updatedAt: Date.now(),
                    })
                  }
                />
              </label>
              <Button
                variant={completed ? "default" : "outline"}
                onClick={() =>
                  onChange({
                    ...draft,
                    recoveryCompleted: {
                      ...draft.recoveryCompleted,
                      [module.id]: !completed,
                    },
                    updatedAt: Date.now(),
                  })
                }
              >
                {completed ? (
                  <>
                    <Check />
                    Completed
                  </>
                ) : (
                  "Mark complete"
                )}
              </Button>
            </div>
          </article>
        );
      })}
    </section>
  );
}
function WorkoutScreen({
  day,
  draft,
  history,
  onBack,
  onSelect,
  onDraft,
  onComplete,
  onDiscard,
}: {
  day: WorkoutDay;
  draft: WorkoutDraft;
  history: SessionLog[];
  onBack: () => void;
  onSelect: (id: number) => void;
  onDraft: (draft: WorkoutDraft) => void;
  onComplete: (session: SessionLog) => void;
  onDiscard: () => void;
}) {
  const [confirming, setConfirming] = useState<"finish" | "discard" | null>(
    null,
  );
  const [overrideRed, setOverrideRed] = useState(false);
  const result: ReadinessResult = draft.readinessConfirmed
    ? readinessResult(draft.readiness)
    : "unrated";
  const exercises = (day.exercises ?? []).map((exercise) =>
    adjustedExercise(exercise, result, draft.readiness.time),
  );
  const setTotal = exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
  const setDone = exercises.reduce(
    (sum, exercise) =>
      sum +
      Array.from(
        { length: exercise.sets },
        (_, index) => draft.sets[exercise.id]?.[index],
      ).filter((row) => exercise.unilateral ? row?.left?.done && row?.right?.done : row?.done).length,
    0,
  );
  const validSets = exercises.every((exercise) =>
    Array.from(
      { length: exercise.sets },
      (_, index) => draft.sets[exercise.id]?.[index],
    ).every((row) =>
      exercise.unilateral
        ? Boolean(
            row?.left?.done && row?.left?.reps?.trim() && row?.left?.rpe?.trim() &&
            row?.right?.done && row?.right?.reps?.trim() && row?.right?.rpe?.trim(),
          )
        : Boolean(row?.done && row?.reps?.trim() && row?.rpe?.trim()),
    ),
  );
  const recoveryDone = (day.recovery ?? []).filter(
    (module) => draft.recoveryCompleted[module.id],
  ).length;
  const progressDone =
    day.type === "strength"
      ? setDone
      : day.type === "conditioning"
        ? draft.conditioning.logs.length +
          (draft.conditioning.completed ? 1 : 0)
        : recoveryDone;
  const progressTotal =
    day.type === "strength"
      ? setTotal
      : day.type === "conditioning"
        ? conditioningBlocks.length
        : (day.recovery?.length ?? 0);
  const completeReady =
    day.type === "strength"
      ? validSets
      : day.type === "conditioning"
        ? draft.conditioning.completed
        : recoveryDone > 0 || day.id === 7;
  const finish = (completionStatus: CompletionStatus) => {
    const loggedExercises = Object.fromEntries(
      exercises.map((exercise) => [
        exercise.id,
        {
          sets: (draft.sets[exercise.id] ?? []).slice(0, exercise.sets),
          notes: draft.exerciseNotes[exercise.id] ?? "",
        },
      ]),
    );
    onComplete({
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
      dayId: day.id,
      name: day.name,
      date: draft.date,
      duration: currentElapsed(draft),
      completedAt: new Date().toISOString(),
      readiness: result,
      readinessDetails: { ...draft.readiness },
      completionStatus,
      exercises: loggedExercises,
      workoutNotes: draft.workoutNotes,
      recoveryDurations: draft.recoveryDurations,
      recoveryCompleted: draft.recoveryCompleted,
      conditioning:
        day.type === "conditioning"
          ? {
              ...draft.conditioning,
              remaining:
                draft.conditioning.running && draft.conditioning.startedAt
                  ? Math.max(
                      0,
                      draft.conditioning.remaining -
                        Math.floor(
                          (Date.now() - draft.conditioning.startedAt) / 1000,
                        ),
                    )
                  : draft.conditioning.remaining,
              startedAt: null,
              running: false,
            }
          : undefined,
    });
  };
  const canShowPlan =
    result !== "red" || overrideRed || day.type === "recovery";
  const progressLabel =
    day.type === "strength"
      ? `${setDone} of ${setTotal} sets`
      : day.type === "conditioning"
        ? `${Math.min(progressDone, progressTotal)} of ${progressTotal} blocks`
        : `${recoveryDone} of ${progressTotal} modules`;
  return (
    <main className="page-shell workout-page">
      <WorkoutHeader
        day={day}
        onBack={onBack}
        onPrev={() => onSelect(day.id === 1 ? 7 : day.id - 1)}
        onNext={() => onSelect(day.id === 7 ? 1 : day.id + 1)}
      />
      <ReadinessPanel
        value={draft.readiness}
        confirmed={draft.readinessConfirmed}
        onChange={(readiness) =>
          onDraft({
            ...draft,
            readiness,
            readinessConfirmed: false,
            updatedAt: Date.now(),
          })
        }
        onConfirm={() =>
          onDraft({ ...draft, readinessConfirmed: true, updatedAt: Date.now() })
        }
      />
      {(result === "yellow" ||
        draft.readiness.time === "30" ||
        draft.readiness.time === "45") &&
        draft.readinessConfirmed && (
          <section className="readiness-adjustment">
            <ShieldCheck />
            <div>
              <strong>Today’s plan has been adjusted.</strong>
              <p>
                Optional work is trimmed for readiness or available time. On
                yellow-readiness days, higher effort targets are also capped at
                RPE 7. The cards below show the actual prescription.
              </p>
            </div>
          </section>
        )}
      {result === "red" && day.type !== "recovery" && (
        <section className="coach-red-action">
          <AlertTriangle />
          <div>
            <strong>Recovery is the recommended session today.</strong>
            <p>
              {draft.readiness.pain
                ? `Pain noted: ${draft.readiness.painArea}. `
                : ""}
              Do not push through pain. Choose recovery, or explicitly continue
              only if this is safe for you.
            </p>
            <div>
              <Button onClick={() => onSelect(4)}>Open Recovery · Day 4</Button>
              <Button variant="outline" onClick={() => setOverrideRed(true)}>
                Continue planned workout
              </Button>
            </div>
          </div>
        </section>
      )}
      {history.some((session) => session.dayId === day.id) && (
        <details className="previous-stack">
          <summary>Last {day.name} session</summary>
          {(() => {
            const last = [...history].sort((a, b) => b.completedAt.localeCompare(a.completedAt)).find((session) => session.dayId === day.id);
            if (!last) return null;
            return (
              <div className="previous-performance">
                <strong>{last.date} · {formatTime(last.duration)}</strong>
                <p>{Object.entries(last.exercises).map(([id, log]) =>
                  `${day.exercises?.find((exercise) => exercise.id === id)?.name ?? id}: ${log.sets.map((set) => set.left || set.right ? `L ${set.left?.weight || "—"} lb × ${set.left?.reps || "—"} / R ${set.right?.weight || "—"} lb × ${set.right?.reps || "—"}` : set.done ? `${set.weight || "BW"} lb × ${set.reps} (RPE ${set.rpe || "—"})` : "").filter(Boolean).join(", ")}`
                ).join(" | ") || "No strength sets recorded."}</p>
                {last.workoutNotes && <p>Notes: {last.workoutNotes}</p>}
              </div>
            );
          })()}
        </details>
      )}
      <WorkoutTimer
        draft={draft}
        canStart={draft.readinessConfirmed && canShowPlan}
        onChange={onDraft}
        onRequestFinish={() => setConfirming("finish")}
      />
      <section className="workout-progress">
        <div>
          <span>Workout progress</span>
          <strong>{progressLabel}</strong>
        </div>
        <div className="progress-track">
          <i
            style={{
              width: `${progressTotal ? Math.min(100, Math.round((progressDone / progressTotal) * 100)) : 0}%`,
            }}
          />
        </div>
      </section>
      {canShowPlan && day.type === "strength" && (
        <section className="exercise-list">
          {exercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={index}
              values={draft.sets[exercise.id] ?? []}
              notes={draft.exerciseNotes[exercise.id] ?? ""}
              history={history}
              onChange={(rows) =>
                onDraft({
                  ...draft,
                  sets: { ...draft.sets, [exercise.id]: rows },
                  updatedAt: Date.now(),
                })
              }
              onNotes={(notes) =>
                onDraft({
                  ...draft,
                  exerciseNotes: {
                    ...draft.exerciseNotes,
                    [exercise.id]: notes,
                  },
                  updatedAt: Date.now(),
                })
              }
            />
          ))}
        </section>
      )}
      {canShowPlan && day.type === "conditioning" && (
        <IntervalTimer
          state={draft.conditioning}
          onChange={(conditioning) =>
            onDraft({ ...draft, conditioning, updatedAt: Date.now() })
          }
        />
      )}{" "}
      {day.type === "recovery" && (
        <RecoveryGrid
          modules={day.recovery ?? []}
          draft={draft}
          onChange={onDraft}
        />
      )}
      <section className="workout-notes">
        <div>
          <Save />
          <span>Session notes</span>
          <h2>Workout notes</h2>
        </div>
        <Textarea
          placeholder="Overall performance, pain, wins and adjustments for next time…"
          rows={4}
          value={draft.workoutNotes}
          onChange={(e) =>
            onDraft({
              ...draft,
              workoutNotes: e.target.value,
              updatedAt: Date.now(),
            })
          }
        />
      </section>
      <section className="bottom-actions">
        <div>
          <strong>
            {completeReady
              ? "Required work is recorded"
              : "Session is still incomplete"}
          </strong>
          <span>
            {completeReady
              ? "Ready to save as completed."
              : "You can keep training, save a modified session, or end early."}
          </span>
        </div>
        <Button
          variant="ghost"
          className="danger-ghost"
          onClick={() => setConfirming("discard")}
        >
          Discard draft
        </Button>
        <Button
          className="finish-button"
          onClick={() => setConfirming("finish")}
          disabled={currentElapsed(draft) === 0 && progressDone === 0}
        >
          <Check />
          Finish workout
        </Button>
      </section>
      {confirming === "finish" && (
        <section className="finish-confirm" role="alert">
          <div>
            <Check />
            <span>How should this session be saved?</span>
            <p>
              {completeReady
                ? "All required work is recorded."
                : "Some prescribed work or required set fields are missing."}{" "}
              The journal will preserve the selected status.
            </p>
          </div>
          <div className="finish-options">
            <Button variant="outline" onClick={() => setConfirming(null)}>
              Keep training
            </Button>
            <Button variant="outline" onClick={() => finish("ended-early")}>
              End early
            </Button>
            <Button variant="outline" onClick={() => finish("modified")}>
              Save modified
            </Button>
            <Button
              className="primary-cta"
              onClick={() => finish("complete")}
              disabled={!completeReady}
            >
              Save completed
            </Button>
          </div>
        </section>
      )}
      {confirming === "discard" && (
        <section className="finish-confirm discard-confirm" role="alert">
          <div>
            <AlertTriangle />
            <span>Discard this draft?</span>
            <p>
              This permanently removes the unsaved timer, entries and notes for
              Day {day.id} on this device.
            </p>
          </div>
          <div>
            <Button variant="outline" onClick={() => setConfirming(null)}>
              Keep draft
            </Button>
            <Button className="danger-button" onClick={onDiscard}>
              Discard draft
            </Button>
          </div>
        </section>
      )}
    </main>
  );
}

function CoachView() {
  return (
    <main className="page-shell coach-page">
      <section className="coach-hero">
        <div className="eyebrow">
          <ShieldCheck />
          Smith Luck coaching charter
        </div>
        <h1>Train with intent.</h1>
        <p>
          Muscle and strength lead. Recovery governs. Every session also
          protects cardiovascular fitness, snowboard capability and the long
          game.
        </p>
      </section>
      <section className="goal-list">
        {coachingGoals.map((goal, index) => (
          <article key={goal}>
            <span>{pad(index + 1)}</span>
            <p>{goal}</p>
            {index === 0 ? (
              <strong>PRIMARY</strong>
            ) : index === 3 ? (
              <strong>GUARDRAIL</strong>
            ) : null}
          </article>
        ))}
      </section>
      <section className="coach-framework">
        <article>
          <HeartPulse />
          <span>Daily</span>
          <h2>Readiness diagnosis</h2>
          <p>
            Sleep, energy, stress, soreness, motivation, pain and available time
            shape today’s recommendation.
          </p>
        </article>
        <article>
          <Dumbbell />
          <span>Every set</span>
          <h2>Performance evidence</h2>
          <p>
            Weight, reps and RPE determine whether to progress, repeat or reduce
            the next exposure.
          </p>
        </article>
        <article>
          <RotateCcw />
          <span>Every 4 weeks</span>
          <h2>Conjugate review</h2>
          <p>
            Main variations rotate while movement patterns and long-term goals
            remain stable.
          </p>
        </article>
        <article>
          <Target />
          <span>Always</span>
          <h2>No silent goal changes</h2>
          <p>
            Major changes to priorities or programming require your approval.
            Coaching recommendations explain why.
          </p>
        </article>
      </section>
      <section className="coach-boundary">
        <AlertTriangle />
        <div>
          <span>Coaching boundary</span>
          <h2>Training guidance—not medical diagnosis.</h2>
          <p>
            Pain, persistent fatigue, blood-pressure concerns and other health
            issues remain clinician-led.
          </p>
        </div>
      </section>
    </main>
  );
}
function HomeGymView({ onOpen }: { onOpen: (id: number) => void }) {
  return (
    <main className="page-shell gym-page">
      <section className="gym-heading">
        <div>
          <div className="eyebrow">
            <Dumbbell />
            Verified home-gym inventory
          </div>
          <h1>Built for your room.</h1>
          <p>
            Your equipment is a permanent programming constraint for every
            workout and future conjugate rotation.
          </p>
        </div>
        <div className="gym-stamp">
          <Check />
          <strong>PHOTO VERIFIED</strong>
          <span>SEPT 2026</span>
        </div>
      </section>
      <section className="inventory-grid">
        {equipmentGroups.map((group, index) => (
          <article className="inventory-card" key={group.title}>
            <span>{pad(index + 1)}</span>
            <h2>{group.title}</h2>
            <ul>
              {group.items.map((item) => (
                <li key={item}>
                  <Check />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
      <section className="training-rule">
        <div className="training-rule-icon">
          <Dumbbell />
        </div>
        <div>
          <span>Programming guardrail</span>
          <h2>No commercial-machine assumptions.</h2>
          <p>
            No dedicated hamstring-curl machine is assumed. Posterior-chain work
            uses barbell, dumbbell, cable, band and bodyweight options.
          </p>
        </div>
        <div className="rule-actions">
          <Button onClick={() => onOpen(1)}>Upper strength</Button>
          <Button variant="outline" onClick={() => onOpen(2)}>
            Lower strength
          </Button>
        </div>
      </section>
    </main>
  );
}
function HistoryView({
  history,
  onOpen,
}: {
  history: SessionLog[];
  onOpen: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <main className="page-shell history-page">
      <div className="eyebrow">
        <History />
        Training journal
      </div>
      <h1>Session history</h1>
      <p>
        Completed, modified and ended-early sessions are stored on this device
        while the workflow is tested. Supabase remains disconnected.
      </p>
      <section className="history-list">
        {history.length === 0 ? (
          <div className="empty-history">
            <Dumbbell />
            <h2>No saved workouts yet</h2>
            <p>
              Finish a workout and the complete coaching record will appear
              here.
            </p>
            <Button onClick={() => onOpen(((new Date().getDay() + 6) % 7) + 1)}>
              Open a workout
            </Button>
          </div>
        ) : (
          history.map((item) => {
            const completedSets = Object.values(item.exercises ?? {})
              .flatMap((x) => x.sets ?? [])
              .filter((x) => x.done).length;
            const status = item.completionStatus ?? "complete";
            const details = item.readinessDetails;
            const completedRecovery = Object.entries(
              item.recoveryCompleted ?? {},
            ).filter(([, done]) => done);
            return (
              <article className="history-entry" key={item.id}>
                <button
                  className="history-summary"
                  onClick={() =>
                    setExpanded(expanded === item.id ? null : item.id)
                  }
                  aria-expanded={expanded === item.id}
                >
                  <div className="history-day">D{item.dayId}</div>
                  <div>
                    <span>{item.date}</span>
                    <h2>{item.name}</h2>
                    <small>
                      {completedSets
                        ? `${completedSets} completed sets · `
                        : ""}
                      {item.conditioning
                        ? `${item.conditioning.logs.length} conditioning blocks · `
                        : ""}
                      {completedRecovery.length
                        ? `${completedRecovery.length} recovery modules · `
                        : ""}
                      {formatTime(item.duration)}
                    </small>
                  </div>
                  <div className="history-badges">
                    <ReadinessBadge result={item.readiness ?? "unrated"} />
                    <span className={`status-badge ${status}`}>
                      {status.replace("-", " ")}
                    </span>
                  </div>
                  <ChevronDown />
                </button>
                {expanded === item.id && (
                  <div className="history-detail">
                    {details && (
                      <div>
                        <span>Readiness assessment</span>
                        <div className="history-readiness-grid">
                          <b>Sleep {details.sleep}/5</b>
                          <b>Energy {details.energy}/5</b>
                          <b>Stress {details.stress}/5</b>
                          <b>Soreness {details.soreness}/5</b>
                          <b>Motivation {details.motivation}/5</b>
                          <b>{details.time} min available</b>
                        </div>
                        {details.pain && (
                          <p>
                            Pain / problem area:{" "}
                            {details.painArea || "Not specified"}
                          </p>
                        )}
                      </div>
                    )}
                    <div>
                      <span>Session notes</span>
                      <p>{item.workoutNotes || "No session notes recorded."}</p>
                    </div>
                    {Object.entries(item.exercises ?? {}).map(
                      ([exerciseId, log]) => {
                        const exercise = workoutDays
                          .flatMap((d) => d.exercises ?? [])
                          .find((x) => x.id === exerciseId);
                        return (
                          <div key={exerciseId}>
                            <span>{exercise?.name ?? exerciseId}</span>
                            <p>
                              {log.sets
                                .map((set, index) =>
                                  set.left || set.right
                                    ? `S${index + 1}: L ${set.left?.weight || "—"} lb × ${set.left?.reps || "—"} @ ${set.left?.rpe || "—"}; R ${set.right?.weight || "—"} lb × ${set.right?.reps || "—"} @ ${set.right?.rpe || "—"}`
                                    : set.done
                                      ? `S${index + 1}: ${set.weight || "—"} lb × ${set.reps || "—"} @ ${set.rpe || "—"}`
                                      : null,
                                )
                                .filter(Boolean)
                                .join(" · ") || "No completed sets"}
                            </p>
                            {log.notes && <p>Notes: {log.notes}</p>}
                          </div>
                        );
                      },
                    )}
                    {item.conditioning && (
                      <div className="history-conditioning">
                        <span>Conditioning intervals</span>
                        <p>
                          {item.conditioning.completed
                            ? "Full interval session completed."
                            : `Stopped on ${conditioningBlocks[item.conditioning.block]?.name ?? "interval block"} with ${formatShortTime(item.conditioning.remaining)} remaining.`}
                        </p>
                        {item.conditioning.logs.map((log, index) => (
                          <p key={`${log.name}-${index}`}>
                            {log.name} · actual RPE {log.actualRpe || "—"} ·{" "}
                            {log.cadence || "cadence not recorded"}
                          </p>
                        ))}
                      </div>
                    )}
                    {completedRecovery.length > 0 && (
                      <div className="history-recovery">
                        <span>Recovery modules</span>
                        {completedRecovery.map(([id]) => {
                          const recoveryModule = workoutDays[
                            item.dayId - 1
                          ]?.recovery?.find((x) => x.id === id);
                          return (
                            <p key={id}>
                              {recoveryModule?.name ?? id} ·{" "}
                              {item.recoveryDurations[id] ||
                                "duration not recorded"}
                            </p>
                          );
                        })}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => onOpen(item.dayId)}
                    >
                      Repeat this workout
                    </Button>
                  </div>
                )}
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}

export default function HomePage() {
  const [view, setView] = useState<View>("dashboard");
  const [selectedId, setSelectedId] = useState(1);
  const [history, setHistory] = useState<SessionLog[]>([]);
  const [drafts, setDrafts] = useState<Record<number, WorkoutDraft>>({});
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const parse = <T,>(key: string): T | undefined => {
      try {
        const raw = window.localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : undefined;
      } catch {
        return undefined;
      }
    };
    const storedHistory =
      parse<SessionLog[]>("smith-luck-session-history-v2") ??
      parse<SessionLog[]>("smith-luck-session-history");
    if (Array.isArray(storedHistory)) setHistory(storedHistory);
    const storedDrafts = parse<
      Record<number, Partial<WorkoutDraft> & { dayId: number }>
    >("smith-luck-workout-drafts");
    if (storedDrafts)
      setDrafts(
        Object.fromEntries(
          Object.entries(storedDrafts).map(([id, draft]) => [
            Number(id),
            normalizeDraft({ ...draft, dayId: Number(id) }),
          ]),
        ),
      );
    const storedSelected = Number(
      window.localStorage.getItem("smith-luck-selected-workout"),
    );
    setSelectedId(
      storedSelected >= 1 && storedSelected <= 7
        ? storedSelected
        : ((new Date().getDay() + 6) % 7) + 1,
    );
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated)
      window.localStorage.setItem(
        "smith-luck-session-history-v2",
        JSON.stringify(history),
      );
  }, [history, hydrated]);
  useEffect(() => {
    if (hydrated)
      window.localStorage.setItem(
        "smith-luck-workout-drafts",
        JSON.stringify(drafts),
      );
  }, [drafts, hydrated]);
  const openWorkout = useCallback((id: number) => {
    setSelectedId(id);
    window.localStorage.setItem("smith-luck-selected-workout", String(id));
    setDrafts((current) => {
      const next: Record<number, WorkoutDraft> = {};
      for (const [key, value] of Object.entries(current)) {
        const dayId = Number(key);
        next[dayId] = dayId !== id && value.running ? pauseDraft(value) : value;
      }
      if (!next[id]) next[id] = freshDraft(id);
      return next;
    });
    setView("workout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const updateDraft = useCallback(
    (draft: WorkoutDraft) =>
      setDrafts((current) => {
        const next = { ...current };
        for (const [key, value] of Object.entries(next)) {
          if (Number(key) !== draft.dayId && value.running)
            next[Number(key)] = pauseDraft(value);
        }
        next[draft.dayId] = draft;
        return next;
      }),
    [],
  );
  const completeWorkout = useCallback((session: SessionLog) => {
    setHistory((current) => [session, ...current]);
    setDrafts((current) => {
      const next = { ...current };
      delete next[session.dayId];
      return next;
    });
    setView("history");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const discardDraft = useCallback((dayId: number) => {
    setDrafts((current) => {
      const next = { ...current };
      delete next[dayId];
      return next;
    });
    setView("dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const activeDay =
    workoutDays.find((day) => day.id === selectedId) ?? workoutDays[0];
  const activeDraft = drafts[selectedId] ?? freshDraft(selectedId);
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool?: (
            tool: unknown,
            options?: { signal?: AbortSignal },
          ) => void | Promise<void>;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(
      context.registerTool(
        {
          name: "open_workout",
          title: "Open workout",
          description: "Open one of the seven Smith Luck workout days.",
          inputSchema: {
            type: "object",
            properties: { day: { type: "integer", minimum: 1, maximum: 7 } },
            required: ["day"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true, untrustedContentHint: false },
          execute: (input: unknown) => {
            const day = Number((input as { day?: number })?.day);
            if (!Number.isInteger(day) || day < 1 || day > 7)
              throw new Error("Day must be an integer from 1 to 7.");
            openWorkout(day);
            return { day, workout: workoutDays[day - 1].name };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => undefined);
    return () => lifecycle.abort();
  }, [openWorkout]);
  return (
    <div className="app">
      <AppHeader view={view} onView={setView} />
      {view === "dashboard" && (
        <Dashboard
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          onOpen={openWorkout}
          history={history}
          drafts={drafts}
          onCoach={() => setView("coach")}
        />
      )}{" "}
      {view === "workout" && (
        <WorkoutScreen
          day={activeDay}
          draft={activeDraft}
          history={history}
          onBack={() => setView("dashboard")}
          onSelect={openWorkout}
          onDraft={updateDraft}
          onComplete={completeWorkout}
          onDiscard={() => discardDraft(activeDay.id)}
        />
      )}{" "}
      {view === "coach" && <CoachView />}{" "}
      {view === "equipment" && <HomeGymView onOpen={openWorkout} />}{" "}
      {view === "history" && (
        <HistoryView history={history} onOpen={openWorkout} />
      )}
      <footer>
        <ShamrockMark compact />
        <span>SMITH LUCK PERFORMANCE</span>
        <small>Built for strength, capability and the long game.</small>
      </footer>
    </div>
  );
}
