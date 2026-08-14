export type PathType = "hero" | "villain";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type QuestKind = "daily" | "main" | "boss";
export type PhotoKind = "current" | "target" | "progress";

export const EQUIPMENT_OPTIONS = [
  { id: "bodyweight", label: "Bodyweight only" },
  { id: "dumbbells", label: "Dumbbells" },
  { id: "barbell", label: "Barbell + rack" },
  { id: "kettlebell", label: "Kettlebell" },
  { id: "bands", label: "Resistance bands" },
  { id: "pullupbar", label: "Pull-up bar" },
  { id: "machines", label: "Machines" },
  { id: "fullgym", label: "Full gym" },
] as const;

export const GOAL_OPTIONS = [
  { id: "strength", label: "Raw strength", blurb: "Move heavier things than yesterday." },
  { id: "muscle", label: "Build muscle", blurb: "Visible size and density." },
  { id: "leaner", label: "Get leaner", blurb: "Strip fat, keep the engine." },
  { id: "endurance", label: "Endless stamina", blurb: "Never gas out." },
  { id: "allround", label: "Complete monster", blurb: "Balanced across every stat." },
] as const;

export interface ProfileRow {
  id: string;
  username: string | null;
  path: PathType;
  gender: string | null;
  birth_year: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  experience: ExperienceLevel;
  goal: string | null;
  equipment: string[];
  days_per_week: number;
  session_minutes: number;
  onboarding_step: string;
  onboarded: boolean;
  timezone: string;
}

export interface ProgressionRow {
  user_id: string;
  total_xp: number;
  body_xp: number;
  mind_xp: number;
  rank_tier: number;
  rank_level: number;
  strength: number;
  power: number;
  endurance: number;
  speed: number;
  mobility: number;
  physique: number;
  discipline: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  total_workouts: number;
}

export function bmi(heightCm: number | null, weightKg: number | null) {
  if (!heightCm || !weightKg) return null;
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export function bmiBand(value: number) {
  if (value < 18.5) return { label: "Underweight", tone: "warn" as const };
  if (value < 25) return { label: "Healthy range", tone: "good" as const };
  if (value < 30) return { label: "Overweight", tone: "warn" as const };
  return { label: "Obese range", tone: "bad" as const };
}

export function todayKey(d = new Date()) {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
