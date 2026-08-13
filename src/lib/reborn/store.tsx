import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { generatePlan } from "./generator";
import type { AppState, LogEntry, Profile } from "./types";

const KEY = "reborn-state-v1";

const EMPTY: AppState = { profile: null, plan: null, logs: [], xp: 0, badges: [] };

interface Ctx {
  state: AppState;
  ready: boolean;
  saveProfile: (p: Profile) => void;
  setPath: (path: "hero" | "villain") => void;
  regenerate: () => void;
  logWorkout: (dayTitle: string, xp: number, weightKg?: number) => void;
  reset: () => void;
  streak: number;
  todayLogged: boolean;
}

const StoreContext = createContext<Ctx | null>(null);

function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function computeStreak(logs: LogEntry[]) {
  const dates = new Set(logs.map((l) => l.date));
  let streak = 0;
  const cursor = new Date();
  if (!dates.has(todayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (dates.has(todayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function computeBadges(logs: LogEntry[], streak: number) {
  const b: string[] = [];
  if (logs.length >= 1) b.push("first");
  if (logs.length >= 10) b.push("ten");
  if (logs.length >= 50) b.push("fifty");
  if (logs.length >= 100) b.push("hundred");
  if (streak >= 7) b.push("week");
  if (streak >= 30) b.push("month");
  return b;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...EMPTY, ...(JSON.parse(raw) as AppState) });
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, ready]);

  useEffect(() => {
    const path = state.profile?.path;
    const cls = document.documentElement.classList;
    cls.remove("path-hero", "path-villain");
    cls.add(path === "villain" ? "path-villain" : "path-hero");
    cls.toggle("dark", path === "villain");
  }, [state.profile?.path]);

  const saveProfile = useCallback((p: Profile) => {
    setState((s) => ({ ...s, profile: p, plan: generatePlan(p) }));
  }, []);

  const setPath = useCallback((path: "hero" | "villain") => {
    setState((s) => (s.profile ? { ...s, profile: { ...s.profile, path } } : s));
  }, []);

  const regenerate = useCallback(() => {
    setState((s) => (s.profile ? { ...s, plan: generatePlan(s.profile) } : s));
  }, []);

  const logWorkout = useCallback((dayTitle: string, xp: number, weightKg?: number) => {
    setState((s) => {
      const date = todayKey();
      if (s.logs.some((l) => l.date === date)) return s;
      const logs = [...s.logs, { date, dayTitle, xp, weightKg }];
      const streak = computeStreak(logs);
      const bonus = Math.min(50, streak * 2);
      return { ...s, logs, xp: s.xp + xp + bonus, badges: computeBadges(logs, streak) };
    });
  }, []);

  const reset = useCallback(() => setState(EMPTY), []);

  const streak = useMemo(() => computeStreak(state.logs), [state.logs]);
  const todayLogged = useMemo(
    () => state.logs.some((l) => l.date === todayKey()),
    [state.logs],
  );

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
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
