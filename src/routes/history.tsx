import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/reborn/AppShell";
import { Onboarding } from "@/components/reborn/Onboarding";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/lib/reborn/store";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Training History — Reborn" },
      {
        name: "description",
        content: "Charts of your bodyweight over time and workouts completed each week.",
      },
      { property: "og:title", content: "Training History — Reborn" },
      {
        property: "og:description",
        content: "Review every logged session, weight trend and weekly consistency.",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { state, ready } = useStore();
  if (!ready) return <div className="min-h-screen bg-background" />;
  if (!state.profile) return <Onboarding />;

  const weightData = state.logs
    .filter((l) => typeof l.weightKg === "number")
    .map((l) => ({ date: l.date.slice(5), kg: l.weightKg }));

  const weeks = new Map<string, number>();
  state.logs.forEach((l) => {
    const d = new Date(l.date);
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const key = monday.toISOString().slice(5, 10);
    weeks.set(key, (weeks.get(key) ?? 0) + 1);
  });
  const weekData = [...weeks.entries()].map(([week, count]) => ({ week, count })).slice(-8);

  return (
    <AppShell>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Records</p>
      <h1 className="font-display text-3xl">Training History</h1>

      <Card className="card-elevated mt-4">
        <CardContent className="pt-5">
          <p className="text-sm font-semibold">Sessions per week</p>
          {weekData.length ? (
            <div className="mt-3 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="week" fontSize={11} stroke="var(--muted-foreground)" />
                  <YAxis allowDecimals={false} fontSize={11} stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }}
                  />
                  <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty />
          )}
        </CardContent>
      </Card>

      <Card className="card-elevated mt-4">
        <CardContent className="pt-5">
          <p className="text-sm font-semibold">Bodyweight trend</p>
          {weightData.length > 1 ? (
            <div className="mt-3 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" fontSize={11} stroke="var(--muted-foreground)" />
                  <YAxis domain={["auto", "auto"]} fontSize={11} stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }}
                  />
                  <Area dataKey="kg" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">
              Log your weight from the Profile tab to build this chart.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="card-elevated mt-4">
        <CardContent className="pt-5">
          <p className="text-sm font-semibold">Session log</p>
          <div className="mt-3 space-y-2">
            {[...state.logs].reverse().map((l) => (
              <div
                key={l.date}
                className="flex items-center justify-between rounded-lg bg-surface px-3 py-2"
              >
                <span className="text-sm">{l.dayTitle}</span>
                <span className="text-xs text-muted-foreground">
                  {l.date} · +{l.xp} XP
                </span>
              </div>
            ))}
            {!state.logs.length && <Empty />}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function Empty() {
  return <p className="mt-3 text-xs text-muted-foreground">Nothing logged yet. Go train.</p>;
}
