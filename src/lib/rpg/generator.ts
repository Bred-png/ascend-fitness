import type { ExperienceLevel, ProfileRow } from "./types";

export interface GeneratedExercise {
  name: string;
  sets: number;
  reps: string;
  rest_sec: number;
  tempo: string;
  difficulty: string;
  progression_target: string;
  why: string;
  alternatives: string[];
}

export interface GeneratedDay {
  day_index: number;
  title: string;
  focus: string;
  is_rest: boolean;
  cardio: string | null;
  est_minutes: number;
  exercises: GeneratedExercise[];
}

export interface GeneratedPlan {
  title: string;
  rationale: string;
  days: GeneratedDay[];
}

type Equip = string[];

const has = (e: Equip, ...keys: string[]) => keys.some((k) => e.includes(k));

interface Move {
  name: string;
  needs: (e: Equip) => boolean;
  pattern: string;
  why: string;
  alts: string[];
}

const LIB: Record<string, Move[]> = {
  push: [
    {
      name: "Barbell Bench Press",
      needs: (e) => has(e, "barbell", "fullgym"),
      pattern: "horizontal push",
      why: "Highest-load horizontal press available to you — the main driver of chest and triceps size.",
      alts: ["Dumbbell Bench Press", "Weighted Push-Up"],
    },
    {
      name: "Dumbbell Bench Press",
      needs: (e) => has(e, "dumbbells", "fullgym"),
      pattern: "horizontal push",
      why: "Free-weight pressing with a longer range of motion than a bar, and it fixes side-to-side imbalances.",
      alts: ["Push-Up", "Machine Chest Press"],
    },
    {
      name: "Push-Up",
      needs: () => true,
      pattern: "horizontal push",
      why: "Scalable pressing you can do anywhere; load it by slowing the tempo or elevating the feet.",
      alts: ["Incline Push-Up", "Deficit Push-Up"],
    },
    {
      name: "Overhead Press",
      needs: (e) => has(e, "barbell", "dumbbells", "kettlebell", "fullgym"),
      pattern: "vertical push",
      why: "Builds the shoulder shape that makes a physique read as powerful, and strengthens the whole trunk.",
      alts: ["Pike Push-Up", "Band Overhead Press"],
    },
    {
      name: "Pike Push-Up",
      needs: () => true,
      pattern: "vertical push",
      why: "Bodyweight vertical pressing — the stepping stone toward handstand work.",
      alts: ["Overhead Press", "Elevated Pike Push-Up"],
    },
    {
      name: "Dip",
      needs: (e) => has(e, "pullupbar", "fullgym"),
      pattern: "horizontal push",
      why: "Brutal lower-chest and triceps builder with a deep stretch under load.",
      alts: ["Bench Dip", "Close-Grip Push-Up"],
    },
  ],
  pull: [
    {
      name: "Pull-Up",
      needs: (e) => has(e, "pullupbar", "fullgym"),
      pattern: "vertical pull",
      why: "The single best upper-back and lat builder; also the clearest strength-to-bodyweight benchmark.",
      alts: ["Band-Assisted Pull-Up", "Lat Pulldown"],
    },
    {
      name: "Lat Pulldown",
      needs: (e) => has(e, "machines", "fullgym"),
      pattern: "vertical pull",
      why: "Trains the same pattern as a pull-up with a load you can dial in precisely.",
      alts: ["Pull-Up", "Band Pulldown"],
    },
    {
      name: "Barbell Row",
      needs: (e) => has(e, "barbell", "fullgym"),
      pattern: "horizontal pull",
      why: "Heavy horizontal pulling thickens the mid-back and protects your pressing shoulders.",
      alts: ["Dumbbell Row", "Inverted Row"],
    },
    {
      name: "Dumbbell Row",
      needs: (e) => has(e, "dumbbells", "kettlebell", "fullgym"),
      pattern: "horizontal pull",
      why: "One side at a time, so the stronger side can't take over.",
      alts: ["Inverted Row", "Band Row"],
    },
    {
      name: "Inverted Row",
      needs: () => true,
      pattern: "horizontal pull",
      why: "Bodyweight rowing that scales by changing body angle — no equipment excuses.",
      alts: ["Band Row", "Dumbbell Row"],
    },
    {
      name: "Face Pull",
      needs: (e) => has(e, "bands", "machines", "fullgym"),
      pattern: "rear delt",
      why: "Cheap insurance for shoulder health once your pressing volume climbs.",
      alts: ["Band Pull-Apart", "Reverse Fly"],
    },
  ],
  legs: [
    {
      name: "Back Squat",
      needs: (e) => has(e, "barbell", "fullgym"),
      pattern: "squat",
      why: "The heaviest lower-body pattern you can load; drives total-body strength and hormonal response.",
      alts: ["Goblet Squat", "Split Squat"],
    },
    {
      name: "Goblet Squat",
      needs: (e) => has(e, "dumbbells", "kettlebell", "fullgym"),
      pattern: "squat",
      why: "Teaches an upright torso and deep range while loading the quads hard.",
      alts: ["Air Squat", "Back Squat"],
    },
    {
      name: "Bulgarian Split Squat",
      needs: () => true,
      pattern: "single leg",
      why: "Single-leg work exposes and fixes the imbalance that limits every heavy lift.",
      alts: ["Reverse Lunge", "Step-Up"],
    },
    {
      name: "Romanian Deadlift",
      needs: (e) => has(e, "barbell", "dumbbells", "kettlebell", "fullgym"),
      pattern: "hinge",
      why: "Loads the hamstrings and glutes in a stretched position — the most reliable posterior-chain builder.",
      alts: ["Single-Leg RDL", "Hip Thrust"],
    },
    {
      name: "Nordic Curl Negative",
      needs: () => true,
      pattern: "hinge",
      why: "Eccentric hamstring strength is the best-evidenced protection against sprint injuries.",
      alts: ["Glute Bridge Walkout", "Romanian Deadlift"],
    },
    {
      name: "Air Squat",
      needs: () => true,
      pattern: "squat",
      why: "Volume-friendly squatting; push the set close to failure and it still builds legs.",
      alts: ["Goblet Squat", "Jump Squat"],
    },
  ],
  core: [
    {
      name: "Hollow Body Hold",
      needs: () => true,
      pattern: "anti-extension",
      why: "Trains the trunk to stay rigid under load, which transfers directly to pressing and squatting.",
      alts: ["Dead Bug", "Plank"],
    },
    {
      name: "Hanging Knee Raise",
      needs: (e) => has(e, "pullupbar", "fullgym"),
      pattern: "flexion",
      why: "Loads the abs through a long range while building grip as a bonus.",
      alts: ["Lying Leg Raise", "Reverse Crunch"],
    },
    {
      name: "Side Plank",
      needs: () => true,
      pattern: "anti-lateral flexion",
      why: "Covers the obliques and hip stability that straight-ahead core work misses.",
      alts: ["Suitcase Carry", "Copenhagen Plank"],
    },
    {
      name: "Ab Wheel Rollout",
      needs: (e) => has(e, "fullgym", "machines"),
      pattern: "anti-extension",
      why: "One of the highest-tension anti-extension exercises measured.",
      alts: ["Plank Walkout", "Hollow Body Hold"],
    },
  ],
  power: [
    {
      name: "Explosive Jump Squat",
      needs: () => true,
      pattern: "power",
      why: "Fast, forceful reps recruit the high-threshold fibres that slow grinding never reaches.",
      alts: ["Broad Jump", "Kettlebell Swing"],
    },
    {
      name: "Kettlebell Swing",
      needs: (e) => has(e, "kettlebell", "dumbbells", "fullgym"),
      pattern: "power",
      why: "Trains hip snap and conditioning at the same time with very little joint cost.",
      alts: ["Explosive Jump Squat", "Broad Jump"],
    },
    {
      name: "Clap Push-Up",
      needs: () => true,
      pattern: "power",
      why: "Upper-body speed work — the ceiling on how fast you can produce force.",
      alts: ["Explosive Push-Up", "Medicine Ball Throw"],
    },
  ],
};

