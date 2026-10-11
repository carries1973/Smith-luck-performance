type Entry = { weight: string; reps: string; rpe: string; done: boolean };
type Row = Entry & { sides?: { left: Entry; right: Entry } };
type Prescription = { id: string; reps: string };
export const isPerSide = (exercise: Prescription) => exercise.reps.includes('/ side') || exercise.id === 'curl';
export const measurement = (exercise?: Prescription) => exercise?.reps.includes('sec') ? 'Seconds' : exercise?.reps.includes('min') ? 'Minutes' : 'Reps';
export const completedSet = (row: Row) => row.sides ? row.sides.left.done || row.sides.right.done : row.done;
const validEntry = (entry: Entry) => entry.done && Number(entry.reps) > 0 && Number(entry.rpe) >= 1 && Number(entry.rpe) <= 10;
export const validSet = (row: Row | undefined, perSide: boolean) => !!row && (perSide ? !!row.sides && validEntry(row.sides.left) && validEntry(row.sides.right) : validEntry(row));
export function describeSet(row: Row, index: number, exercise?: Prescription) {
  const unit = measurement(exercise);
  const describe = (entry: Entry) => `${entry.weight ? `${entry.weight} lb × ` : ''}${entry.reps || '—'}${unit === 'Reps' ? ' reps' : unit === 'Seconds' ? ' sec' : ' min'} @ RPE ${entry.rpe || '—'}`;
  if (row.sides) return `S${index + 1}: ${(['left', 'right'] as const).map(side => `${side === 'left' ? 'L' : 'R'} ${row.sides![side].done ? describe(row.sides![side]) : 'not completed'}`).join(' · ')}`;
  return `S${index + 1}: ${describe(row)}${exercise && isPerSide(exercise) ? ' (combined entry)' : ''}`;
}
