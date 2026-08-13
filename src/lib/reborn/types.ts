export type Path = "hero" | "villain";
export type Level = "beginner" | "intermediate" | "advanced";
export type Goal = "strength" | "weightloss" | "endurance" | "general" | "strongest";
export type Equipment =
  | "bodyweight"
  | "dumbbells"
  | "barbell"
  | "bands"
  | "pullupbar"
  | "kettlebell"
  | "fullgym";

export interface Profile {
  path: Path;
  name: string;
  heightCm: number;
  weightKg: number;
  gender: "male" | "female" | "other";
  equipment: Equipment[];
  goal: Goal;
  level: Level;
  daysPerWeek: number;
}

export interface ExerciseBlock {
  name: string;
  sets: number;
  reps: string;
  restSec: number;
}

export interface DayPlan {
  day: string;
  title: string;
  rest: boolean;
  focus: string;
  blocks: ExerciseBlock[];
  cardio?: string;
}

export interface Plan {
  createdAt: string;
  days: DayPlan[];
}

export interface LogEntry {
  date: string; // yyyy-mm-dd
  dayTitle: string;
  xp: number;
  weightKg?: number;
}

export interface AppState {
  profile: Profile | null;
  plan: Plan | null;
  logs: LogEntry[];
  xp: number;
  badges: string[];
}
