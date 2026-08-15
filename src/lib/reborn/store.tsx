import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { generatePlan } from "./generator";
import type {
  AppState,
  LogEntry,
  MentalGoal,
  MentalLog,
  Profile,
  Settings,
  ThemeMode,
} from "./types";

const KEY = "reborn-state-v1";

export const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  notifications: { enabled: false, time: "18:30", workout: true, mental: true, streak: true },
  healthSync: true,
};

const EMPTY: AppState = {
  profile: null,
  plan: null,
  logs: [],
  xp: 0,
  bodyXp: 0,
  mindXp: 0,
  badges: [],
  goals: [],
  mentalLogs: [],
  scans: [],
  settings: DEFAULT_SETTINGS,
};

interface Ctx {
  state: AppState;
  ready: boolean;
  saveProfile: (p: Profile) => void;
  setPath: (path: "hero" | "villain") => void;
  regenerate: () => void;
  logWorkout: (dayTitle: string, xp: number, extra?: Partial<LogEntry>) => void;
  reset: () => void;
  streak: number;
  todayLogged: boolean;
  /* mental */
  addGoal: (g: Omit<MentalGoal, "id" | "createdAt" | "archived">) => void;
  updateGoal: (id: string, patch: Partial<MentalGoal>) => void;
  archiveGoal: (id: string, archived: boolean) => void;
  deleteGoal: (id: string) => void;
  logMental: (goalId: string, opts?: { minutes?: number; note?: string }) => void;
  goalStats: (goalId: string) => { streak: number; total: number; loggedToday: boolean; thisWeek: number };
  /* body scans */
  addBodyScan: (scan: import("./types").BodyScanAnalysis) => void;
  deleteBodyScan: (id: string) => void;
  /* settings */
  updateSettings: (patch: Partial<Settings>) => void;
  setTheme: (t: ThemeMode) => void;
  resolvedTheme: "light" | "dark";
}

const StoreContext = createContext<Ctx | null>(null);

