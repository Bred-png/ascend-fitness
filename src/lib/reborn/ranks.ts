import type { Path } from "./types";

export interface Rank {
  name: string;
  minXp: number;
}

export const HERO_RANKS: Rank[] = [
  { name: "Unregistered", minXp: 0 },
  { name: "Rank F — Rookie Guard", minXp: 150 },
  { name: "Rank D — Street Sentinel", minXp: 400 },
  { name: "Rank C — City Defender", minXp: 900 },
  { name: "Rank B — Storm Bringer", minXp: 1800 },
  { name: "Rank A — Skyline Champion", minXp: 3200 },
  { name: "Rank S — Absolute Beacon", minXp: 5500 },
];

export const VILLAIN_RANKS: Rank[] = [
  { name: "Unlisted", minXp: 0 },
  { name: "Threat: Ember", minXp: 150 },
  { name: "Threat: Wolf", minXp: 400 },
  { name: "Threat: Serpent", minXp: 900 },
  { name: "Threat: Leviathan", minXp: 1800 },
  { name: "Threat: Eclipse", minXp: 3200 },
  { name: "Threat: Cataclysm", minXp: 5500 },
];

export function ranksFor(path: Path) {
  return path === "hero" ? HERO_RANKS : VILLAIN_RANKS;
}

export function rankProgress(path: Path, xp: number) {
  const ranks = ranksFor(path);
  let idx = 0;
  for (let i = 0; i < ranks.length; i++) if (xp >= ranks[i].minXp) idx = i;
  const current = ranks[idx];
  const next = ranks[idx + 1];
  const span = next ? next.minXp - current.minXp : 1;
  const pct = next ? Math.min(100, ((xp - current.minXp) / span) * 100) : 100;
  return { current, next, pct, index: idx, total: ranks.length };
}

export const BADGES: { id: string; label: string; hint: string }[] = [
  { id: "first", label: "First Step", hint: "Log your first session" },
  { id: "week", label: "7-Day Streak", hint: "Train 7 days in a row" },
  { id: "month", label: "30-Day Streak", hint: "Train 30 days in a row" },
  { id: "ten", label: "10 Sessions", hint: "Log 10 workouts" },
  { id: "fifty", label: "50 Sessions", hint: "Log 50 workouts" },
  { id: "hundred", label: "100 Sessions", hint: "Log 100 workouts" },
];
