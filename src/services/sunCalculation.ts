import { getPosition, getTimes } from 'suncalc';
import type { Coordinate, SunMetrics, FeelsLikeMetrics } from '../types';


export const DELHI_LAT = 28.6315;
export const DELHI_LNG = 77.2197;

/**
 * Calculates real solar position and sunset metrics for Delhi at a given date or simulated hour of day.
 */
export function getDelhiSunMetrics(dateOrHour: Date | number): SunMetrics {
  let targetDate: Date;
  if (typeof dateOrHour === 'number') {
    targetDate = new Date();
    const hours = Math.floor(dateOrHour);
    const minutes = Math.floor((dateOrHour - hours) * 60);
    targetDate.setHours(hours, minutes, 0, 0);
  } else {
    targetDate = dateOrHour;
  }

  const sunPos = getPosition(targetDate, DELHI_LAT, DELHI_LNG);
  const times = getTimes(targetDate, DELHI_LAT, DELHI_LNG);

  // Convert azimuth from SunCalc (south=0, west>0, east<0) to compass bearing (North=0, East=90, South=180, West=270)
  const azimuthDeg = ((sunPos.azimuth * 180) / Math.PI + 180) % 360;
  const altitudeDeg = (sunPos.altitude * 180) / Math.PI;

  const hourFraction = targetDate.getHours() + targetDate.getMinutes() / 60;
  const timeString = targetDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const sunsetTimeString = times.sunset
    ? times.sunset.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : '18:48 PM';

  // Estimated UV index based on altitude
  const uvEstimated = Math.max(0, Math.round(Math.sin(Math.max(0, sunPos.altitude)) * 11 * 10) / 10);

  let shadeQualityLabel: SunMetrics['shadeQualityLabel'];
  if (altitudeDeg < 0) {
    shadeQualityLabel = 'Deep Shadows';
  } else if (altitudeDeg > 65) {
    shadeQualityLabel = 'High Noon (Intense Sun)';
  } else if (altitudeDeg < 30) {
    shadeQualityLabel = 'Low Sun Angle';
  } else {
    shadeQualityLabel = 'Moderate Shade';
  }

  return {
    azimuthRadians: sunPos.azimuth,
    altitudeRadians: sunPos.altitude,
    azimuthDegrees: Math.round(azimuthDeg * 10) / 10,
    altitudeDegrees: Math.round(altitudeDeg * 10) / 10,
    timeString,
    hourFraction,
    uvIndexEstimated: uvEstimated,
    sunsetTimeString,
    shadeQualityLabel,
  };
}

/**
 * Generates 24-hour solar elevation curve (sampled every 30 minutes) for Delhi.
 * Used for the bottom timeline scrubber area graph.
 */
export function get24HourSunAltitudeCurve(): { hour: number; altitude: number; azimuth: number }[] {
  const points: { hour: number; altitude: number; azimuth: number }[] = [];
  const today = new Date();

  for (let h = 0; h <= 24; h += 0.5) {
    const d = new Date(today);
    const hours = Math.floor(h);
    const mins = Math.floor((h - hours) * 60);
    d.setHours(hours, mins, 0, 0);

    const pos = getPosition(d, DELHI_LAT, DELHI_LNG);
    const altDeg = Math.round(((pos.altitude * 180) / Math.PI) * 10) / 10;
    const azDeg = Math.round((((pos.azimuth * 180) / Math.PI + 180) % 360) * 10) / 10;

    points.push({
      hour: h,
      altitude: altDeg,
      azimuth: azDeg,
    });
  }

  return points;
}

/**
 * Computes compass bearing (0-360 degrees) of a street segment from coord1 to coord2.
 */
export function calculateSegmentBearing(coord1: Coordinate, coord2: Coordinate): number {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;

  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const dLngRad = ((lng2 - lng1) * Math.PI) / 180;

  const y = Math.sin(dLngRad) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLngRad);

  const bearingRad = Math.atan2(y, x);
  return ((bearingRad * 180) / Math.PI + 360) % 360;
}

/**
 * Calculates shade percentage (0-100%) for a segment based on solar geometry,
 * street orientation, building presence, and architectural colonnade coverage.
 */
export function calculateSegmentShade(
  coords: Coordinate[],
  isColonnade: boolean,
  hasTreeCanopy: boolean,
  sun: SunMetrics
): number {
  if (isColonnade) {
    return 98; // 98% shade coverage inside covered Georgian colonnades
  }

  if (sun.altitudeDegrees <= 0) {
    return 100;
  }

  let segmentBearing = 0;
  if (coords.length >= 2) {
    segmentBearing = calculateSegmentBearing(coords[0], coords[coords.length - 1]);
  }

  let angleDiff = Math.abs(segmentBearing - sun.azimuthDegrees) % 180;
  if (angleDiff > 90) {
    angleDiff = 180 - angleDiff;
  }

  const perpendicularity = angleDiff / 90;
  const altitude = Math.max(5, sun.altitudeDegrees);
  const shadowLengthRatio = Math.min(3.5, 1 / Math.tan((altitude * Math.PI) / 180));

  let baseShade = 20;
  baseShade += perpendicularity * Math.min(65, shadowLengthRatio * 22);

  if (hasTreeCanopy) {
    baseShade = Math.max(baseShade, 65) + 18;
  }

  return Math.min(98, Math.max(10, Math.round(baseShade)));
}

/**
 * Calculates "What the Walk Feels Like" heat stress metrics based on ambient Delhi
 * summer temperature and total shade exposure.
 */
export function calculateFeelsLikeMetrics(
  shadePercentage: number,
  sun: SunMetrics
): FeelsLikeMetrics {
  // Typical warm Delhi daytime profile: base temp peaks ~39°C around 14:00
  let ambientTempC = 37.0;
  const hour = sun.hourFraction;
  if (hour >= 11 && hour <= 16) {
    ambientTempC = 40.5;
  } else if (hour >= 9 && hour < 11) {
    ambientTempC = 36.0;
  } else if (hour > 16 && hour <= 19) {
    ambientTempC = 38.0;
  } else {
    ambientTempC = 31.0;
  }

  // Direct solar radiation penalty (up to +6.5°C in unshaded sun)
  const radiationFactor = Math.max(0, Math.sin((Math.max(0, sun.altitudeDegrees) * Math.PI) / 180));
  const sunExposure = 1 - shadePercentage / 100;
  const radiationHeatDelta = radiationFactor * sunExposure * 6.5;

  const feelsLikeTempC = Math.round((ambientTempC + radiationHeatDelta - (shadePercentage / 100) * 2.5) * 10) / 10;
  const ambientTempF = Math.round(((ambientTempC * 9) / 5 + 32) * 10) / 10;
  const feelsLikeTempF = Math.round(((feelsLikeTempC * 9) / 5 + 32) * 10) / 10;

  let heatStressLabel: FeelsLikeMetrics['heatStressLabel'];
  let heatColor: string;

  if (feelsLikeTempC >= 43) {
    heatStressLabel = 'Extreme Caution';
    heatColor = '#ef4444'; // Red
  } else if (feelsLikeTempC >= 40) {
    heatStressLabel = 'Very Strong Heat Stress';
    heatColor = '#f97316'; // Orange-red
  } else if (feelsLikeTempC >= 36) {
    heatStressLabel = 'Strong Heat Stress';
    heatColor = '#fb923c'; // Orange
  } else {
    heatStressLabel = 'Moderate';
    heatColor = '#a3e635'; // Lime
  }

  return {
    ambientTempC,
    ambientTempF,
    feelsLikeTempC,
    feelsLikeTempF,
    heatStressLabel,
    heatColor,
  };
}
