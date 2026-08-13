/**
 * Apple Health (HealthKit) bridge.
 *
 * On a native iOS build (Capacitor) this dynamically loads the HealthKit
 * plugin. On the web the dynamic import fails and every call resolves to
 * `null`, so the app silently falls back to manual entry.
 */

export interface HealthToday {
  steps: number;
  activeKcal: number;
  workoutMinutes: number;
}

function isNative() {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

async function loadPlugin(): Promise<any | null> {
  if (!isNative()) return null;
  try {
    const spec = "capacitor-health";
    const mod = await import(/* @vite-ignore */ spec);
    return (mod as any).Health ?? null;
  } catch {
    return null;
  }
}

export async function healthAvailable(): Promise<boolean> {
  const plugin = await loadPlugin();
  if (!plugin) return false;
  try {
    const res = await plugin.isHealthAvailable?.();
    return res?.available ?? true;
  } catch {
    return false;
  }
}

export async function requestHealthPermissions(): Promise<boolean> {
  const plugin = await loadPlugin();
  if (!plugin) return false;
  try {
    await plugin.requestHealthPermissions({
      permissions: ["READ_STEPS", "READ_ACTIVE_CALORIES", "READ_WORKOUTS"],
    });
    return true;
  } catch {
    return false;
  }
}

/** Returns today's step count, active energy and workout minutes, or null on web. */
export async function readToday(): Promise<HealthToday | null> {
  const plugin = await loadPlugin();
  if (!plugin) return null;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  try {
    const [steps, kcal, workouts] = await Promise.all([
      plugin.queryAggregated({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        dataType: "steps",
        bucket: "day",
      }),
      plugin.queryAggregated({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        dataType: "active-calories",
        bucket: "day",
      }),
      plugin.queryWorkouts({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        includeHeartRate: false,
includeRoute: false,
        includeSteps: false,
      }),
    ]);
    const sum = (r: any) =>
      (r?.aggregatedData ?? []).reduce((a: number, d: any) => a + (d?.value ?? 0), 0);
    const minutes = (workouts?.workouts ?? []).reduce(
      (a: number, w: any) => a + (w?.duration ?? 0) / 60,
      0,
    );
    return {
      steps: Math.round(sum(steps)),
      activeKcal: Math.round(sum(kcal)),
      workoutMinutes: Math.round(minutes),
    };
  } catch {
    return null;
  }
}