function pick(bucket: keyof typeof LIB, equipment: Equip, count: number, seed: number) {
  const available = LIB[bucket]!.filter((m) => m.needs(equipment));
  const out: Move[] = [];
  const patterns = new Set<string>();
  for (let i = 0; i < available.length && out.length < count; i++) {
    const move = available[(i + seed) % available.length]!;
    if (patterns.has(move.pattern) && out.length < count - 1) continue;
    if (out.includes(move)) continue;
    patterns.add(move.pattern);
    out.push(move);
  }
  let i = 0;
  while (out.length < count && i < available.length) {
    const m = available[i++]!;
    if (!out.includes(m)) out.push(m);
  }
  return out;
}

interface Prescription {
  sets: number;
  reps: string;
  rest: number;
  tempo: string;
  target: string;
}

function prescribe(goal: string, level: ExperienceLevel, isCompound: boolean): Prescription {
  const setBase = level === "beginner" ? 3 : level === "intermediate" ? 4 : 5;
  const sets = isCompound ? setBase : Math.max(2, setBase - 1);
  if (goal === "strength")
    return { sets, reps: isCompound ? "4-6" : "6-8", rest: isCompound ? 180 : 120, tempo: "3-0-1", target: "Add 2.5 kg once you hit the top of the range on every set." };
  if (goal === "leaner")
    return { sets, reps: "10-15", rest: 60, tempo: "2-1-1", target: "Keep rest under 60s and beat last week's total reps." };
  if (goal === "endurance")
    return { sets, reps: "15-20", rest: 45, tempo: "2-0-1", target: "Add 2 reps per set each week before adding load." };
  if (goal === "muscle")
    return { sets, reps: isCompound ? "6-10" : "10-14", rest: isCompound ? 120 : 75, tempo: "3-1-1", target: "Stop 1-2 reps short of failure; add load when you clear the top rep." };
  return { sets, reps: isCompound ? "6-10" : "10-12", rest: 90, tempo: "2-1-1", target: "Add reps until the top of the range, then add load." };
}

