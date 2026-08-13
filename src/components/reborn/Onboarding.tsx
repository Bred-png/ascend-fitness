import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/reborn/store";
import { COPY } from "@/lib/reborn/generator";
import type { Equipment, Goal, Level, Path, Profile } from "@/lib/reborn/types";

const EQUIPMENT: { id: Equipment; label: string }[] = [
  { id: "bodyweight", label: "Bodyweight only" },
  { id: "dumbbells", label: "Dumbbells" },
  { id: "barbell", label: "Barbell" },
  { id: "kettlebell", label: "Kettlebell" },
  { id: "bands", label: "Resistance bands" },
  { id: "pullupbar", label: "Pull-up bar" },
  { id: "fullgym", label: "Full gym" },
];

const GOALS: { id: Goal; label: string; sub: string }[] = [
  { id: "strength", label: "Build strength", sub: "Heavy, low reps" },
  { id: "weightloss", label: "Lose weight", sub: "High volume, short rests" },
  { id: "endurance", label: "Build endurance", sub: "Long sets, more running" },
  { id: "general", label: "General fitness", sub: "Balanced training" },
  { id: "strongest", label: "Become the strongest", sub: "Brutal daily grind" },
];

const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];

export function Onboarding() {
  const { saveProfile } = useStore();
  const [step, setStep] = useState(0);
  const [path, setPath] = useState<Path | null>(null);
  const [form, setForm] = useState<Omit<Profile, "path">>({
    name: "",
    heightCm: 175,
    weightKg: 75,
    gender: "male",
    equipment: ["bodyweight"],
    goal: "general",
    level: "beginner",
    daysPerWeek: 4,
  });

  function toggleEquip(id: Equipment) {
    setForm((f) => ({
      ...f,
      equipment: f.equipment.includes(id)
        ? f.equipment.filter((e) => e !== id)
        : [...f.equipment, id],
    }));
  }

  if (step === 0) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-5 py-10">
        <div className="text-center">
          <h1 className="font-display text-5xl tracking-wide text-hype">REBORN</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            An ordinary body. A brutal routine. Choose the side you train for.
          </p>
        </div>
        <div className="grid gap-4">
          {(["hero", "villain"] as Path[]).map((p) => (
            <button
              key={p}
              onClick={() => {
                setPath(p);
                document.documentElement.classList.remove("path-hero", "path-villain", "dark");
                document.documentElement.classList.add(`path-${p}`);
                if (p === "villain") document.documentElement.classList.add("dark");
                setStep(1);
              }}
              className="card-elevated overflow-hidden rounded-2xl border border-border bg-card p-6 text-left transition-transform active:scale-[0.98]"
            >
              <p className="font-display text-2xl">{p === "hero" ? "HERO PATH" : "VILLAIN PATH"}</p>
              <p className="mt-2 text-sm text-muted-foreground">{COPY[p].tagline}</p>
              <div className="mt-4 h-1.5 w-24 rounded-full bg-hype" />
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          You can switch paths later — your progress carries over.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-8">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {path === "hero" ? "Hero registration" : "Threat assessment"}
      </p>
      <h2 className="mt-1 font-display text-3xl">Your baseline</h2>

      <Card className="card-elevated mt-5">
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label htmlFor="name">Codename</Label>
            <Input
              id="name"
              value={form.name}
              placeholder="e.g. Iron Kettle"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="h">Height (cm)</Label>
              <Input
                id="h"
                type="number"
                value={form.heightCm}
                onChange={(e) => setForm({ ...form, heightCm: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="w">Weight (kg)</Label>
              <Input
                id="w"
                type="number"
                value={form.weightKg}
                onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Gender</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["male", "female", "other"] as const).map((g) => (
                <Chip key={g} active={form.gender === g} onClick={() => setForm({ ...form, gender: g })}>
                  {g}
                </Chip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Equipment available</Label>
            <div className="grid grid-cols-2 gap-2">
              {EQUIPMENT.map((e) => (
                <Chip key={e.id} active={form.equipment.includes(e.id)} onClick={() => toggleEquip(e.id)}>
                  {e.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Primary goal</Label>
            <div className="grid gap-2">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setForm({ ...form, goal: g.id })}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    form.goal === g.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-surface"
                  }`}
                >
                  <p className="text-sm font-semibold">{g.label}</p>
                  <p className="text-xs text-muted-foreground">{g.sub}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Fitness level</Label>
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map((l) => (
                <Chip key={l} active={form.level === l} onClick={() => setForm({ ...form, level: l })}>
                  {l}
                </Chip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Training days per week: {form.daysPerWeek}</Label>
            <input
              type="range"
              min={2}
              max={7}
              value={form.daysPerWeek}
              onChange={(e) => setForm({ ...form, daysPerWeek: Number(e.target.value) })}
              className="w-full accent-[var(--primary)]"
            />
          </div>

          <Button
            className="w-full bg-hype font-display text-base tracking-wide text-primary-foreground"
            size="lg"
            onClick={() => saveProfile({ ...form, path: path ?? "hero", name: form.name || "Unnamed" })}
          >
            {COPY[path ?? "hero"].cta}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-xs font-medium capitalize transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}
