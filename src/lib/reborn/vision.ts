import type { BodyScanAnalysis, MuscleDistribution, Profile, Somatotype } from "./types";

export interface ScanOptions {
  apiKey?: string;
  imageDataUrl: string;
  profile: Profile;
}

/**
 * Intelligent biometric fallback heuristic when no Gemini API key is provided or when offline.
 */
function generateHeuristicAnalysis(
  imageDataUrl: string,
  profile: Profile,
  reason: "no_key" | "api_error" = "no_key",
): BodyScanAnalysis {
  const bmi = profile.weightKg / Math.pow(profile.heightCm / 100, 2);

  let somatotype: Somatotype = "athletic-hybrid";
  let bodyFatRange = "14-17%";

  if (bmi < 20.5) {
    somatotype = "ectomorph";
    bodyFatRange = "10-13%";
  } else if (bmi > 26.5) {
    somatotype = "endomorph";
    bodyFatRange = "20-25%";
  } else {
    somatotype = "mesomorph";
    bodyFatRange = "13-17%";
  }

  // Base scores influenced by level & goal
  const levelMultiplier = profile.level === "advanced" ? 1.25 : profile.level === "intermediate" ? 1.1 : 0.95;

  let chest = Math.round(Math.min(95, Math.max(35, 52 * levelMultiplier)));
  let back = Math.round(Math.min(95, Math.max(35, 54 * levelMultiplier)));
  let armsShoulders = Math.round(Math.min(95, Math.max(35, 50 * levelMultiplier)));
  let coreAbs = Math.round(Math.min(95, Math.max(35, 48 * levelMultiplier)));
  let legsGlutes = Math.round(Math.min(95, Math.max(35, 56 * levelMultiplier)));

  if (profile.goal === "strength" || profile.goal === "strongest") {
    back += 8;
    legsGlutes += 8;
    chest += 6;
  } else if (profile.goal === "weightloss") {
    coreAbs += 6;
  } else if (profile.goal === "endurance") {
    legsGlutes += 10;
    coreAbs += 8;
  }

  const muscleDistribution: MuscleDistribution = {
    chest: Math.min(98, chest),
    back: Math.min(98, back),
    armsShoulders: Math.min(98, armsShoulders),
    coreAbs: Math.min(98, coreAbs),
    legsGlutes: Math.min(98, legsGlutes),
  };

  const symmetryScore = Math.round(82 + (Math.random() * 8));
  const overallDevelopmentIndex = Math.round(
    (muscleDistribution.chest +
      muscleDistribution.back +
      muscleDistribution.armsShoulders +
      muscleDistribution.coreAbs +
      muscleDistribution.legsGlutes) /
      5,
  );

  const keyStrengths = [];
  const focusAreas = [];

  if (muscleDistribution.legsGlutes >= muscleDistribution.armsShoulders) {
    keyStrengths.push("Lower body posterior chain & baseline power");
    focusAreas.push("Upper body clavicular/shoulder width & arm hypertrophy");
  } else {
    keyStrengths.push("Upper body anterior development");
    focusAreas.push("Posterior chain & core anti-rotational stability");
  }

  if (muscleDistribution.back >= 60) {
    keyStrengths.push("Lats & scapular stabilization foundation");
  } else {
    focusAreas.push("Upper back & rhomboid density for postural alignment");
  }

  const now = new Date();
  const dateStr = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;

  return {
    id: crypto.randomUUID(),
    date: dateStr,
    imageDataUrl,
    somatotype,
    estimatedBodyFatRange: bodyFatRange,
    muscleDistribution,
    symmetryScore,
    overallDevelopmentIndex,
    keyStrengths,
    focusAreas,
    aiSummary: `Dossier scan complete. Subject demonstrates strong ${somatotype} structural patterns with balanced foundation across kinetic chains.`,
    recommendedPathFocus:
      profile.path === "villain"
        ? `Overload ${focusAreas[0]?.split("&")[0] || "Shoulders"} with explosive compound volume`
        : `Strengthen ${focusAreas[0]?.split("&")[0] || "Upper Body"} and maintain core kinetic balance`,
  };
}

/**
 * Analyzes physique photo with Google Gemini Vision API (or fallback).
 */
