import type { DayPlan, Equipment, ExerciseBlock, Path, Plan, Profile } from "./types";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type Move = { name: string; equip: Equipment[]; focus: Focus };
type Focus = "push" | "pull" | "legs" | "core" | "full";

const MOVES: Move[] = [
  { name: "Standard Press-Up", equip: ["bodyweight"], focus: "push" },
  { name: "Elevated Diamond Press-Up", equip: ["bodyweight"], focus: "push" },
  { name: "Pike Shoulder Press-Up", equip: ["bodyweight"], focus: "push" },
  { name: "Bench Chest Press", equip: ["dumbbells", "fullgym"], focus: "push" },
  { name: "Overhead Iron Press", equip: ["dumbbells", "barbell", "fullgym"], focus: "push" },
  { name: "Band Chest Fly", equip: ["bands"], focus: "push" },
  { name: "Dead-Hang Pull-Up", equip: ["pullupbar", "fullgym"], focus: "pull" },
  { name: "Under-Grip Row Hold", equip: ["pullupbar", "fullgym"], focus: "pull" },
  { name: "Single-Arm Dumbbell Row", equip: ["dumbbells", "fullgym"], focus: "pull" },
  { name: "Band Pull-Apart", equip: ["bands"], focus: "pull" },
  { name: "Towel Door Row", equip: ["bodyweight"], focus: "pull" },
  { name: "Bodyweight Squat", equip: ["bodyweight"], focus: "legs" },
  { name: "Split Lunge Walk", equip: ["bodyweight"], focus: "legs" },
  { name: "Goblet Squat", equip: ["dumbbells", "kettlebell", "fullgym"], focus: "legs" },
  { name: "Loaded Back Squat", equip: ["barbell", "fullgym"], focus: "legs" },
  { name: "Calf Raise Ladder", equip: ["bodyweight"], focus: "legs" },
  { name: "Hollow Body Hold", equip: ["bodyweight"], focus: "core" },
  { name: "Full Sit-Up", equip: ["bodyweight"], focus: "core" },
  { name: "Forearm Plank", equip: ["bodyweight"], focus: "core" },
  { name: "Weighted Russian Twist", equip: ["dumbbells", "kettlebell", "fullgym"], focus: "core" },
  { name: "Burpee Surge", equip: ["bodyweight"], focus: "full" },
  { name: "Kettlebell Swing", equip: ["kettlebell", "dumbbells", "fullgym"], focus: "full" },
  { name: "Mountain Climber Sprint", equip: ["bodyweight"], focus: "full" },
];

const SPLITS: Record<number, { title: string; focus: Focus[]; rest?: boolean }[]> = {
  2: [
    { title: "Full Body Forge", focus: ["push", "legs", "core"] },
    { title: "Full Body Surge", focus: ["pull", "legs", "full"] },
  ],
  3: [
    { title: "Upper Drive", focus: ["push", "pull", "core"] },
    { title: "Lower Foundation", focus: ["legs", "core"] },
    { title: "Total Output", focus: ["full", "push", "legs"] },
  ],
  4: [
    { title: "Push Trial", focus: ["push", "core"] },
    { title: "Pull Trial", focus: ["pull", "core"] },
    { title: "Leg Trial", focus: ["legs", "core"] },
    { title: "Conditioning Trial", focus: ["full", "core"] },
  ],
  5: [
    { title: "Push Trial", focus: ["push", "core"] },
    { title: "Pull Trial", focus: ["pull", "core"] },
    { title: "Leg Trial", focus: ["legs"] },
    { title: "Engine Day", focus: ["full", "core"] },
    { title: "Full Body Finisher", focus: ["push", "pull", "legs"] },
  ],
  6: [
    { title: "Push Trial", focus: ["push", "core"] },
    { title: "Pull Trial", focus: ["pull", "core"] },
    { title: "Leg Trial", focus: ["legs"] },
    { title: "Engine Day", focus: ["full"] },
    { title: "Upper Repeat", focus: ["push", "pull"] },
    { title: "Lower Repeat", focus: ["legs", "core"] },
  ],
  7: [
    { title: "Push Trial", focus: ["push", "core"] },
    { title: "Pull Trial", focus: ["pull", "core"] },
    { title: "Leg Trial", focus: ["legs"] },
    { title: "Engine Day", focus: ["full"] },
    { title: "Upper Repeat", focus: ["push", "pull"] },
    { title: "Lower Repeat", focus: ["legs", "core"] },
    { title: "Endurance March", focus: ["full", "core"] },
  ],
};

