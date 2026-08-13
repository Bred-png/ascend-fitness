import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, Trophy, CalendarCheck, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/components/reborn/AppShell";
import { Onboarding } from "@/components/reborn/Onboarding";
import { useStore } from "@/lib/reborn/store";
import { COPY } from "@/lib/reborn/generator";
import { BADGES, rankProgress } from "@/lib/reborn/ranks";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Reborn — Your Daily Training Dashboard" },
      {
        name: "description",
        content:
          "Track today's session, your streak, rank and weekly progress on the hero or villain path.",
      },
      { property: "og:title", content: "Reborn — Your Daily Training Dashboard" },
      {
        property: "og:description",
        content: "Today's workout, streak, rank and weekly progress in one card-based dashboard.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { state, ready, streak, todayLogged, logWorkout } = useStore();

  if (!ready) return <div className="min-h-screen bg-background" />;
  if (!state.profile || !state.plan) return <Onboarding />;

  const path = state.profile.path;
  const todayIdx = (new Date().getDay() + 6) % 7;
  const today = state.plan.days[todayIdx]!;
  const rank = rankProgress(path, state.xp);
  const last7 = weeklyCount(state.logs.map((l) => l.date));

  return (
    <AppShell>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {path === "hero" ? "Duty calls" : "The world waits"}
      </p>
      <h1 className="mt-1 font-display text-3xl">{state.profile.name}</h1>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat icon={<Flame className="size-4" />} label="Streak" value={`${streak}d`} />
        <Stat icon={<Zap className="size-4" />} label="XP" value={state.xp} />
        <Stat icon={<CalendarCheck className="size-4" />} label="Logged" value={state.logs.length} />
      </div>

      <Card className="card-elevated mt-4 overflow-hidden">
        <div className="h-1.5 w-full bg-hype" />
        <CardContent className="pt-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Today</p>
              <h2 className="font-display text-2xl">{today.title}</h2>
            </div>
            <Badge variant={today.rest ? "secondary" : "default"}>
              {today.rest ? "Rest" : today.focus}
            </Badge>
          </div>

          <div className="mt-4 space-y-2">
            {today.blocks.map((b) => (
              <div
                key={b.name}
                className="flex items-center justify-between rounded-xl bg-surface px-3 py-2"
              >
                <span className="text-sm font-medium">{b.name}</span>
                <span className="text-xs text-muted-foreground">
                  {b.sets} × {b.reps} · {b.restSec}s
                </span>
              </div>
            ))}
            {today.cardio && (
              <div className="rounded-xl border border-dashed border-border px-3 py-2 text-sm">
                <span className="text-muted-foreground">Cardio: </span>
                {today.cardio}
              </div>
            )}
          </div>

          <Button
            className="mt-5 w-full bg-hype font-display tracking-wide text-primary-foreground"
            size="lg"
            disabled={todayLogged}
            onClick={() => {
              logWorkout(today.title, today.rest ? 20 : 60);
              toast.success(COPY[path].logDone);
            }}
          >
            {todayLogged ? "Completed today" : today.rest ? "Log recovery day" : "Log session"}
          </Button>
        </CardContent>
      </Card>

      <Card className="card-elevated mt-4">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{rank.current.name}</p>
            <Trophy className="size-4 text-primary" />
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface">
            <div className="h-full bg-hype" style={{ width: `${rank.pct}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {rank.next
              ? `${rank.next.minXp - state.xp} XP until ${rank.next.name}`
              : "Maximum classification reached."}
          </p>
        </CardContent>
      </Card>

      <Card className="card-elevated mt-4">
        <CardContent className="pt-5">
          <p className="text-sm font-semibold">This week</p>
          <div className="mt-3 flex items-end justify-between gap-2">
            {last7.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={`w-full rounded-md ${d.done ? "bg-hype" : "bg-surface"}`}
                  style={{ height: d.done ? 44 : 14 }}
                />
                <span className="text-[10px] text-muted-foreground">{d.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="card-elevated mt-4">
        <CardContent className="pt-5">
          <p className="text-sm font-semibold">Badges</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {BADGES.map((b) => (
              <Badge
                key={b.id}
                variant={state.badges.includes(b.id) ? "default" : "outline"}
                className={state.badges.includes(b.id) ? "" : "opacity-50"}
              >
                {b.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Link
        to="/plan"
        className="mt-4 block rounded-xl border border-border bg-surface px-4 py-3 text-center text-sm font-medium"
      >
        View full weekly plan
      </Link>
    </AppShell>
  );
}

function weeklyCount(dates: string[]) {
  const set = new Set(dates);
  const out: { label: string; done: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({
      label: ["S", "M", "T", "W", "T", "F", "S"][d.getDay()]!,
      done: set.has(d.toISOString().slice(0, 10)),
    });
  }
  return out;
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="card-elevated rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-1 text-muted-foreground">{icon}</div>
      <p className="mt-1 font-display text-xl">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