const SPLITS: Record<number, { title: string; focus: string; buckets: (keyof typeof LIB)[] }[]> = {
  2: [
    { title: "Full Body — Drive", focus: "full body", buckets: ["legs", "push", "pull", "core"] },
    { title: "Full Body — Force", focus: "full body", buckets: ["push", "pull", "legs", "power"] },
  ],
  3: [
    { title: "Push Protocol", focus: "push", buckets: ["push", "push", "core"] },
    { title: "Pull Protocol", focus: "pull", buckets: ["pull", "pull", "core"] },
    { title: "Foundation — Legs", focus: "legs", buckets: ["legs", "legs", "power"] },
  ],
  4: [
    { title: "Upper — Assault", focus: "upper push", buckets: ["push", "pull", "push", "core"] },
    { title: "Lower — Foundation", focus: "legs", buckets: ["legs", "legs", "core"] },
    { title: "Upper — Siege", focus: "upper pull", buckets: ["pull", "push", "pull", "core"] },
    { title: "Lower — Detonation", focus: "legs power", buckets: ["legs", "power", "core"] },
  ],
  5: [
    { title: "Push Protocol", focus: "push", buckets: ["push", "push", "core"] },
    { title: "Pull Protocol", focus: "pull", buckets: ["pull", "pull", "core"] },
    { title: "Foundation — Legs", focus: "legs", buckets: ["legs", "legs", "core"] },
    { title: "Engine Work", focus: "conditioning", buckets: ["power", "core"] },
    { title: "Weak Point Assault", focus: "full body", buckets: ["push", "pull", "legs"] },
  ],
  6: [
    { title: "Push Protocol", focus: "push", buckets: ["push", "push", "core"] },
    { title: "Pull Protocol", focus: "pull", buckets: ["pull", "pull", "core"] },
    { title: "Foundation — Legs", focus: "legs", buckets: ["legs", "legs"] },
    { title: "Push — Volume", focus: "push", buckets: ["push", "push", "core"] },
    { title: "Pull — Volume", focus: "pull", buckets: ["pull", "pull", "core"] },
    { title: "Engine Work", focus: "conditioning", buckets: ["power", "legs", "core"] },
  ],
  7: [
    { title: "Push Protocol", focus: "push", buckets: ["push", "push", "core"] },
    { title: "Pull Protocol", focus: "pull", buckets: ["pull", "pull", "core"] },
    { title: "Foundation — Legs", focus: "legs", buckets: ["legs", "legs"] },
    { title: "Engine Work", focus: "conditioning", buckets: ["power", "core"] },
    { title: "Push — Volume", focus: "push", buckets: ["push", "push"] },
    { title: "Pull — Volume", focus: "pull", buckets: ["pull", "pull"] },
    { title: "Mobility & Recovery", focus: "mobility", buckets: ["core"] },
  ],
};

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const CARDIO_BY_GOAL: Record<string, string> = {
  strength: "10 min easy bike or brisk walk to flush the legs",
  muscle: "15 min incline walk — enough to aid recovery, not enough to eat gains",
  leaner: "20-25 min zone 2, or 8 rounds of 30s hard / 90s easy",
  endurance: "30 min steady run or row at conversational pace",
  allround: "15-20 min zone 2 plus 4 hill sprints",
};

