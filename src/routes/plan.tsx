import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/reborn/AppShell";
import { Onboarding } from "@/components/reborn/Onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/reborn/store";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Weekly Plan — Reborn" },
      {
        name: "description",
        content: "Your generated weekly split with sets, reps, rest times and daily cardio.",
      },
      { property: "og:title", content: "Weekly Plan — Reborn" },
      {
        property: "og:description",
        content: "A weekly training split matched to your equipment, goal and fitness level.",
      },
    ],
  }),
  component: PlanPage,
});

function PlanPage() {
  const { state, ready, regenerate } = useStore();
  if (!ready) return <div className="min-h-screen bg-background" />;
  if (!state.profile || !state.plan) return <Onboarding />;

  return (
    <AppShell>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Weekly split</p>
          <h1 className="font-display text-3xl">Training Cycle</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            regenerate();
            toast.success("Plan regenerated");
          }}
        >
          Regenerate
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {state.plan.days.map((d) => (
          <Card key={d.day} className="card-elevated">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    {d.day}
                  </p>
                  <h2 className="font-display text-xl">{d.title}</h2>
                </div>
                <Badge variant={d.rest ? "secondary" : "default"}>{d.rest ? "Rest" : d.focus}</Badge>
              </div>
              <div className="mt-3 space-y-2">
                {d.blocks.map((b) => (
                  <div
                    key={b.name}
                    className="flex items-center justify-between rounded-lg bg-surface px-3 py-2"
                  >
                    <span className="text-sm">{b.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {b.sets} × {b.reps} · rest {b.restSec}s
                    </span>
                  </div>
                ))}
                {d.cardio && (
                  <p className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
                    {d.cardio}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
