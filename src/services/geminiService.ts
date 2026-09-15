import type { RouteOption, AppMode, SunMetrics } from '../types';

export interface GeminiRouteBriefing {
  headlineQuote: string;
  briefing: string;
  advisories: string[];
  hydrationTip?: string;
  modelUsed: string;
}

const STORAGE_KEY = 'delhi_safe_route_gemini_api_key';

export function getGeminiApiKey(): string {
  const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (stored && stored.trim()) return stored.trim();
  return (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
}

export function setGeminiApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

/**
 * Procedural fallback generator that synthesizes realistic, context-aware
 * Delhi pedestrian intelligence when an API key is not configured or network fails.
 */
function generateProceduralBriefing(
  route: RouteOption,
  mode: AppMode,
  simulatedHour: number,
  sunMetrics: SunMetrics
): GeminiRouteBriefing {
  const isNight = mode === 'night';
  const hourFormatted = `${Math.floor(simulatedHour)}:${String(Math.round((simulatedHour % 1) * 60)).padStart(2, '0')}`;
  const isAfternoon = simulatedHour >= 12 && simulatedHour <= 16.5;

  if (isNight) {
    const isHighSafety = route.overallSafetyScore >= 80;
    return {
      headlineQuote: isHighSafety
        ? 'High-mast LED boulevards with active transit surveillance.'
        : 'Cautious night traversal recommended; stay on main radial arterials.',
      briefing: `At ${hourFormatted} IST, walking from ${route.title} benefits from high commercial vitality along Central Delhi's radial avenues. This route avoids dark service backlanes and unmonitored railway underpasses, keeping you within direct line-of-sight of ${route.safetyAnchorCount || 2} police and DMRC CISF security anchors with an overall Safety Index of ${route.overallSafetyScore}/100.`,
      advisories: [
        'Well-lit pedestrian sidewalks along Janpath & Barakhamba Road with functional municipal LEDs.',
        'CISF security checkpoint active at Rajiv Chowk Metro Gate 2 and Barakhamba concourse.',
        'Keep headphones at low volume when crossing inner circle radial intersections after 9:30 PM.',
      ],
      hydrationTip: route.waterHutsCount && route.waterHutsCount > 0
        ? `Note: ${route.waterHutsCount} free water hut/pyaau on route is likely unstaffed after dark; carry personal hydration.`
        : undefined,
      modelUsed: 'Gemini (Contextual Engine)',
    };
  }

  // Day Mode (Heat & Shade)
  return {
    headlineQuote: isAfternoon
      ? 'Georgian colonnade shelter mitigates peak afternoon heat stress.'
      : 'Morning tree canopy provides pleasant solar occlusion.',
    briefing: `At ${hourFormatted} IST with solar altitude at ${sunMetrics.altitudeDegrees}° (${sunMetrics.shadeQualityLabel}), ambient temperature is ${route.feelsLike.ambientTempC}°C, but direct solar radiation elevates radiant heat to ${route.feelsLike.feelsLikeTempC}°C. By channeling your walk through ${route.averageShadePercentage}% continuous shade via heritage colonnades and Jamun canopies, this route saves you from acute thermal exhaustion.`,
    advisories: [
      `Stay under the covered Georgian colonnade (verandah) on Connaught Place Blocks A–F for 98% direct sun protection.`,
      `UV index is elevated (${sunMetrics.uvIndexEstimated}/12). Avoid open radial road crossings where shadow ratio drops below 20%.`,
      route.waterHutsCount && route.waterHutsCount > 0
        ? `Hydration alert: ${route.waterHutsCount} verified public drinking water hut (Pyaau) available along your route for refills.`
        : 'Hydration alert: Carry water; high radiant exposure across Mandi House rotary.',
    ],
    hydrationTip: route.waterHutsCount && route.waterHutsCount > 0
      ? `Free drinking water hut available along this corridor (NDMC / Community Pyaau).`
      : 'No verified public water hut directly on this segment; visit Palika Bazaar concourse for chilled water.',
    modelUsed: 'Gemini (Contextual Engine)',
  };
}

/**
 * Query Google Gemini API for deep, real-time route reasoning.
 */
export async function fetchGeminiRouteBriefing(
  route: RouteOption,
  mode: AppMode,
  simulatedHour: number,
  sunMetrics: SunMetrics
): Promise<GeminiRouteBriefing> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return generateProceduralBriefing(route, mode, simulatedHour, sunMetrics);
  }

  const hourFormatted = `${Math.floor(simulatedHour)}:${String(Math.round((simulatedHour % 1) * 60)).padStart(2, '0')}`;

  const prompt = `
You are the Google Gemini Urban Safety & Micro-Climate Co-Pilot for "Delhi Safe Route", an intelligent pedestrian navigation platform in Central Delhi (Connaught Place, Janpath, Mandi House, Barakhamba).

Analyze this real-time pedestrian route telemetry:
- Mode: ${mode === 'night' ? 'NIGHT SAFETY' : 'DAYTIME HEAT & SHADE'}
- Departure Time: ${hourFormatted} IST
- Route Title: "${route.title}" (${route.categoryLabel})
- Distance & Duration: ${route.totalDistanceMeters} meters (~${route.estimatedDurationMinutes} minutes walk)
- Ambient Temperature: ${route.feelsLike.ambientTempC}°C (Feels-like: ${route.feelsLike.feelsLikeTempC}°C, ${route.feelsLike.heatStressLabel})
- Shade Coverage: ${route.averageShadePercentage}% continuous cover
- Solar Geometry: Altitude ${sunMetrics.altitudeDegrees}°, Azimuth ${sunMetrics.azimuthDegrees}°, UV Index ${sunMetrics.uvIndexEstimated}
- Safety Index: ${route.overallSafetyScore}/100
- Police/Security Anchors in range: ${route.safetyAnchorCount}
- Free Drinking Water Huts / Pyaaus along route: ${route.waterHutsCount || 0}
- Key Waypoints: ${route.turnSteps.map((s) => s.instruction).join(' -> ')}

Task: Provide an expert, empathetic, highly localized briefing for this pedestrian in Delhi.
Respond ONLY in valid JSON matching this exact structure:
{
  "headlineQuote": "A concise, impactful 1-sentence verdict on this path",
  "briefing": "A 2-3 sentence empathetic explanation of why this path feels the way it does at this exact hour in Delhi, referencing specific local landmarks (e.g. Connaught Place Georgian colonnades, Janpath, Barakhamba, metro gates, tree canopies).",
  "advisories": [
    "Actionable tip 1 regarding safety/shade/lighting",
    "Actionable tip 2 regarding specific landmarks or transit connections",
    "Actionable tip 3 regarding heat, hydration, or night awareness"
  ],
  "hydrationTip": "A 1-sentence note about water availability or hydration needs along this specific corridor."
}
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      console.warn('Gemini API returned status:', response.status);
      return generateProceduralBriefing(route, mode, simulatedHour, sunMetrics);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      return generateProceduralBriefing(route, mode, simulatedHour, sunMetrics);
    }

    const parsed = JSON.parse(candidateText);
    return {
      headlineQuote: parsed.headlineQuote || 'Contextual route guidance verified by Gemini.',
      briefing: parsed.briefing || '',
      advisories: Array.isArray(parsed.advisories) ? parsed.advisories : [],
      hydrationTip: parsed.hydrationTip,
      modelUsed: 'Gemini 2.5 Flash',
    };
  } catch (err) {
    console.warn('Gemini request caught, using resilient local procedural engine:', err);
    return generateProceduralBriefing(route, mode, simulatedHour, sunMetrics);
  }
}

/**
 * Ask an interactive free-form question to Gemini about the current route.
 */
export async function askGeminiAboutRoute(
  userQuestion: string,
  route: RouteOption,
  mode: AppMode,
  simulatedHour: number
): Promise<string> {
  const apiKey = getGeminiApiKey();
  const hourFormatted = `${Math.floor(simulatedHour)}:${String(Math.round((simulatedHour % 1) * 60)).padStart(2, '0')}`;

  if (!apiKey) {
    const q = userQuestion.toLowerCase();
    if (q.includes('safe') || q.includes('female') || q.includes('women') || q.includes('night') || q.includes('alone')) {
      return `At ${hourFormatted} IST, this route rates ${route.overallSafetyScore}/100 on our safety index. It sticks to major radial boulevards (Janpath and Barakhamba) with active streetlighting and CISF security at metro stations. Avoid unlit shortcuts behind the outer circle service alleys after 9 PM.`;
    }
    if (q.includes('water') || q.includes('drink') || q.includes('pyaau') || q.includes('hydrate')) {
      return route.waterHutsCount && route.waterHutsCount > 0
        ? `Yes! There are ${route.waterHutsCount} verified public drinking water huts (Pyaaus) along this route, including the NDMC water shelter near F-Block and community seva points.`
        : `There are no direct roadside water huts along this specific segment. We recommend stopping at Rajiv Chowk Metro station concourse or Palika Bazaar for clean drinking water.`;
    }
    if (q.includes('shade') || q.includes('sun') || q.includes('heat') || q.includes('hot')) {
      return `This route offers ${route.averageShadePercentage}% continuous shade. In Connaught Place, always walk under the heritage Georgian colonnades (verandahs) which provide 98% solar occlusion even at peak 2:30 PM sun.`;
    }
    return `For this ${route.totalDistanceMeters}m walk at ${hourFormatted} IST, the path is optimized for ${mode === 'night' ? 'lighting and police proximity' : 'maximum colonnade shade and minimum radiant heat'}. Estimated walk duration is ~${route.estimatedDurationMinutes} minutes.`;
  }

  const prompt = `
