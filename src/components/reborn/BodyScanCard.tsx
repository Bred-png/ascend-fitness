import { useState, useRef, type ChangeEvent } from "react";
import {
  Camera,
  Upload,
  Sparkles,
  Activity,
  Scan,
  Shield,
  Flame,
  CheckCircle2,
  Trash2,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/reborn/store";
import { analyzePhysiqueImage } from "@/lib/reborn/vision";
import type { BodyScanAnalysis, MuscleDistribution } from "@/lib/reborn/types";

const MUSCLE_GROUPS: Array<{
  key: keyof MuscleDistribution;
  label: string;
  sub: string;
  icon: string;
}> = [
  { key: "chest", label: "Chest", sub: "Pectorals & Clavicular Head", icon: "🛡️" },
  { key: "back", label: "Back & Posture", sub: "Lats, Traps & Rhomboids", icon: "🏹" },
  { key: "armsShoulders", label: "Arms & Shoulders", sub: "Deltoids, Biceps & Triceps", icon: "⚔️" },
  { key: "coreAbs", label: "Core & Abs", sub: "Rectus Abdominis & Obliques", icon: "⚡" },
  { key: "legsGlutes", label: "Legs & Glutes", sub: "Quads, Hamstrings & Calves", icon: "🌋" },
];

export function BodyScanCard() {
  const { state, addBodyScan, deleteBodyScan } = useStore();
  const [scanning, setScanning] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profile = state.profile;
  const scans = state.scans || [];
  const activeScan: BodyScanAnalysis | undefined = selectedScanId
    ? scans.find((s) => s.id === selectedScanId)
    : scans[0];

  const isVillain = profile?.path === "villain";

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, WebP)");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPreviewImg(dataUrl);
      setScanning(true);
      toast.info("Analyzing physical patterns and muscle mass distribution...", {
        icon: <Sparkles className="h-4 w-4 animate-spin text-primary" />,
      });

      try {
        const result = await analyzePhysiqueImage({
          apiKey: state.settings.geminiApiKey,
          imageDataUrl: dataUrl,
          profile,
        });

        addBodyScan(result);
        setSelectedScanId(result.id);
        toast.success("AI Physique Scan complete! +30 Body XP awarded.");
      } catch (err) {
        console.error("Scan error:", err);
        toast.error("Failed to analyze image. Please try again.");
      } finally {
        setScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="card-elevated mt-4 overflow-hidden border-border/80">
      <CardContent className="space-y-4 pt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                isVillain ? "bg-red-500/15 text-red-400" : "bg-primary/15 text-primary"
              }`}
            >
              <Scan className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">AI Physique & Muscle Scanner</p>
              <p className="text-xs text-muted-foreground">
                Vision pattern recognition & muscle mass distribution
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          <Button
            size="sm"
            onClick={triggerUpload}
            disabled={scanning || !profile}
            className="gap-1.5 rounded-xl font-semibold shadow-sm"
          >
            {scanning ? (
              <>
                <Sparkles className="h-3.5 w-3.5 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Camera className="h-3.5 w-3.5" />
                {scans.length > 0 ? "New Scan" : "Scan Photo"}
              </>
            )}
          </Button>
        </div>

        {/* Scan Animation / In Progress state */}
        {scanning && (
          <div className="relative flex flex-col items-center justify-center rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-primary/10 animate-pulse pointer-events-none" />
            {previewImg && (
              <div className="relative mb-4 h-48 w-40 overflow-hidden rounded-xl border-2 border-primary shadow-lg">
                <img
                  src={previewImg}
                  alt="Scanning Preview"
                  className="h-full w-full object-cover filter brightness-90"
                />
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-[bounce_2s_infinite]" />
              </div>
            )}
            <Sparkles className="h-8 w-8 animate-bounce text-primary mb-2" />
            <p className="font-display text-lg tracking-wide">Deconstructing Biometric Patterns</p>
            <p className="text-xs text-muted-foreground max-w-xs mt-1">
              Google Gemini Vision is measuring clavicular ratio, muscle density distribution, and postural symmetry...
            </p>
          </div>
        )}

        {/* Active Scan Results */}
        {!scanning && activeScan && (
          <div className="space-y-4">
            {/* Header stats badges */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-border bg-surface/50 p-2.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Somatotype</p>
                <p className="text-xs font-bold capitalize text-primary mt-0.5">
                  {activeScan.somatotype}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface/50 p-2.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Est. Body Fat</p>
                <p className="text-xs font-bold text-foreground mt-0.5">
                  {activeScan.estimatedBodyFatRange}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface/50 p-2.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Symmetry</p>
                <p className="text-xs font-bold text-emerald-500 mt-0.5">
                  {activeScan.symmetryScore}%
                </p>
              </div>
            </div>

            {/* Muscle Mass Distribution Breakdown */}
            <div className="rounded-2xl border border-border bg-surface/80 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-primary" />
                  Estimated Muscle Distribution Index
                </p>
                <span className="text-[11px] font-semibold text-primary">
                  Avg {activeScan.overallDevelopmentIndex}/100
                </span>
              </div>

              <div className="space-y-2.5">
                {MUSCLE_GROUPS.map((group) => {
                  const score = activeScan.muscleDistribution[group.key] || 50;
                  return (
                    <div key={group.key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium flex items-center gap-1.5">
                          <span>{group.icon}</span>
                          <span>{group.label}</span>
                        </span>
                        <span className="font-bold text-muted-foreground">{score}%</span>
                      </div>
                      <Progress
                        value={score}
                        className="h-2 bg-secondary"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Dossier Insights */}
            <div className="rounded-xl border border-border/80 bg-background/60 p-3.5 space-y-2.5">
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  {isVillain ? (
                    <Flame className="h-4 w-4 text-red-500" />
                  ) : (
                    <Shield className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-foreground">AI Dossier Analysis</p>
                  <p className="text-muted-foreground leading-relaxed">
                    {activeScan.aiSummary}
                  </p>
                </div>
              </div>

              {/* Focus & Strengths */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                {activeScan.keyStrengths?.length > 0 && (
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2 text-xs">
                    <p className="font-semibold text-emerald-400 flex items-center gap-1 mb-1">
                      <CheckCircle2 className="h-3 w-3" /> Core Strengths
                    </p>
                    <ul className="text-[11px] text-muted-foreground list-disc list-inside space-y-0.5">
                      {activeScan.keyStrengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeScan.focusAreas?.length > 0 && (
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2 text-xs">
                    <p className="font-semibold text-amber-400 flex items-center gap-1 mb-1">
                      <TrendingUp className="h-3 w-3" /> Hypertrophy Focus
                    </p>
                    <ul className="text-[11px] text-muted-foreground list-disc list-inside space-y-0.5">
                      {activeScan.focusAreas.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Recommended Focus Pill */}
              {activeScan.recommendedPathFocus && (
                <div className="mt-2 rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-xs">
                  <span className="font-semibold text-primary">Training Directive: </span>
                  <span className="text-muted-foreground">{activeScan.recommendedPathFocus}</span>
                </div>
              )}
            </div>

            {/* Scan History Switcher if multiple */}
            {scans.length > 1 && (
              <div className="pt-2 border-t border-border">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Scan Timeline ({scans.length})
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {scans.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedScanId(s.id)}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs transition-colors shrink-0 ${
                        (selectedScanId === s.id || (!selectedScanId && s.id === scans[0].id))
                          ? "border-primary bg-primary/15 font-semibold text-primary"
                          : "border-border bg-surface text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span>{s.date.split(" ")[0]}</span>
                      <span className="text-[10px] opacity-70">({s.overallDevelopmentIndex}%)</span>
                      <Trash2
                        className="h-3 w-3 opacity-40 hover:opacity-100 hover:text-destructive ml-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBodyScan(s.id);
                          toast.info("Scan removed");
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state when no scans yet */}
        {!scanning && scans.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/40 p-6 text-center">
            <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary">
              <Camera className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold">No Physique Scans Yet</p>
            <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4">
              Take or upload a physique pose photo to generate your AI muscle mass distribution map and tailor your workout split.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={triggerUpload}
              className="gap-2 rounded-xl"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload Photo for Analysis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
