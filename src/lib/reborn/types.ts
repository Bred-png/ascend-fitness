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
  steps?: number;
  activeKcal?: number;
  cardioMinutes?: number;
  source?: "manual" | "health";
}

/* ---------------- Mental training ---------------- */

export type MentalCategory = "language" | "reading" | "skill" | "other";

export interface MentalGoal {
  id: string;
  name: string;
  category: MentalCategory;
  /** sessions targeted per week; 7 = daily */
  perWeek: number;
  targetDate?: string;
  milestoneTarget?: number;
  archived: boolean;
  createdAt: string;
}

export interface MentalLog {
  id: string;
  goalId: string;
  date: string; // yyyy-mm-dd
  minutes?: number;
  note?: string;
  xp: number;
}

/* ---------------- Settings ---------------- */

export type ThemeMode = "light" | "dark" | "system";

export interface NotificationSettings {
  enabled: boolean;
  time: string; // HH:mm
  workout: boolean;
  mental: boolean;
  streak: boolean;
}

export interface Settings {
  theme: ThemeMode;
  notifications: NotificationSettings;
  healthSync: boolean;
}

export interface AppState {
  profile: Profile | null;
  plan: Plan | null;
  logs: LogEntry[];
  xp: number;
  bodyXp: number;
  mindXp: number;
  badges: string[];
  goals: MentalGoal[];
  mentalLogs: MentalLog[];
  settings: Settings;
}
