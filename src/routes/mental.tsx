import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Archive, Brain, Check, Plus, Trash2, Undo2 } from "lucide-react";
import { AppShell } from "@/components/reborn/AppShell";
import { Onboarding } from "@/components/reborn/Onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/reborn/store";
import type { MentalCategory } from "@/lib/reborn/types";

export const Route = createFileRoute("/mental")({
  head: () => ({
    meta: [
      { title: "Mental Training — Reborn" },
      {
        name: "description",
        content:
          "Track language, reading and skill goals. Every check-in earns Mind XP toward your combined rank.",
      },
      { property: "og:title", content: "Mental Training — Reborn" },
      {
        property: "og:description",
        content: "Custom mind goals with streaks, frequency targets and Mind XP.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MentalPage,
});

const CATEGORIES: MentalCategory[] = ["language", "reading", "skill", "other"];

function MentalPage() {
  const { state, ready, addGoal, updateGoal, archiveGoal, deleteGoal, logMental, goalStats } =
    useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<MentalCategory>("skill");
  const [perWeek, setPerWeek] = useState(7);
  const [milestone, setMilestone] = useState("");
  const [targetDate, setTargetDate] = useState("");

  if (!ready) return <div className="min-h-screen bg-background" />;
  if (!state.profile) return <Onboarding />;

  const active = state.goals.filter((g) => !g.archived);
  const archived = state.goals.filter((g) => g.archived);

  const submit = () => {
    if (!name.trim()) return;
    addGoal({
      name: name.trim(),
      category,
      perWeek,
      ...(milestone ? { milestoneTarget: Number(milestone) } : {}),
      ...(targetDate ? { targetDate } : {}),
    });
    setName("");
    setMilestone("");
    setTargetDate("");
    setOpen(false);
    toast.success("Goal added");
  };

  return (
    <AppShell>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Mind training</p>
      <h1 className="font-display text-3xl">Goals</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {state.mindXp} Mind XP earned · feeds the same rank as your body training.
      </p>

      <Button className="mt-4 w-full" onClick={() => setOpen((o) => !o)}>
        <Plus className="mr-1 size-4" /> {open ? "Cancel" : "New goal"}
      </Button>

      {open && (
        <Card className="card-elevated mt-3">
          <CardContent className="space-y-3 pt-5">
            <div className="space-y-2">
              <Label htmlFor="gname">Goal</Label>
              <Input
                id="gname"
                placeholder="Learn Spanish"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`rounded-full border px-3 py-1.5 text-xs capitalize ${
                      category === c
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-surface text-muted-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Sessions per week: {perWeek === 7 ? "daily" : perWeek}</Label>
              <input
                type="range"
                min={1}
                max={7}
                value={perWeek}
                onChange={(e) => setPerWeek(Number(e.target.value))}
                className="w-full accent-[var(--primary)]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="ms">Milestone count</Label>
                <Input
                  id="ms"
                  type="number"
                  placeholder="12"
                  value={milestone}
                  onChange={(e) => setMilestone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="td">Target date</Label>
                <Input
                  id="td"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>
            </div>
            <Button className="w-full bg-hype text-primary-foreground" onClick={submit}>
              Add goal
            </Button>
          </CardContent>
        </Card>
      )}

      {active.length === 0 && !open && (
        <Card className="card-elevated mt-4">
          <CardContent className="pt-5 text-sm text-muted-foreground">
            No mind goals yet. Discipline of the body is only half the work.
          </CardContent>
        </Card>
      )}

      {active.map((g) => {
        const s = goalStats(g.id);
        return (
          <Card key={g.id} className="card-elevated mt-3">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xl">{g.name}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {g.category} · {g.perWeek === 7 ? "daily" : `${g.perWeek}×/week`}
                    {g.targetDate ? ` · by ${g.targetDate}` : ""}
                  </p>
                </div>
                <Badge variant={s.loggedToday ? "default" : "secondary"}>
                  {s.streak}d streak
                </Badge>
              </div>

              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{s.total} sessions</span>
                <span>
                  {s.thisWeek}/{g.perWeek} this week
                </span>
                {g.milestoneTarget ? (
                  <span>
                    {s.total}/{g.milestoneTarget} milestone
                  </span>
                ) : null}
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  className="flex-1 bg-hype text-primary-foreground"
                  disabled={s.loggedToday}
                  onClick={() => {
                    logMental(g.id);
                    toast.success("Mind XP earned");
                  }}
                >
                  <Check className="mr-1 size-4" />
                  {s.loggedToday ? "Done today" : "Mark session complete"}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Archive goal"
                  onClick={() => archiveGoal(g.id, true)}
                >
                  <Archive className="size-4" />
                </Button>
              </div>

              <div className="mt-3 space-y-2">
                <Label className="text-xs">Rename</Label>
                <Input
                  defaultValue={g.name}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v && v !== g.name) updateGoal(g.id, { name: v });
                  }}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}

      {archived.length > 0 && (
        <>
          <p className="mt-6 text-sm font-semibold">Archived</p>
          {archived.map((g) => (
            <Card key={g.id} className="card-elevated mt-2 opacity-70">
              <CardContent className="flex items-center justify-between gap-2 pt-5">
                <span className="flex items-center gap-2 text-sm">
                  <Brain className="size-4 text-muted-foreground" /> {g.name}
                </span>
                <span className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Restore goal"
                    onClick={() => archiveGoal(g.id, false)}
                  >
                    <Undo2 className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Delete goal"
                    onClick={() => {
                      deleteGoal(g.id);
                      toast("Goal deleted");
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </span>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </AppShell>
  );
}
