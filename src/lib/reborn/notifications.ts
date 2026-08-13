import type { NotificationSettings } from "./types";

function isNative() {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

async function localNotifications() {
  if (!isNative()) return null;
  try {
    const mod = await import("@capacitor/local-notifications");
    return mod.LocalNotifications;
  } catch {
    return null;
  }
}

export function webNotificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestNotificationPermission(): Promise<boolean> {
  const ln = await localNotifications();
  if (ln) {
    const res = await ln.requestPermissions();
    return res.display === "granted";
  }
  if (!webNotificationsSupported()) return false;
  const res = await Notification.requestPermission();
  return res === "granted";
}

export async function registerServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch {
    return null;
  }
}

export interface ReminderPayload {
  workoutPending: boolean;
  mentalPending: number;
  streakAtRisk: boolean;
  hero: boolean;
}

export function buildMessages(s: NotificationSettings, p: ReminderPayload) {
  const out: { id: number; title: string; body: string }[] = [];
  if (s.workout && p.workoutPending)
    out.push({
      id: 1,
      title: p.hero ? "Duty calls" : "The world waits",
      body: "Today's session isn't logged yet. Get it done.",
    });
  if (s.mental && p.mentalPending > 0)
    out.push({
      id: 2,
      title: "Mind training pending",
      body: `${p.mentalPending} mental goal${p.mentalPending > 1 ? "s" : ""} still need a check-in.`,
    });
  if (s.streak && p.streakAtRisk)
    out.push({ id: 3, title: "Streak at risk", body: "Your streak ends tonight unless you train." });
  return out;
}

/** Schedules a repeating daily reminder natively, or sets up an in-page timer on web. */
export async function scheduleDaily(s: NotificationSettings, payload: () => ReminderPayload) {
  const ln = await localNotifications();
  const [hour, minute] = s.time.split(":").map(Number);

  if (ln) {
    await ln.cancel({ notifications: [{ id: 1 }, { id: 2 }, { id: 3 }] });
    if (!s.enabled) return;
    const msgs = buildMessages(s, payload());
    if (!msgs.length) return;
    await ln.schedule({
      notifications: msgs.map((m) => ({
        id: m.id,
        title: m.title,
        body: m.body,
        schedule: { on: { hour: hour ?? 18, minute: minute ?? 30 }, repeats: true, allowWhileIdle: true },
      })),
    });
    return;
  }

  if (!s.enabled || !webNotificationsSupported() || Notification.permission !== "granted") return;
  scheduleWebTimer(s, payload);
}

let webTimer: ReturnType<typeof setInterval> | null = null;
let lastFiredDate = "";

function scheduleWebTimer(s: NotificationSettings, payload: () => ReminderPayload) {
  if (webTimer) clearInterval(webTimer);
  webTimer = setInterval(async () => {
    const now = new Date();
    const [h, m] = s.time.split(":").map(Number);
    const key = now.toDateString();
    if (lastFiredDate === key) return;
    if (now.getHours() < (h ?? 18) || (now.getHours() === (h ?? 18) && now.getMinutes() < (m ?? 30)))
      return;
    lastFiredDate = key;
    const msgs = buildMessages(s, payload());
    const reg = await registerServiceWorker();
    for (const msg of msgs) {
      if (reg) await reg.showNotification(msg.title, { body: msg.body, icon: "/favicon.ico" });
      else new Notification(msg.title, { body: msg.body });
    }
  }, 60_000);
}

export function stopWebTimer() {
  if (webTimer) clearInterval(webTimer);
  webTimer = null;
}

/** Fires the current reminders immediately — used for the "Send test" button. */
export async function sendTestNotification(s: NotificationSettings, p: ReminderPayload) {
  const msgs = buildMessages(s, p);
  const msg = msgs[0] ?? { id: 9, title: "Reborn", body: "All clear today. Nothing pending." };
  const ln = await localNotifications();
  if (ln) {
    await ln.schedule({
      notifications: [{ id: 99, title: msg.title, body: msg.body, schedule: { at: new Date(Date.now() + 2000) } }],
    });
    return true;
  }
  if (!webNotificationsSupported() || Notification.permission !== "granted") return false;
  const reg = await registerServiceWorker();
  if (reg) await reg.showNotification(msg.title, { body: msg.body, icon: "/favicon.ico" });
  else new Notification(msg.title, { body: msg.body });
  return true;
}
