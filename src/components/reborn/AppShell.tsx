import { Link, useRouterState } from "@tanstack/react-router";
import { Brain, Dumbbell, Home, LineChart, User } from "lucide-react";
import type { ReactNode } from "react";
import { useStore } from "@/lib/reborn/store";
import { rankProgress } from "@/lib/reborn/ranks";
import { Progress } from "@/components/ui/progress";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/plan", label: "Plan", icon: Dumbbell },
  { to: "/history", label: "History", icon: LineChart },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { state } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const path = state.profile?.path ?? "hero";
  const rank = rankProgress(path, state.xp);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <div>
            <p className="font-display text-xl leading-none tracking-wide text-hype">REBORN</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {path === "hero" ? "Hero Association" : "Threat Registry"}
            </p>
          </div>
          <div className="w-36 text-right">
            <p className="truncate text-xs font-semibold">{rank.current.name}</p>
            <Progress value={rank.pct} className="mt-1 h-1.5" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pb-28 pt-4">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
