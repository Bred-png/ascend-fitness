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

/* ---------------- AI Body Scan & Muscle Distribution ---------------- */

export interface MuscleDistribution {
  chest: number; // 0 - 100 estimated development index
  back: number; // 0 - 100
  armsShoulders: number; // 0 - 100
  coreAbs: number; // 0 - 100
  legsGlutes: number; // 0 - 100
}

export type Somatotype = "ectomorph" | "mesomorph" | "endomorph" | "athletic-hybrid";

export interface BodyScanAnalysis {
  id: string;
  date: string; // yyyy-mm-dd HH:mm
  imageDataUrl?: string; // thumbnail preview
  somatotype: Somatotype;
  estimatedBodyFatRange: string; // e.g. "12-15%"
  muscleDistribution: MuscleDistribution;
  symmetryScore: number; // 0 - 100
  overallDevelopmentIndex: number; // 0 - 100
  keyStrengths: string[];
  focusAreas: string[];
  aiSummary: string;
  recommendedPathFocus: string;
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
  geminiApiKey?: string;
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
  scans: BodyScanAnalysis[];
  settings: Settings;
}