export function generatePlan(profile: {
  path: ProfileRow["path"];
  goal: string | null;
  experience: ExperienceLevel;
  equipment: string[];
  days_per_week: number;
  session_minutes: number;
  weight_kg: number | null;
  height_cm: number | null;
}, priorities: string[] = []): GeneratedPlan {
  const goal = profile.goal ?? "allround";
  const days = Math.min(7, Math.max(2, profile.days_per_week));
  const equipment = profile.equipment.length ? profile.equipment : ["bodyweight"];
  const split = SPLITS[days] ?? SPLITS[4]!;
  const trainingSlots = split.length;
  const restCount = 7 - trainingSlots;

  const priorityBucket = (() => {
    const p = priorities.join(" ").toLowerCase();
    if (p.includes("chest") || p.includes("shoulder") || p.includes("arm")) return "push" as const;
    if (p.includes("back") || p.includes("lat")) return "pull" as const;
    if (p.includes("leg") || p.includes("glute") || p.includes("quad")) return "legs" as const;
    return null;
  })();

  const perDay = profile.session_minutes >= 60 ? 5 : profile.session_minutes >= 45 ? 4 : 3;

  const built: GeneratedDay[] = [];
  let dayIndex = 0;
  let restRemaining = restCount;

  for (let i = 0; i < trainingSlots; i++) {
    const template = split[i]!;
    const buckets = [...template.buckets];
    if (priorityBucket && !buckets.includes(priorityBucket)) buckets.splice(1, 0, priorityBucket);

    const exercises: GeneratedExercise[] = [];
    const used = new Set<string>();
    let slot = 0;
    for (const bucket of buckets) {
      if (exercises.length >= perDay) break;
      const [move] = pick(bucket, equipment, 1, slot + i);
      slot++;
      if (!move || used.has(move.name)) {
        const extra = pick(bucket, equipment, 3, slot + i).find((m) => !used.has(m.name));
        if (!extra) continue;
        used.add(extra.name);
        exercises.push(toExercise(extra, goal, profile.experience, exercises.length === 0));
        continue;
      }
      used.add(move.name);
      exercises.push(toExercise(move, goal, profile.experience, exercises.length === 0));
    }

    built.push({
      day_index: dayIndex++,
      title: template.title,
      focus: template.focus,
      is_rest: false,
      cardio: template.focus === "mobility" ? "20 min easy walk + full mobility flow" : (CARDIO_BY_GOAL[goal] ?? CARDIO_BY_GOAL["allround"]!),
      est_minutes: profile.session_minutes,
      exercises,
    });

    // interleave rest days
    if (restRemaining > 0 && (i + 1) % 2 === 0 && i < trainingSlots - 1) {
      built.push(restDay(dayIndex++));
      restRemaining--;
    }
  }
  while (restRemaining > 0 && built.length < 7) {
    built.push(restDay(dayIndex++));
    restRemaining--;
  }

  built.forEach((d, i) => {
    d.day_index = i;
    d.title = d.is_rest ? d.title : d.title;
  });

  const heroic = profile.path === "hero";
  const rationale = [
    `${days} sessions a week at roughly ${profile.session_minutes} minutes each, built around a ${splitName(days)}.`,
    `Your goal — ${goalLabel(goal)} — sets the rep ranges and rest periods above.`,
    priorities.length ? `Extra volume is aimed at your weakest areas: ${priorities.join(", ")}.` : `Volume is balanced across every pattern until a physique scan says otherwise.`,
    heroic
      ? "Every session is a patrol. Miss one and someone else takes the call."
      : "Every session is a step further out of reach. Weakness is the only thing that gets you caught.",
  ].join(" ");

  return {
    title: heroic ? "Hero Association Training Protocol" : "Threat Escalation Protocol",
    rationale,
    days: built.slice(0, 7),
  };
}

function restDay(index: number): GeneratedDay {
  return {
    day_index: index,
    title: "Recovery",
    focus: "mobility",
    is_rest: true,
    cardio: "Optional 20-30 min walk and 10 min of mobility",
    est_minutes: 20,
    exercises: [],
  };
}

function toExercise(move: Move, goal: string, level: ExperienceLevel, isFirst: boolean): GeneratedExercise {
  const compound = isFirst || ["squat", "hinge", "horizontal push", "vertical push", "vertical pull", "horizontal pull"].includes(move.pattern);
  const p = prescribe(goal, level, compound);
  return {
    name: move.name,
    sets: p.sets,
    reps: p.reps,
    rest_sec: p.rest,
    tempo: p.tempo,
    difficulty: level === "beginner" ? "Foundational" : level === "intermediate" ? "Standard" : "Advanced",
    progression_target: p.target,
    why: move.why,
    alternatives: move.alts,
  };
}

function splitName(days: number) {
  if (days <= 2) return "full-body split";
  if (days === 3) return "push / pull / legs rotation";
  if (days === 4) return "upper-lower split";
  if (days === 5) return "push / pull / legs plus conditioning";
  return "high-frequency push / pull / legs split";
}

function goalLabel(goal: string) {
  return (
    { strength: "raw strength", muscle: "muscle size", leaner: "getting leaner", endurance: "endless stamina", allround: "all-round development" }[
      goal
    ] ?? goal
  );
}