function pickMoves(focus: Focus, equipment: Equipment[], count: number): Move[] {
  const pool = MOVES.filter((m) => m.focus === focus && m.equip.some((e) => equipment.includes(e)));
  const fallback = MOVES.filter((m) => m.focus === focus && m.equip.includes("bodyweight"));
  const list = pool.length ? pool : fallback;
  return list.slice(0, count);
}

export function generatePlan(p: Profile): Plan {
  const equipment: Equipment[] = p.equipment.length ? [...p.equipment] : ["bodyweight"];
  if (!equipment.includes("bodyweight")) equipment.push("bodyweight");

  const levelSets = { beginner: 3, intermediate: 4, advanced: 5 }[p.level];
  const goalRest = { strength: 120, weightloss: 45, endurance: 40, general: 60, strongest: 90 }[
    p.goal
  ];
  const repMap: Record<string, string> = {
    strength: "5-8",
    weightloss: "12-15",
    endurance: "15-20",
    general: "10-12",
    strongest: "8-12",
  };
  const bmi = p.weightKg / Math.pow(p.heightCm / 100, 2);
  const volumeMod = bmi > 30 ? -1 : bmi < 20 ? 0 : 0;
  const movesPerFocus = p.level === "beginner" ? 1 : 2;

  const days = Math.min(7, Math.max(2, p.daysPerWeek));
  const template = SPLITS[days] ?? SPLITS[3]!;

  const cardioBase = { beginner: 1.5, intermediate: 3, advanced: 5 }[p.level];
  const cardioKm =
    p.goal === "endurance" || p.goal === "strongest"
      ? cardioBase * 2
      : p.goal === "weightloss"
        ? cardioBase * 1.5
        : cardioBase;

  const plannedDays: DayPlan[] = [];
  let t = 0;
  for (let i = 0; i < 7; i++) {
    const isTraining = t < days && (7 - i) >= (days - t);
    if (!isTraining) {
      plannedDays.push({
        day: DAY_NAMES[i]!,
        title: "Recovery Protocol",
        rest: true,
        focus: "Rest",
        blocks: [],
        cardio: `Easy walk ${Math.max(1, Math.round(cardioKm / 2))} km + 10 min mobility`,
      });
      continue;
    }
    const tpl = template[t]!;
    t++;
    const blocks: ExerciseBlock[] = [];
    tpl.focus.forEach((f) => {
      pickMoves(f, equipment, movesPerFocus).forEach((m) => {
        blocks.push({
          name: m.name,
          sets: Math.max(2, levelSets + volumeMod + (f === "core" ? -1 : 0)),
          reps:
            f === "core"
              ? m.name.includes("Hold") || m.name.includes("Plank")
                ? "30-60s"
                : "15-20"
              : repMap[p.goal]!,
          restSec: f === "core" ? 30 : goalRest,
        });
      });
    });
    plannedDays.push({
      day: DAY_NAMES[i]!,
      title: tpl.title,
      rest: false,
      focus: tpl.focus.join(" / "),
      blocks,
      cardio: `Run ${cardioKm.toFixed(1)} km at steady pace`,
    });
  }

  return { createdAt: new Date().toISOString(), days: plannedDays };
}

export const COPY: Record<Path, { tagline: string; cta: string; logDone: string; unit: string }> = {
  hero: {
    tagline: "Train in the open. Rise through the Association ranks.",
    cta: "Begin the Hero Program",
    logDone: "Session logged. The city noticed.",
    unit: "Hero Association",
  },
  villain: {
    tagline: "Train in the dark. Escalate your threat classification.",
    cta: "Begin the Villain Program",
    logDone: "Session logged. Your threat level grows.",
    unit: "Threat Registry",
  },
};
