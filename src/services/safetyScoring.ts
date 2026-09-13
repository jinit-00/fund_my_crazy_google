import type { Coordinate, SafetyAnchor, SafetySignal } from '../types';
import { DELHI_SAFETY_ANCHORS } from '../data/safetyAnchors';
import { DELHI_RISK_GRID_ZONES } from '../data/riskGrid';

/**
 * Computes Haversine distance in meters between two lat/lng coordinates.
 */
export function calculateDistanceMeters(coord1: Coordinate, coord2: Coordinate): number {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Finds the nearest safety anchor to a given coordinate and returns distance and anchor info.
 */
export function findNearestSafetyAnchor(
  coord: Coordinate,
  anchors: SafetyAnchor[] = DELHI_SAFETY_ANCHORS
): { anchor: SafetyAnchor; distanceMeters: number } {
  let minDistance = Infinity;
  let nearest = anchors[0];

  for (const anchor of anchors) {
    const dist = calculateDistanceMeters(coord, anchor.coordinates);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = anchor;
    }
  }

  return { anchor: nearest, distanceMeters: Math.round(minDistance) };
}

/**
 * Evaluates risk grid factor at a given coordinate.
 */
export function getZoneRiskModifier(coord: Coordinate): number {
  const [lng, lat] = coord;
  for (const zone of DELHI_RISK_GRID_ZONES) {
    const [bMin, bMax] = [zone.boundary[0], zone.boundary[2]];
    const minLng = Math.min(bMin[0], bMax[0]);
    const maxLng = Math.max(bMin[0], bMax[0]);
    const minLat = Math.min(bMin[1], bMax[1]);
    const maxLat = Math.max(bMin[1], bMax[1]);

    if (lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat) {
      return zone.riskFactor; // e.g. 0.78 for isolated railway alley
    }
  }
  return 0.25; // default moderate urban baseline
}

/**
 * Computes the 4-signal composite safety score for a street segment.
 * Weights defined per the project specification:
 * - Street Lighting: 40%
 * - Incident Density / Risk Grid: 35%
 * - Foot Traffic / Commercial Openness: 15%
 * - Police / Help Point Proximity: 10%
 */
export function calculateSegmentSafety(
  coords: Coordinate[],
  baseLighting: number,
  baseIncidentSafety: number,
  baseFootTraffic: number,
  isNarrowAlley: boolean
): SafetySignal {
  const midIndex = Math.floor(coords.length / 2);
  const midCoord = coords[midIndex] || coords[0];

  // 1. Police Proximity Score (10% weight)
  const { distanceMeters } = findNearestSafetyAnchor(midCoord);
  let policeProximityScore = 30;
  if (distanceMeters <= 120) {
    policeProximityScore = 100;
  } else if (distanceMeters <= 300) {
    policeProximityScore = 85;
  } else if (distanceMeters <= 600) {
    policeProximityScore = 65;
  } else if (distanceMeters <= 1000) {
    policeProximityScore = 45;
  }

  // 2. Zone risk modifier applied to incident safety
  const zoneRisk = getZoneRiskModifier(midCoord);
  const adjustedIncidentSafety = Math.max(
    15,
    Math.min(100, Math.round(baseIncidentSafety * (1 - zoneRisk * 0.45)))
  );

  // 3. Narrow alley penalty
  let lighting = baseLighting;
  let footTraffic = baseFootTraffic;
  if (isNarrowAlley) {
    lighting = Math.max(15, lighting - 15);
    footTraffic = Math.max(10, footTraffic - 15);
  }

  // 4. Weighted Composite Safety Index (0 - 100)
  const compositeSafetyIndex = Math.round(
    lighting * 0.4 +
    adjustedIncidentSafety * 0.35 +
    footTraffic * 0.15 +
    policeProximityScore * 0.1
  );

  let riskLabel: SafetySignal['riskLabel'];
  if (compositeSafetyIndex >= 82) {
    riskLabel = 'High Safety / Well Lit';
  } else if (compositeSafetyIndex >= 60) {
    riskLabel = 'Moderate Vigilance';
  } else {
    riskLabel = 'Isolated / Dimly Lit';
  }

  return {
    lightingScore: lighting,
    incidentSafetyScore: adjustedIncidentSafety,
    footTrafficScore: footTraffic,
    policeProximityScore,
    compositeSafetyIndex,
    riskLabel,
  };
}
