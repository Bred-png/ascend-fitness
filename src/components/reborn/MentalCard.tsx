import { Link } from "@tanstack/react-router";
import { Brain, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/reborn/store";

export function MentalCard() {
  const { state, logMental, goalStats } = useStore();
  const goals = state.goals.filter((g) => !g.archived);

  return (
    <Card className="card-elevated mt-4 overflow-hidden">
      <div className="h-1.5 w-full bg-hype opacity-60" />
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Mind training</p>
            <h2 className="font-display text-2xl">Today&apos;s goals</h2>
          </div>
          <Badge variant="secondary">
            <Brain className="mr-1 size-3" /> {state.mindXp} XP
          </Badge>
        </div>

        {goals.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No mind goals yet — add one to start earning Mind XP.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {goals.map((g) => {
              const s = goalStats(g.id);
              return (
                <div
                  key={g.id}
                  className="flex items-center justify-between gap-2 rounded-xl bg-surface px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{g.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {s.streak}d streak · {s.thisWeek}/{g.perWeek} this week
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={s.loggedToday ? "secondary" : "default"}
                    disabled={s.loggedToday}
                    onClick={() => {
                      logMental(g.id);
                      toast.success(`Mind XP earned — ${g.name}`);
                    }}
                  >
                    <Check className="mr-1 size-3" />
                    {s.loggedToday ? "Done" : "Check in"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        <Link
          to="/mental"
          className="mt-4 block rounded-xl border border-border bg-surface px-4 py-2.5 text-center text-sm font-medium"
        >
          Manage mind goals
        </Link>
      </CardContent>
    </Card>
  );
}
