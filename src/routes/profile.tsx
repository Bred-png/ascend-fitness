import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/reborn/AppShell";
import { Onboarding } from "@/components/reborn/Onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/reborn/store";
import { ranksFor } from "@/lib/reborn/ranks";
import type { Equipment, Goal, Level, Profile } from "@/lib/reborn/types";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Path — Reborn" },
      {
        name: "description",
        content: "Edit your stats, equipment and goal — your plan regenerates automatically.",
      },
      { property: "og:title", content: "Profile & Path — Reborn" },
      {
        property: "og:description",
        content: "Switch between hero and villain paths and keep all your progress.",
      },
    ],
  }),
  component: ProfilePage,
});

const EQUIPMENT: Equipment[] = [
  "bodyweight",
  "dumbbells",
  "barbell",
  "kettlebell",
  "bands",
  "pullupbar",
  "fullgym",
];
const GOALS: Goal[] = ["strength", "weightloss", "endurance", "general", "strongest"];
const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];

function ProfilePage() {
  const { state, ready, saveProfile, setPath, reset, logWorkout } = useStore();
  const [weighIn, setWeighIn] = useState("");

  if (!ready) return <div className="min-h-screen bg-background" />;
  if (!state.profile) return <Onboarding />;

  const p = state.profile;
  const update = (patch: Partial<Profile>) => {
    saveProfile({ ...p, ...patch });
    toast.success("Plan updated");
  };

  return (
    <AppShell>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Dossier</p>
      <h1 className="font-display text-3xl">{p.name}</h1>

      <Card className="card-elevated mt-4">
        <CardContent className="space-y-3 pt-5">
          <p className="text-sm font-semibold">Path</p>
          <div className="grid grid-cols-2 gap-2">
            {(["hero", "villain"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setPath(v)}
                className={`rounded-xl border px-3 py-3 text-sm font-semibold capitalize transition-colors ${
                  p.path === v ? "border-primary bg-primary/10" : "border-border bg-surface"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Ranks on this path: {ranksFor(p.path).map((r) => r.name.split("—").pop()?.trim()).join(" → ")}
          </p>
        </CardContent>
      </Card>

      <Card className="card-elevated mt-4">
        <CardContent className="space-y-4 pt-5">
          <p className="text-sm font-semibold">Stats</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="h">Height (cm)</Label>
              <Input
                id="h"
                type="number"
                defaultValue={p.heightCm}
                onBlur={(e) => update({ heightCm: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="w">Weight (kg)</Label>
              <Input
                id="w"
                type="number"
                defaultValue={p.weightKg}
                onBlur={(e) => update({ weightKg: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Equipment</Label>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT.map((e) => (
                <button
                  key={e}
                  onClick={() =>
                    update({
                      equipment: p.equipment.includes(e)
                        ? p.equipment.filter((x) => x !== e)
                        : [...p.equipment, e],
                    })
                  }
                  className={`rounded-full border px-3 py-1.5 text-xs capitalize ${
                    p.equipment.includes(e)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface text-muted-foreground"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Goal</Label>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <button
                  key={g}
                  onClick={() => update({ goal: g })}
                  className={`rounded-full border px-3 py-1.5 text-xs capitalize ${
                    p.goal === g
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface text-muted-foreground"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Level</Label>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => update({ level: l })}
                  className={`rounded-full border px-3 py-1.5 text-xs capitalize ${
                    p.level === l
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface text-muted-foreground"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Days per week: {p.daysPerWeek}</Label>
            <input
              type="range"
              min={2}
              max={7}
              value={p.daysPerWeek}
              onChange={(e) => update({ daysPerWeek: Number(e.target.value) })}
              className="w-full accent-[var(--primary)]"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="card-elevated mt-4">
        <CardContent className="space-y-3 pt-5">
          <p className="text-sm font-semibold">Weigh-in</p>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="kg"
              value={weighIn}
              onChange={(e) => setWeighIn(e.target.value)}
            />
            <Button
              onClick={() => {
                const kg = Number(weighIn);
                if (!kg) return;
                saveProfile({ ...p, weightKg: kg });
                logWorkout("Weigh-in", 5, { weightKg: kg });
                setWeighIn("");
                toast.success("Weight recorded");
              }}
            >
              Record
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Recording also marks today as active if you haven't logged yet.
          </p>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="mt-4 w-full"
        onClick={() => {
          reset();
          toast("Progress erased");
        }}
      >
        Reset everything
      </Button>
    </AppShell>
  );
}