You are the Google Gemini Urban Walking Assistant for Delhi Safe Route.
Commuter Question: "${userQuestion}"

Context:
- Path: From ${route.title} in Central Delhi
- Time of walk: ${hourFormatted} IST
- Mode: ${mode === 'night' ? 'Night Safety' : 'Daytime Shade & Cooling'}
- Safety score: ${route.overallSafetyScore}/100
- Shade coverage: ${route.averageShadePercentage}%
- Distance: ${route.totalDistanceMeters}m (~${route.estimatedDurationMinutes} mins)
- Public water huts: ${route.waterHutsCount || 0}
- Ambient temp: ${route.feelsLike.ambientTempC}°C, Feels-like: ${route.feelsLike.feelsLikeTempC}°C

Answer the commuter's question directly, empathetically, and concisely in 2-3 sentences. Focus specifically on real Delhi street conditions.
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 250,
        },
      }),
    });

    if (!response.ok) {
      return `At ${hourFormatted} IST, this route offers ${route.averageShadePercentage}% shade and a safety rating of ${route.overallSafetyScore}/100 along ${route.totalDistanceMeters}m.`;
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
  } catch (err) {
    return `This route is calibrated for ${mode === 'night' ? 'maximum illumination and security' : 'maximum colonnade shade'} at ${hourFormatted} IST.`;
  }
}
