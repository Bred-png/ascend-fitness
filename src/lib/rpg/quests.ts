import type { PathType, QuestKind } from "./types";
import { XP } from "./ranks";

export interface QuestTemplate {
  key: string;
  kind: QuestKind;
  title: string;
  description: string;
  target_label: string;
  xp_reward: number;
  stat_reward: string | null;
}

const DAILY_POOL: Omit<QuestTemplate, "kind">[] = [
  { key: "session", title: "Complete today's session", description: "The plan does not train itself.", target_label: "1 workout", xp_reward: XP.workout, stat_reward: "discipline" },
  { key: "steps", title: "Cover 8,000 steps", description: "Movement outside the gym is still training.", target_label: "8,000 steps", xp_reward: XP.walking, stat_reward: "endurance" },
  { key: "mobility", title: "10 minutes of mobility", description: "Joints you can't move are joints you can't load.", target_label: "10 minutes", xp_reward: XP.mobility, stat_reward: "mobility" },
  { key: "protein", title: "Hit your protein target", description: "You cannot rebuild with nothing to build from.", target_label: "protein goal", xp_reward: XP.nutrition, stat_reward: "physique" },
  { key: "water", title: "Drink your water target", description: "Dehydrated muscle is weak muscle.", target_label: "water goal", xp_reward: XP.nutrition, stat_reward: null },
  { key: "sleep", title: "Sleep 7+ hours", description: "Recovery is when the adaptation actually happens.", target_label: "7 hours", xp_reward: XP.sleep, stat_reward: "physique" },
  { key: "cardio", title: "20 minutes of cardio", description: "Build the engine that carries everything else.", target_label: "20 minutes", xp_reward: XP.cardio, stat_reward: "endurance" },
  { key: "core", title: "3 sets of hard core work", description: "A weak trunk caps every lift you own.", target_label: "3 sets", xp_reward: XP.quest, stat_reward: "physique" },
  { key: "mind", title: "One mind-training check-in", description: "The body is half the fight.", target_label: "1 session", xp_reward: XP.mental, stat_reward: "discipline" },
  { key: "photo", title: "Log a progress photo", description: "Evidence beats memory.", target_label: "1 photo", xp_reward: XP.progressPhoto, stat_reward: null },
];

const BOSS_POOL: Record<PathType, Omit<QuestTemplate, "kind">[]> = {
  hero: [
    { key: "boss_max_pushups", title: "BOSS: The Hundred", description: "Max push-ups in one session, however many sets it takes. Beat your last number.", target_label: "100 push-ups", xp_reward: XP.boss, stat_reward: "power" },
    { key: "boss_distance", title: "BOSS: The Long Patrol", description: "Cover 10 km on foot in a single effort.", target_label: "10 km", xp_reward: XP.boss, stat_reward: "endurance" },
    { key: "boss_pr", title: "BOSS: Break the Ceiling", description: "Set a personal record on any main lift this week.", target_label: "1 PR", xp_reward: XP.boss, stat_reward: "strength" },
    { key: "boss_perfect", title: "BOSS: Perfect Week", description: "Complete every scheduled session with no misses.", target_label: "full week", xp_reward: XP.boss, stat_reward: "discipline" },
  ],
  villain: [
    { key: "boss_max_pushups", title: "BOSS: Overwhelm", description: "Max push-ups in one session, however many sets it takes. Beat your last number.", target_label: "100 push-ups", xp_reward: XP.boss, stat_reward: "power" },
    { key: "boss_distance", title: "BOSS: Scorched Earth", description: "Cover 10 km on foot in a single effort.", target_label: "10 km", xp_reward: XP.boss, stat_reward: "endurance" },
    { key: "boss_pr", title: "BOSS: Escalation", description: "Set a personal record on any main lift this week.", target_label: "1 PR", xp_reward: XP.boss, stat_reward: "strength" },
    { key: "boss_perfect", title: "BOSS: No Witnesses", description: "Complete every scheduled session with no misses.", target_label: "full week", xp_reward: XP.boss, stat_reward: "discipline" },
  ],
};

const MAIN_QUESTS: Record<PathType, Omit<QuestTemplate, "kind">[]> = {
  hero: [
    { key: "main_register", title: "Pass the Entrance Exam", description: "Log 10 sessions to earn your registration.", target_label: "10 sessions", xp_reward: XP.mainQuest, stat_reward: "discipline" },
    { key: "main_reputation", title: "Build a Reputation", description: "Hold a 14-day streak.", target_label: "14-day streak", xp_reward: XP.mainQuest, stat_reward: "discipline" },
    { key: "main_limitbreak", title: "Break Your Limit", description: "Beat a personal record on three different lifts.", target_label: "3 PRs", xp_reward: XP.mainQuest, stat_reward: "strength" },
  ],
  villain: [
    { key: "main_register", title: "Get Noticed", description: "Log 10 sessions before anyone files a report.", target_label: "10 sessions", xp_reward: XP.mainQuest, stat_reward: "discipline" },
    { key: "main_reputation", title: "Spread Fear", description: "Hold a 14-day streak.", target_label: "14-day streak", xp_reward: XP.mainQuest, stat_reward: "discipline" },
    { key: "main_limitbreak", title: "Exceed Containment", description: "Beat a personal record on three different lifts.", target_label: "3 PRs", xp_reward: XP.mainQuest, stat_reward: "strength" },
  ],
};

function seedFor(date: string) {
  return [...date].reduce((a, c) => a + c.charCodeAt(0), 0);
}

/** Deterministic daily quest set — same for a given user+date, so refreshing can't reroll rewards. */
export function dailyQuestsFor(date: string, userId: string, opts: { hasPlanToday: boolean }) {
  const seed = seedFor(date + userId.slice(0, 8));
  const pool = DAILY_POOL.filter((q) => (q.key === "session" ? opts.hasPlanToday : true));
  const chosen: QuestTemplate[] = [];
  const always = pool.find((q) => q.key === "session");
  if (always) chosen.push({ ...always, kind: "daily" });
  const rest = pool.filter((q) => q.key !== "session");
  for (let i = 0; chosen.length < 4 && i < rest.length; i++) {
    const q = rest[(seed + i * 3) % rest.length]!;
    if (chosen.some((c) => c.key === q.key)) continue;
    chosen.push({ ...q, kind: "daily" });
  }
  return chosen;
}

export function bossQuestFor(date: string, userId: string, path: PathType): QuestTemplate {
  const pool = BOSS_POOL[path];
  const seed = seedFor(date + userId.slice(0, 4));
  return { ...pool[seed % pool.length]!, kind: "boss" };
}

export function mainQuestsFor(path: PathType): QuestTemplate[] {
  return MAIN_QUESTS[path].map((q) => ({ ...q, kind: "main" as const }));
}

/** Monday of the week containing `date` (ISO yyyy-mm-dd). */
export function weekStart(date: string) {
  const d = new Date(date + "T00:00:00");
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}