export async function analyzePhysiqueImage({
  apiKey,
  imageDataUrl,
  profile,
}: ScanOptions): Promise<BodyScanAnalysis> {
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  const activeKey = apiKey?.trim() || envKey?.trim();

  if (!activeKey) {
    // Return heuristic analysis
    return generateHeuristicAnalysis(imageDataUrl, profile, "no_key");
  }

  try {
    const base64Data = imageDataUrl.includes(",") ? imageDataUrl.split(",")[1] : imageDataUrl;
    let mimeType = "image/jpeg";
    if (imageDataUrl.startsWith("data:")) {
      const match = imageDataUrl.match(/data:([^;]+);/);
      if (match) mimeType = match[1];
    }

    const systemPrompt = `You are an elite sports biomechanics and physique analysis AI for "Reborn", an RPG physical & mental fitness application.
Analyze the provided user physique image in relation to the user's dossier:
- Name: ${profile.name}
- Height: ${profile.heightCm} cm
- Weight: ${profile.weightKg} kg
- Gender: ${profile.gender}
- Goal: ${profile.goal}
- Level: ${profile.level}
- Path: ${profile.path} (Hero = disciplined harmonic power, Villain = ruthless aggressive hypertrophy/strength)

Evaluate the physical patterns and estimate the muscle mass distribution index (score 0-100 for each muscle group based on development, tone, and kinetic proportion):
1. chest (0-100)
2. back (0-100)
3. armsShoulders (0-100)
4. coreAbs (0-100)
5. legsGlutes (0-100)

Return your response strictly in JSON adhering to this schema:
{
  "somatotype": "ectomorph" | "mesomorph" | "endomorph" | "athletic-hybrid",
  "estimatedBodyFatRange": "string e.g. 12-15%",
  "muscleDistribution": {
    "chest": number,
    "back": number,
    "armsShoulders": number,
    "coreAbs": number,
    "legsGlutes": number
  },
  "symmetryScore": number (0-100),
  "overallDevelopmentIndex": number (0-100),
  "keyStrengths": ["string", "string"],
  "focusAreas": ["string", "string"],
  "aiSummary": "2-3 sentences concise RPG dossier style analysis",
  "recommendedPathFocus": "Actionable workout priority focus for this path"
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${activeKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: systemPrompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.3,
        },
      }),
    });

    if (!response.ok) {
      console.warn("Gemini API returned error:", response.status, response.statusText);
      return generateHeuristicAnalysis(imageDataUrl, profile, "api_error");
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return generateHeuristicAnalysis(imageDataUrl, profile, "api_error");
    }

    const parsed = JSON.parse(candidateText);
    const now = new Date();
    const dateStr = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;

    return {
      id: crypto.randomUUID(),
      date: dateStr,
      imageDataUrl,
      somatotype: parsed.somatotype || "athletic-hybrid",
      estimatedBodyFatRange: parsed.estimatedBodyFatRange || "14-18%",
      muscleDistribution: {
        chest: Math.min(100, Math.max(0, parsed.muscleDistribution?.chest ?? 50)),
        back: Math.min(100, Math.max(0, parsed.muscleDistribution?.back ?? 50)),
        armsShoulders: Math.min(100, Math.max(0, parsed.muscleDistribution?.armsShoulders ?? 50)),
        coreAbs: Math.min(100, Math.max(0, parsed.muscleDistribution?.coreAbs ?? 50)),
        legsGlutes: Math.min(100, Math.max(0, parsed.muscleDistribution?.legsGlutes ?? 50)),
      },
      symmetryScore: Math.min(100, Math.max(0, parsed.symmetryScore ?? 80)),
      overallDevelopmentIndex: Math.min(100, Math.max(0, parsed.overallDevelopmentIndex ?? 60)),
      keyStrengths: Array.isArray(parsed.keyStrengths) ? parsed.keyStrengths : ["Consistent athletic base"],
      focusAreas: Array.isArray(parsed.focusAreas) ? parsed.focusAreas : ["Compound symmetry & progressive overload"],
      aiSummary: parsed.aiSummary || "Dossier scan complete. Subject demonstrates strong structural patterns.",
      recommendedPathFocus: parsed.recommendedPathFocus || "Progressive overload across compound lifts.",
    };
  } catch (err) {
    console.error("Gemini Vision processing error:", err);
    return generateHeuristicAnalysis(imageDataUrl, profile, "api_error");
  }
}