export function todayKey(d = new Date()) {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function computeStreakFromDates(dates: Set<string>) {
  let streak = 0;
  const cursor = new Date();
  if (!dates.has(todayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (dates.has(todayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function computeStreak(logs: { date: string }[]) {
  return computeStreakFromDates(new Set(logs.map((l) => l.date)));
}

function computeBadges(logs: LogEntry[], streak: number, mentalCount: number) {
  const b: string[] = [];
  if (logs.length >= 1) b.push("first");
  if (logs.length >= 10) b.push("ten");
  if (logs.length >= 50) b.push("fifty");
  if (logs.length >= 100) b.push("hundred");
  if (streak >= 7) b.push("week");
  if (streak >= 30) b.push("month");
  if (mentalCount >= 1) b.push("mind1");
  if (mentalCount >= 25) b.push("mind25");
  if (mentalCount >= 100) b.push("mind100");
  return b;
}

function migrate(raw: Partial<AppState>): AppState {
  const merged: AppState = {
    ...EMPTY,
    ...raw,
    scans: raw.scans ?? [],
    settings: { ...DEFAULT_SETTINGS, ...(raw.settings ?? {}) },
  };
  merged.settings.notifications = {
    ...DEFAULT_SETTINGS.notifications,
    ...(raw.settings?.notifications ?? {}),
  };
  if (raw.bodyXp === undefined && raw.mindXp === undefined) {
    merged.bodyXp = raw.xp ?? 0;
    merged.mindXp = 0;
  }
  merged.xp = merged.bodyXp + merged.mindXp;
  return merged;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(EMPTY);
  const [ready, setReady] = useState(false);
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(migrate(JSON.parse(raw) as Partial<AppState>));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => setSystemDark(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, ready]);

  const theme = state.settings.theme;
  const resolvedTheme: "light" | "dark" =
    theme === "system" ? (systemDark ? "dark" : "light") : theme;

  useEffect(() => {
    const path = state.profile?.path;
    const cls = document.documentElement.classList;
    cls.remove("path-hero", "path-villain");
    cls.add(path === "villain" ? "path-villain" : "path-hero");
    cls.toggle("dark", resolvedTheme === "dark");
  }, [state.profile?.path, resolvedTheme]);

  const saveProfile = useCallback((p: Profile) => {
    setState((s) => ({ ...s, profile: p, plan: generatePlan(p) }));
  }, []);

  const setPath = useCallback((path: "hero" | "villain") => {
    setState((s) => (s.profile ? { ...s, profile: { ...s.profile, path } } : s));
  }, []);

  const regenerate = useCallback(() => {
    setState((s) => (s.profile ? { ...s, plan: generatePlan(s.profile) } : s));
  }, []);

  const logWorkout = useCallback((dayTitle: string, xp: number, extra?: Partial<LogEntry>) => {
    setState((s) => {
      const date = todayKey();
      if (s.logs.some((l) => l.date === date)) return s;
      const entry: LogEntry = { date, dayTitle, xp, source: "manual", ...extra };
      const logs: LogEntry[] = [...s.logs, entry];
      const streak = computeStreak(logs);
      const bonus = Math.min(50, streak * 2);
      const bodyXp = s.bodyXp + xp + bonus;
      return {
        ...s,
        logs,
        bodyXp,
        xp: bodyXp + s.mindXp,
        badges: computeBadges(logs, streak, s.mentalLogs.length),
      };
    });
  }, []);

  const reset = useCallback(() => setState({ ...EMPTY, settings: DEFAULT_SETTINGS }), []);

  /* ---------- mental training ---------- */

  const addGoal = useCallback((g: Omit<MentalGoal, "id" | "createdAt" | "archived">) => {
    setState((s) => ({
      ...s,
      goals: [
        ...s.goals,
        { ...g, id: crypto.randomUUID(), createdAt: new Date().toISOString(), archived: false },
      ],
    }));
  }, []);

  const updateGoal = useCallback((id: string, patch: Partial<MentalGoal>) => {
    setState((s) => ({
      ...s,
      goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    }));
  }, []);

  const archiveGoal = useCallback((id: string, archived: boolean) => {
    setState((s) => ({ ...s, goals: s.goals.map((g) => (g.id === id ? { ...g, archived } : g)) }));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      goals: s.goals.filter((g) => g.id !== id),
      mentalLogs: s.mentalLogs.filter((l) => l.goalId !== id),
    }));
  }, []);

  const logMental = useCallback((goalId: string, opts?: { minutes?: number; note?: string }) => {
    setState((s) => {
      const date = todayKey();
      if (s.mentalLogs.some((l) => l.goalId === goalId && l.date === date)) return s;
      const goalLogs = s.mentalLogs.filter((l) => l.goalId === goalId);
      const streak = computeStreak([...goalLogs, { date }]);
      const base = 25;
      const bonus = Math.min(25, streak * 2);
      const xp = base + bonus + Math.min(20, Math.floor((opts?.minutes ?? 0) / 15) * 5);
      const entry: MentalLog = { id: crypto.randomUUID(), goalId, date, xp, ...opts };
      const mentalLogs = [...s.mentalLogs, entry];
      const mindXp = s.mindXp + xp;
      return {
        ...s,
        mentalLogs,
        mindXp,
        xp: s.bodyXp + mindXp,
        badges: computeBadges(s.logs, computeStreak(s.logs), mentalLogs.length),
      };
    });
  }, []);

  const goalStats = useCallback(
    (goalId: string) => {
      const logs = state.mentalLogs.filter((l) => l.goalId === goalId);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 6);
      return {
        streak: computeStreak(logs),
        total: logs.length,
        loggedToday: logs.some((l) => l.date === todayKey()),
        thisWeek: logs.filter((l) => l.date >= todayKey(weekAgo)).length,
      };
    },
    [state.mentalLogs],
  );

  /* ---------- body scans ---------- */

  const addBodyScan = useCallback((scan: import("./types").BodyScanAnalysis) => {
    setState((s) => {
      const scans = [scan, ...s.scans];
      const scanBonus = 30;
      const bodyXp = s.bodyXp + scanBonus;
      return {
        ...s,
        scans,
        bodyXp,
        xp: bodyXp + s.mindXp,
      };
    });
  }, []);

  const deleteBodyScan = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      scans: s.scans.filter((scan) => scan.id !== id),
    }));
  }, []);

  /* ---------- settings ---------- */

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const setTheme = useCallback((t: ThemeMode) => {
    setState((s) => ({ ...s, settings: { ...s.settings, theme: t } }));
  }, []);

  const streak = useMemo(() => computeStreak(state.logs), [state.logs]);
  const todayLogged = useMemo(() => state.logs.some((l) => l.date === todayKey()), [state.logs]);

  const value: Ctx = {
    state,
    ready,
    saveProfile,
    setPath,
    regenerate,
    logWorkout,
    reset,
    streak,
    todayLogged,
    addGoal,
    updateGoal,
    archiveGoal,
    deleteGoal,
    logMental,
    goalStats,
    addBodyScan,
    deleteBodyScan,
    updateSettings,
    setTheme,
    resolvedTheme,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
