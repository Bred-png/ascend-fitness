import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Activity, Bell, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useStore, todayKey } from "@/lib/reborn/store";
import type { ThemeMode } from "@/lib/reborn/types";
import {
  requestNotificationPermission,
  scheduleDaily,
  sendTestNotification,
  webNotificationsSupported,
  type ReminderPayload,
} from "@/lib/reborn/notifications";
import { healthAvailable, readToday, requestHealthPermissions } from "@/lib/reborn/health";

const THEMES: ThemeMode[] = ["light", "dark", "system"];

export function SettingsPanel() {
  const { state, streak, todayLogged, updateSettings, setTheme, goalStats, logWorkout } = useStore();
  const s = state.settings;
  const [healthReady, setHealthReady] = useState(false);
  const [suggestion, setSuggestion] = useState<{ steps: number; kcal: number; minutes: number } | null>(
    null,
  );

  const payload = (): ReminderPayload => ({
    workoutPending: !todayLogged,
    mentalPending: state.goals.filter((g) => !g.archived && !goalStats(g.id).loggedToday).length,
    streakAtRisk: streak > 0 && !todayLogged,
    hero: (state.profile?.path ?? "hero") === "hero",
  });

  useEffect(() => {
    void healthAvailable().then(setHealthReady);
  }, []);

  useEffect(() => {
    void scheduleDaily(s.notifications, payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.notifications, todayLogged, state.mentalLogs.length]);

  const setNotif = (patch: Partial<typeof s.notifications>) =>
    updateSettings({ notifications: { ...s.notifications, ...patch } });

  const toggleEnabled = async (on: boolean) => {
    if (!on) {
      setNotif({ enabled: false });
      return;
    }
    const ok = await requestNotificationPermission();
    if (!ok) {
      toast.error("Notification permission denied");
      return;
    }
    setNotif({ enabled: true });
    toast.success("Daily reminders on");
  };

  const syncHealth = async () => {
    const data = await readToday();
    if (!data) {
      toast("Health data isn't available here — log cardio manually.");
      return;
    }
    setSuggestion({ steps: data.steps, kcal: data.activeKcal, minutes: data.workoutMinutes });
  };

  return (
    <>
      <Card className="card-elevated mt-4">
        <CardContent className="space-y-3 pt-5">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Moon className="size-4" /> Appearance
          </p>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold capitalize ${
                  s.theme === t ? "border-primary bg-primary/10" : "border-border bg-surface"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Light and dark both keep your {state.profile?.path === "villain" ? "villain" : "hero"}{" "}
            palette.
          </p>
        </CardContent>
      </Card>

      <Card className="card-elevated mt-4">
        <CardContent className="space-y-4 pt-5">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Bell className="size-4" /> Daily reminders
            </p>
            <Switch checked={s.notifications.enabled} onCheckedChange={(v) => void toggleEnabled(v)} />
          </div>

          {!webNotificationsSupported() && (
            <p className="text-xs text-muted-foreground">
              This browser can&apos;t show notifications. Install the iOS build for local reminders.
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="rtime">Reminder time</Label>
            <Input
              id="rtime"
              type="time"
              value={s.notifications.time}
              onChange={(e) => setNotif({ time: e.target.value })}
            />
          </div>

          {(
            [
              ["workout", "Workout not logged"],
              ["mental", "Mind goals pending"],
              ["streak", "Streak at risk"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm">{label}</span>
              <Switch
                checked={s.notifications[key]}
                onCheckedChange={(v) => setNotif({ [key]: v })}
              />
            </div>
          ))}

          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              const ok = await sendTestNotification(s.notifications, payload());
              if (!ok) toast.error("Enable notifications first");
            }}
          >
            Send a test reminder
          </Button>
        </CardContent>
      </Card>

      <Card className="card-elevated mt-4">
        <CardContent className="space-y-3 pt-5">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Activity className="size-4" /> Apple Health
            </p>
            <Switch
              checked={s.healthSync}
              onCheckedChange={(v) => updateSettings({ healthSync: v })}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {healthReady
              ? "Connected. Pull today's steps, energy and workouts to suggest a cardio log."
              : "Available in the iOS app build. On web, keep logging cardio manually."}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={async () => {
                const ok = await requestHealthPermissions();
                toast[ok ? "success" : "error"](
                  ok ? "Health access granted" : "Health access unavailable here",
                );
              }}
            >
              Grant access
            </Button>
            <Button className="flex-1" onClick={() => void syncHealth()}>
              Sync today
            </Button>
          </div>

          {suggestion && (
            <div className="rounded-xl border border-dashed border-border p-3">
              <p className="text-sm">
                {suggestion.steps.toLocaleString()} steps · {suggestion.kcal} kcal ·{" "}
                {suggestion.minutes} min
              </p>
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  disabled={todayLogged}
                  onClick={() => {
                    logWorkout(`Cardio ${suggestion.minutes} min`, 40, {
                      date: todayKey(),
                      source: "health",
                    });
                    setSuggestion(null);
                    toast.success("Cardio logged from Health");
                  }}
                >
                  Confirm log
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSuggestion(null)}>
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="card-elevated mt-4">
        <CardContent className="space-y-3 pt-5">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <span className="text-primary">✨</span> Google AI Studio / Gemini Vision
          </p>
          <p className="text-xs text-muted-foreground">
            Connect your free Google AI Studio API key for deep multimodal physique scanning and muscle mass distribution estimation.
          </p>
          <div className="space-y-2">
            <Label htmlFor="gemini-key">Gemini API Key (Optional)</Label>
            <Input
              id="gemini-key"
              type="password"
              placeholder="AIzaSy..."
              defaultValue={s.geminiApiKey || ""}
              onBlur={(e) => {
                const key = e.target.value.trim();
                updateSettings({ geminiApiKey: key });
                toast.success(key ? "Gemini API key saved" : "Gemini API key cleared");
              }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Zero cost on the Gemini free tier. If omitted, Reborn uses built-in biomechanical baseline estimates.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
