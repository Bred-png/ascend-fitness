import type { Path } from "./types";

export interface Rank {
  name: string;
  minXp: number;
  /** cost multiplier applied to the base rate to reach this rank */
  multiplier: number;
}

/**
 * XP curve.
 * Base rate is the XP needed for one "linear" rank-up. Each rank defines a
 * multiplier on that base rate — early ranks are cheap, upper tiers get
 * sharply more expensive (diminishing returns). Tune the numbers here only.
 */
export const BASE_STEP = 350;

interface RankDef {
  name: string;
  multiplier: number;
}

const HERO_DEFS: RankDef[] = [
  { name: "Unregistered", multiplier: 0 },
  { name: "Rank F — Rookie Guard", multiplier: 0.5 },
  { name: "Rank D — Street Sentinel", multiplier: 1 },
  { name: "Rank C — City Defender", multiplier: 1.5 },
  { name: "Rank B — Storm Bringer", multiplier: 2 },
  { name: "Rank A — Skyline Champion", multiplier: 4 }, // sharp jump (2x prior rate)
  { name: "Rank S — Absolute Beacon", multiplier: 12 }, // steepest jump (3x again)
];

const VILLAIN_DEFS: RankDef[] = [
  { name: "Unlisted", multiplier: 0 },
  { name: "Threat: Ember", multiplier: 0.5 },
  { name: "Threat: Wolf", multiplier: 1 },
  { name: "Threat: Serpent", multiplier: 1.5 },
  { name: "Threat: Leviathan", multiplier: 2 },
  { name: "Threat: Eclipse", multiplier: 4 }, // sharp jump
  { name: "Threat: Cataclysm", multiplier: 12 }, // steepest jump
];

function build(defs: RankDef[]): Rank[] {
  let acc = 0;
  return defs.map((d) => {
    acc += Math.round(d.multiplier * BASE_STEP);
    return { name: d.name, minXp: acc, multiplier: d.multiplier };
  });
}

export const HERO_RANKS: Rank[] = build(HERO_DEFS);
export const VILLAIN_RANKS: Rank[] = build(VILLAIN_DEFS);

export function ranksFor(path: Path) {
  return path === "hero" ? HERO_RANKS : VILLAIN_RANKS;
}

export function rankProgress(path: Path, xp: number) {
  const ranks = ranksFor(path);
  let idx = 0;
  for (let i = 0; i < ranks.length; i++) if (xp >= ranks[i]!.minXp) idx = i;
  const current = ranks[idx]!;
  const next = ranks[idx + 1];
  const span = next ? next.minXp - current.minXp : 1;
  const pct = next ? Math.min(100, Math.max(0, ((xp - current.minXp) / span) * 100)) : 100;
  return {
    current,
    next,
    pct,
    index: idx,
    total: ranks.length,
    toNext: next ? Math.max(0, next.minXp - xp) : 0,
    /** how much harder this tier is than the base linear rate */
    difficulty: next ? next.multiplier : current.multiplier,
  };
}

export const BADGES: { id: string; label: string; hint: string }[] = [
  { id: "first", label: "First Step", hint: "Log your first session" },
  { id: "week", label: "7-Day Streak", hint: "Train 7 days in a row" },
  { id: "month", label: "30-Day Streak", hint: "Train 30 days in a row" },
  { id: "ten", label: "10 Sessions", hint: "Log 10 workouts" },
  { id: "fifty", label: "50 Sessions", hint: "Log 50 workouts" },
  { id: "hundred", label: "100 Sessions", hint: "Log 100 workouts" },
  { id: "mind1", label: "Opened Book", hint: "Log your first mental session" },
  { id: "mind25", label: "Sharpened", hint: "25 mental sessions" },
  { id: "mind100", label: "Second Brain", hint: "100 mental sessions" },
];
