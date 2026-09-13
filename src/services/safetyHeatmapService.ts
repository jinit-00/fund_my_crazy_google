import type { Coordinate, SafetyHeatmapCell, SafetyHeatmapStats } from '../types';
import { DELHI_SAFETY_ANCHORS } from '../data/safetyAnchors';
import { DELHI_RISK_GRID_ZONES } from '../data/riskGrid';
import { findNearestSafetyAnchor, getZoneRiskModifier } from './safetyScoring';

// Expanded bounds covering Greater Central, Old, South, and West Delhi (~117 km²)
export const BOUNDS = {
  minLng: 77.160,
  maxLng: 77.280,
  minLat: 28.580,
  maxLat: 28.670,
};

// Key urban activity and well-lit anchor centers across Greater Delhi
const DELHI_HUBS: {
  name: string;
  coord: Coordinate;
  baseLighting: number;
  baseIncident: number;
  baseFootTraffic: number;
  radiusMeters: number;
}[] = [
  { name: 'Connaught Place Heritage Core', coord: [77.2197, 28.6315], baseLighting: 98, baseIncident: 95, baseFootTraffic: 96, radiusMeters: 1400 },
  { name: 'India Gate & Kartavya Path', coord: [77.2295, 28.6129], baseLighting: 96, baseIncident: 96, baseFootTraffic: 90, radiusMeters: 1500 },
  { name: 'Barakhamba Commercial Corridor', coord: [77.2260, 28.6292], baseLighting: 96, baseIncident: 95, baseFootTraffic: 88, radiusMeters: 1000 },
  { name: 'Janpath Promenade & Flea Market', coord: [77.2189, 28.6258], baseLighting: 94, baseIncident: 92, baseFootTraffic: 92, radiusMeters: 900 },
  { name: 'Mandi House Cultural Hub', coord: [77.2340, 28.6256], baseLighting: 92, baseIncident: 91, baseFootTraffic: 85, radiusMeters: 1000 },
  { name: 'Khan Market Pedestrian Precinct', coord: [77.2270, 28.6003], baseLighting: 94, baseIncident: 94, baseFootTraffic: 88, radiusMeters: 1100 },
  { name: 'Chandni Chowk Heritage Promenade', coord: [77.2301, 28.6506], baseLighting: 88, baseIncident: 82, baseFootTraffic: 95, radiusMeters: 1200 },
  { name: 'Red Fort & Netaji Subhash Marg', coord: [77.2410, 28.6562], baseLighting: 90, baseIncident: 86, baseFootTraffic: 90, radiusMeters: 1200 },
  { name: 'Bangla Sahib Public Promenade', coord: [77.2090, 28.6264], baseLighting: 92, baseIncident: 90, baseFootTraffic: 86, radiusMeters: 800 },
  { name: 'Sansad Marg & Central Secretariat', coord: [77.2050, 28.6180], baseLighting: 96, baseIncident: 98, baseFootTraffic: 72, radiusMeters: 1500 },
  { name: 'Chanakyapuri Diplomatic Enclave', coord: [77.1850, 28.5950], baseLighting: 95, baseIncident: 97, baseFootTraffic: 65, radiusMeters: 1800 },
  { name: 'Karol Bagh Commercial Avenue', coord: [77.1900, 28.6500], baseLighting: 86, baseIncident: 78, baseFootTraffic: 92, radiusMeters: 1300 },
  { name: 'Lodhi Gardens & Cultural District', coord: [77.2200, 28.5920], baseLighting: 88, baseIncident: 90, baseFootTraffic: 78, radiusMeters: 1200 },
  { name: 'Pusa Road Transit Hub', coord: [77.1780, 28.6430], baseLighting: 84, baseIncident: 80, baseFootTraffic: 85, radiusMeters: 1000 },
  { name: 'Pragati Maidan Trade Complex', coord: [77.2450, 28.6180], baseLighting: 92, baseIncident: 88, baseFootTraffic: 82, radiusMeters: 1200 },
];

/**
 * Returns continuous linearly-interpolated RGB components for any 0-100 safety score.
 * Color ramp:
 *   0   -> Deep Red    (#ef4444) [239, 68, 68]
 *   25  -> Orange      (#f97316) [249, 115, 22]
 *   50  -> Amber       (#eab308) [234, 179, 8]
 *   75  -> Light Green (#84cc16) [132, 204, 22]
 *   100 -> Strong Green(#10b981) [16, 185, 129]
 */
