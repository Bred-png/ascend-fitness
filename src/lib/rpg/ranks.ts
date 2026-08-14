import type { PathType } from "./types";

export const LEVELS_PER_TIER = 10;
export const MAX_LEVEL = LEVELS_PER_TIER * 5;

export interface Tier {
  index: number;
  name: string;
  short: string;
  blurb: string;
}

/** Original rank names — inspired by hero-registry tropes, not copied. */
export const HERO_TIERS: Tier[] = [
  { index: 0, name: "Unregistered Trainee", short: "TRAINEE", blurb: "No file. No record. Start moving." },
  { index: 1, name: "C-Class Guardian", short: "C-CLASS", blurb: "Street patrol. Small wins, daily." },
  { index: 2, name: "B-Class Sentinel", short: "B-CLASS", blurb: "District defender. People notice." },
  { index: 3, name: "A-Class Champion", short: "A-CLASS", blurb: "City-scale threats are your job now." },
  { index: 4, name: "S-Class Absolute", short: "S-CLASS", blurb: "The last line. Nothing gets past you." },
];

export const VILLAIN_TIERS: Tier[] = [
  { index: 0, name: "Unlisted Nuisance", short: "UNLISTED", blurb: "Beneath notice. For now." },
  { index: 1, name: "Threat: Prowler", short: "PROWLER", blurb: "Flagged. Patrols avoid your block." },
  { index: 2, name: "Threat: Warlord", short: "WARLORD", blurb: "A standing army would hesitate." },
  { index: 3, name: "Threat: Calamity", short: "CALAMITY", blurb: "Evacuation orders precede you." },
  { index: 4, name: "Threat: Apocalypse", short: "APOCALYPSE", blurb: "There is no counter-measure." },
];

export function tiersFor(path: PathType) {
  return path === "villain" ? VILLAIN_TIERS : HERO_TIERS;
}

const TIER_MULTIPLIER = [1, 1, 1.4, 2, 3];

/** XP required to go from `level` to `level + 1` (1-indexed, global level). */
export function xpToAdvance(level: number) {
  const tier = Math.min(4, Math.floor((level - 1) / LEVELS_PER_TIER));
  return Math.round(120 * Math.pow(1.14, level - 1) * (TIER_MULTIPLIER[tier] ?? 1));
}

/** Cumulative XP needed to reach `level`. */
export function xpForLevel(level: number) {
  let total = 0;
  for (let l = 1; l < level; l++) total += xpToAdvance(l);
  return total;
}

export interface RankState {
  level: number;
  tier: Tier;
  tierIndex: number;
  levelInTier: number;
  xpIntoLevel: number;
  xpForThisLevel: number;
  pct: number;
  xpToNextLevel: number;
  nextTier: Tier | null;
  xpToNextTier: number;
  maxed: boolean;
}

export function rankState(path: PathType, totalXp: number): RankState {
  const tiers = tiersFor(path);
  let level = 1;
  let remaining = Math.max(0, totalXp);
  while (level < MAX_LEVEL && remaining >= xpToAdvance(level)) {
    remaining -= xpToAdvance(level);
    level++;
  }
  const tierIndex = Math.min(4, Math.floor((level - 1) / LEVELS_PER_TIER));
  const need = xpToAdvance(level);
  const maxed = level >= MAX_LEVEL;
  const nextTierIndex = tierIndex + 1;
  const nextTier = tiers[nextTierIndex] ?? null;
  const nextTierLevel = nextTierIndex * LEVELS_PER_TIER + 1;
  return {
    level,
    tier: tiers[tierIndex]!,
    tierIndex,
    levelInTier: ((level - 1) % LEVELS_PER_TIER) + 1,
    xpIntoLevel: remaining,
    xpForThisLevel: need,
    pct: maxed ? 100 : Math.min(100, (remaining / need) * 100),
    xpToNextLevel: maxed ? 0 : need - remaining,
    nextTier,
    xpToNextTier: nextTier ? Math.max(0, xpForLevel(nextTierLevel) - totalXp) : 0,
    maxed,
  };
}

/* ---------------- XP rewards & anti-farming ---------------- */

export const XP = {
  workout: 100,
  workoutProgression: 125,
  quest: 25,
  hardQuest: 60,
  mainQuest: 250,
  boss: 350,
  mobility: 40,
  cardio: 60,
  walking: 25,
  nutrition: 25,
  sleep: 25,
  personalRecord: 100,
  progressPhoto: 50,
  weeklyPlanBonus: 300,
  mental: 25,
} as const;

/** Daily XP ceiling. Everything above this is discarded to stop farming. */
export const DAILY_XP_CAP = 600;

export function streakMultiplier(streak: number) {
  if (streak >= 30) return 1.5;
  if (streak >= 14) return 1.3;
  if (streak >= 7) return 1.2;
  if (streak >= 3) return 1.1;
  return 1;
}

export const STAT_KEYS = [
  "strength",
  "power",
  "endurance",
  "speed",
  "mobility",
  "physique",
  "discipline",
] as const;

export type StatKey = (typeof STAT_KEYS)[number];

export const STAT_LABELS: Record<StatKey, string> = {
  strength: "Strength",
  power: "Power",
  endurance: "Endurance",
  speed: "Speed",
  mobility: "Mobility",
  physique: "Physique",
  discipline: "Discipline",
};

/** Which stats a training focus develops. */
export function statsForFocus(focus: string): StatKey[] {
  const f = focus.toLowerCase();
  if (f.includes("push") || f.includes("chest") || f.includes("upper")) return ["strength", "power", "physique"];
  if (f.includes("pull") || f.includes("back")) return ["strength", "physique"];
  if (f.includes("leg") || f.includes("lower")) return ["strength", "power", "endurance"];
  if (f.includes("condition") || f.includes("cardio") || f.includes("engine")) return ["endurance", "speed"];
  if (f.includes("mobility") || f.includes("recovery")) return ["mobility", "discipline"];
  if (f.includes("core") || f.includes("full")) return ["physique", "endurance", "discipline"];
  return ["physique", "discipline"];
}
