import type { LocationPoint, Coordinate } from '../types';
import { DELHI_LANDMARKS } from '../data/landmarks';
import { calculateDistanceMeters } from './safetyScoring';

/**
 * Searches for landmarks matching a text query in Delhi / Connaught Place.
 */
export function searchDelhiLocations(query: string): LocationPoint[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return DELHI_LANDMARKS.slice(0, 8);

  const matched = DELHI_LANDMARKS.filter((item) => {
    return (
      item.name.toLowerCase().includes(clean) ||
      item.description.toLowerCase().includes(clean) ||
      item.category.toLowerCase().includes(clean)
    );
  });

  // Sort: name starts with query first, then other matches
  return matched
    .sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(clean);
      const bStarts = b.name.toLowerCase().startsWith(clean);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    })
    .slice(0, 10);
}

/**
 * Creates a location point from a pinned map coordinate.
 */
export function createPinLocation(coord: Coordinate, label = 'Pinned Location'): LocationPoint {
  // Find nearest landmark to provide contextual hint
  let nearestLandmark = DELHI_LANDMARKS[0];
  let minDistance = Infinity;

  for (const lm of DELHI_LANDMARKS) {
    const d = calculateDistanceMeters(coord, lm.coordinates);
    if (d < minDistance) {
      minDistance = d;
      nearestLandmark = lm;
    }
  }

  const roundedLng = Math.round(coord[0] * 10000) / 10000;
  const roundedLat = Math.round(coord[1] * 10000) / 10000;

  return {
    id: `pin-${Date.now()}`,
    name: label === 'Pinned Location' ? `${label} (${Math.round(minDistance)}m from ${nearestLandmark.name})` : label,
    description: `Coordinates: ${roundedLat}° N, ${roundedLng}° E`,
    coordinates: coord,
    category: 'landmark',
  };
}