export function getInterpolatedRgb(score: number): [number, number, number] {
  const clamped = Math.max(0, Math.min(100, score));

  const stops: [number, [number, number, number]][] = [
    [0, [239, 68, 68]],
    [25, [249, 115, 22]],
    [50, [234, 179, 8]],
    [75, [132, 204, 22]],
    [100, [16, 185, 129]],
  ];

  for (let i = 0; i < stops.length - 1; i++) {
    const [s0, c0] = stops[i];
    const [s1, c1] = stops[i + 1];
    if (clamped >= s0 && clamped <= s1) {
      const t = (clamped - s0) / (s1 - s0);
      const r = Math.round(c0[0] + t * (c1[0] - c0[0]));
      const g = Math.round(c0[1] + t * (c1[1] - c0[1]));
      const b = Math.round(c0[2] + t * (c1[2] - c0[2]));
      return [r, g, b];
    }
  }

  return [16, 185, 129];
}

export function getInterpolatedSafetyColor(score: number): string {
  const [r, g, b] = getInterpolatedRgb(score);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * 5-stop stepped hex color (kept for badge chips and test assertions).
 */
export function getSafetyColor(score: number): string {
  if (score <= 20) return '#ef4444';
  if (score <= 40) return '#f97316';
  if (score <= 60) return '#eab308';
  if (score <= 80) return '#84cc16';
  return '#10b981';
}

export function getRiskLabel(score: number): string {
  if (score <= 20) return 'Severe Risk • Unlit Blind Spot';
  if (score <= 40) return 'High Vigilance • Dimly Lit';
  if (score <= 60) return 'Moderate Vigilance';
  if (score <= 80) return 'Safe • Well-Lit & Patrolled';
  return 'Maximum Safety • High CCTV & Police';
}

/**
 * Calculates continuous safety score at any arbitrary coordinate across Greater Delhi.
 */
export function calculateContinuousPointSafety(coord: Coordinate): SafetyHeatmapCell {
  const [lng, lat] = coord;

  // 1. Proximity to nearest safety anchor
  const { anchor, distanceMeters } = findNearestSafetyAnchor(coord, DELHI_SAFETY_ANCHORS);
  let policeProximityScore = 30;
  if (distanceMeters <= 150) {
    policeProximityScore = 100;
  } else if (distanceMeters <= 400) {
    policeProximityScore = Math.round(100 - ((distanceMeters - 150) / 250) * 20); // 100 -> 80
  } else if (distanceMeters <= 1000) {
    policeProximityScore = Math.round(80 - ((distanceMeters - 400) / 600) * 30); // 80 -> 50
  } else {
    policeProximityScore = Math.max(25, Math.round(50 - ((distanceMeters - 1000) / 2000) * 25));
  }

  // 2. Risk zone penalty
  const zoneRisk = getZoneRiskModifier(coord);

  // 3. Proximity to known urban lighting and footfall hubs
  let nearestHub = DELHI_HUBS[0];
  let minHubDistance = Infinity;

  for (const hub of DELHI_HUBS) {
    const dist = Math.hypot(
      (lng - hub.coord[0]) * 111000 * Math.cos((28.63 * Math.PI) / 180),
      (lat - hub.coord[1]) * 111000
    );
    if (dist < minHubDistance) {
      minHubDistance = dist;
      nearestHub = hub;
    }
  }

  // Smooth hub interpolation
  const hubFactor = Math.max(0, 1 - minHubDistance / nearestHub.radiusMeters);
  let baseLighting = Math.round(38 + hubFactor * (nearestHub.baseLighting - 38));
  let baseIncident = Math.round(45 + hubFactor * (nearestHub.baseIncident - 45));
  let baseFootTraffic = Math.round(25 + hubFactor * (nearestHub.baseFootTraffic - 25));

  // Check specific risk zones (e.g. railway underpasses and rear service alleys)
  let isBlindSpot = false;
  let isSimulated = false;

  for (const zone of DELHI_RISK_GRID_ZONES) {
    const [bMin, bMax] = [zone.boundary[0], zone.boundary[2]];
    const zMinLng = Math.min(bMin[0], bMax[0]);
    const zMaxLng = Math.max(bMin[0], bMax[0]);
    const zMinLat = Math.min(bMin[1], bMax[1]);
    const zMaxLat = Math.max(bMin[1], bMax[1]);

    if (lng >= zMinLng && lng <= zMaxLng && lat >= zMinLat && lat <= zMaxLat) {
      if (zone.id === 'zone-railway-underpass') {
        baseLighting = 16;
        baseFootTraffic = 12;
        isBlindSpot = true;
      } else if (zone.id === 'zone-block-c-rear') {
        baseLighting = 30;
        baseFootTraffic = 20;
      }
      if (zone.isSimulated) {
        isSimulated = true;
      }
    }
  }

  // Outer peripheral areas without direct police stations have simulated coverage
  if (minHubDistance > 1400 && !isSimulated) {
    // Deterministic simulation distribution based on geographic coordinates
    const hash = Math.sin(lng * 12.9898 + lat * 78.233) * 43758.5453;
    isSimulated = (hash - Math.floor(hash)) < 0.42;
  }

  const adjustedIncidentSafety = Math.max(
    14,
    Math.min(100, Math.round(baseIncident * (1 - zoneRisk * 0.45)))
  );

  // 4-Signal composite score (Lighting 40%, Incident 35%, Foot traffic 15%, Police 10%)
  const safetyScore = Math.max(
    8,
    Math.min(
      100,
      Math.round(
        baseLighting * 0.4 +
        adjustedIncidentSafety * 0.35 +
        baseFootTraffic * 0.15 +
        policeProximityScore * 0.1
      )
    )
  );

  // Contributing factor attribution
  let contributingFactor = 'Regular police patrol corridor & standard street lighting';
  if (policeProximityScore >= 85) {
    contributingFactor = `High: ${distanceMeters}m to ${anchor.name}`;
  } else if (safetyScore >= 88) {
    contributingFactor = `High: Continuous LED high-mast illumination & CISF presence near ${nearestHub.name}`;
  } else if (isBlindSpot || safetyScore <= 20) {
    contributingFactor = 'High Risk: Railway underpass blind spot & low pedestrian illumination';
  } else if (safetyScore <= 40) {
    contributingFactor = 'Caution: Secondary alley & low evening pedestrian footfall';
  } else if (baseLighting >= 80) {
    contributingFactor = `High: Well-lit commercial frontage along ${nearestHub.name}`;
  } else if (adjustedIncidentSafety < 50) {
    contributingFactor = 'Moderate: Increased vulnerability after 21:00';
  }

  const name = nearestHub ? `${nearestHub.name} Sector` : 'Central Delhi Sector';
  const color = getSafetyColor(safetyScore);
  const riskLabel = getRiskLabel(safetyScore);

  return {
    id: `point-${lng.toFixed(4)}-${lat.toFixed(4)}`,
    name,
    boundary: [
      [lng - 0.002, lat - 0.002],
      [lng + 0.002, lat - 0.002],
      [lng + 0.002, lat + 0.002],
      [lng - 0.002, lat + 0.002],
      [lng - 0.002, lat - 0.002],
    ],
    center: coord,
    safetyScore,
    lightingScore: baseLighting,
    incidentSafety: adjustedIncidentSafety,
    footTrafficScore: baseFootTraffic,
    policeProximityScore,
    contributingFactor,
    isRealData: !isSimulated,
    color,
    riskLabel,
  };
}

/**
 * Generates a continuous, smoothly blended gradient raster image across the expanded bounds.
 * Uses hardware bi-linear texture interpolation when draped onto MapLibre 3D terrain.
 */
export function generateContinuousHeatmapRaster(
  width = 256,
  height = 256
): {
  dataUrl: string;
  bounds: typeof BOUNDS;
  coordinates: [[number, number], [number, number], [number, number], [number, number]];
} {
  const coordinates: [[number, number], [number, number], [number, number], [number, number]] = [
    [BOUNDS.minLng, BOUNDS.maxLat], // Top-Left
    [BOUNDS.maxLng, BOUNDS.maxLat], // Top-Right
    [BOUNDS.maxLng, BOUNDS.minLat], // Bottom-Right
    [BOUNDS.minLng, BOUNDS.minLat], // Bottom-Left
  ];

  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const imgData = ctx.createImageData(width, height);
      const data = imgData.data;

      const lngSpan = BOUNDS.maxLng - BOUNDS.minLng;
      const latSpan = BOUNDS.maxLat - BOUNDS.minLat;

      for (let y = 0; y < height; y++) {
        // Y=0 is maxLat (top)
        const lat = BOUNDS.maxLat - (y / (height - 1)) * latSpan;

        for (let x = 0; x < width; x++) {
          const lng = BOUNDS.minLng + (x / (width - 1)) * lngSpan;
          const { safetyScore } = calculateContinuousPointSafety([lng, lat]);
          const [r, g, b] = getInterpolatedRgb(safetyScore);

          const index = (y * width + x) * 4;
          data[index] = r;
          data[index + 1] = g;
          data[index + 2] = b;
          data[index + 3] = 255; // Alpha channel
        }
      }

      ctx.putImageData(imgData, 0, 0);
      return {
        dataUrl: canvas.toDataURL('image/png'),
        bounds: BOUNDS,
        coordinates,
      };
    }
  }

  // Fallback for SSR / Node unit tests where canvas isn't present
  const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="%2310b981"/></svg>`;
  return {
    dataUrl: fallbackSvg,
    bounds: BOUNDS,
    coordinates,
  };
}

/**
 * Generates sample cells across Greater Delhi for aggregate map-wide telemetry statistics.
 */
export function generateSafetyHeatmapGrid(cols = 24, rows = 20): {
  cells: SafetyHeatmapCell[];
  geoJson: GeoJSON.FeatureCollection;
} {
  const cells: SafetyHeatmapCell[] = [];
  const colStep = (BOUNDS.maxLng - BOUNDS.minLng) / cols;
  const rowStep = (BOUNDS.maxLat - BOUNDS.minLat) / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const minLng = BOUNDS.minLng + c * colStep;
      const maxLng = minLng + colStep;
      const minLat = BOUNDS.minLat + r * rowStep;
      const maxLat = minLat + rowStep;

      const center: Coordinate = [
        Number(((minLng + maxLng) / 2).toFixed(6)),
        Number(((minLat + maxLat) / 2).toFixed(6)),
      ];

      const cell = calculateContinuousPointSafety(center);
      cell.id = `grid-cell-${c}-${r}`;
      cell.boundary = [
        [minLng, minLat],
        [maxLng, minLat],
        [maxLng, maxLat],
        [minLng, maxLat],
        [minLng, minLat],
      ];

      cells.push(cell);
    }
  }

  const geoJson: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: cells.map((cell) => ({
      type: 'Feature',
      id: cell.id,
      properties: {
        id: cell.id,
        name: cell.name,
        safetyScore: cell.safetyScore,
        lightingScore: cell.lightingScore,
        incidentSafety: cell.incidentSafety,
        footTrafficScore: cell.footTrafficScore,
        policeProximityScore: cell.policeProximityScore,
        contributingFactor: cell.contributingFactor,
        isRealData: cell.isRealData,
        color: cell.color,
        riskLabel: cell.riskLabel,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [cell.boundary],
      },
    })),
  };

  return { cells, geoJson };
}

/**
 * Calculates aggregate map-wide safety telemetry statistics.
 */
export function getHeatmapStats(cells?: SafetyHeatmapCell[]): SafetyHeatmapStats {
  const baseGrid = cells && cells.length ? cells : generateSafetyHeatmapGrid(20, 16).cells;
  // Combine grid cells with major hub centers for comprehensive telemetry
  const hubCells = DELHI_HUBS.map(h => calculateContinuousPointSafety(h.coord));
  const cellList = [...baseGrid, ...hubCells];

  let totalScore = 0;
  let realCount = 0;
  let safest = cellList[0];
  let riskiest = cellList[0];

  for (const cell of cellList) {
    totalScore += cell.safetyScore;
    if (cell.isRealData) realCount++;
    if (cell.safetyScore > safest.safetyScore) {
      safest = cell;
    }
    if (cell.safetyScore < riskiest.safetyScore) {
      riskiest = cell;
    }
  }

  return {
    averageSafetyScore: Math.round(totalScore / cellList.length),
    totalSectors: cellList.length,
    realDataCoveragePercent: Math.round((realCount / cellList.length) * 100),
    safestSector: { name: safest.name.replace(/ Sector$/, ''), score: safest.safetyScore },
    highestRiskSector: { name: riskiest.name.replace(/ Sector$/, ''), score: riskiest.safetyScore },
  };
}
