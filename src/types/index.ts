export type Coordinate = [number, number]; // [lng, lat]

export type AppMode = 'day' | 'night' | 'heatmap';

export interface SafetyHeatmapCell {
  id: string;
  name: string;
  boundary: Coordinate[];
  center: Coordinate;
  safetyScore: number;
  lightingScore: number;
  incidentSafety: number;
  footTrafficScore: number;
  policeProximityScore: number;
  contributingFactor: string;
  isRealData: boolean;
  color: string;
  riskLabel: string;
}

export interface SafetyHeatmapStats {
  averageSafetyScore: number;
  totalSectors: number;
  realDataCoveragePercent: number;
  safestSector: { name: string; score: number };
  highestRiskSector: { name: string; score: number };
}

export type UnitSystem = 'metric' | 'imperial';

export type TradeOffPreference = 'fastest' | 'balanced' | 'safe_cool';

export interface LocationPoint {
  id: string;
  name: string;
  description: string;
  coordinates: Coordinate;
  category: 'landmark' | 'metro' | 'market' | 'police' | 'hospital' | 'transit';
  popularStartOrEnd?: boolean;
}

export interface SunMetrics {
  azimuthRadians: number;
  altitudeRadians: number;
  azimuthDegrees: number;
  altitudeDegrees: number;
  timeString: string;
  hourFraction: number; // 0 to 24
  uvIndexEstimated: number;
  sunsetTimeString: string;
  shadeQualityLabel: 'Deep Shadows' | 'Moderate Shade' | 'High Noon (Intense Sun)' | 'Low Sun Angle';
}

export interface SafetySignal {
  lightingScore: number;         // 0-100 (based on OSM lit tag & high-mast Delhi lamps)
  incidentSafetyScore: number;   // 0-100 (100 = very low risk, based on police/grid data)
  footTrafficScore: number;      // 0-100 (commercial frontage, active vendor/pedestrian footfall)
  policeProximityScore: number;  // 0-100 (distance to police station/booth)
  compositeSafetyIndex: number;  // 0-100 weighted combined index
  riskLabel: 'High Safety / Well Lit' | 'Moderate Vigilance' | 'Isolated / Dimly Lit';
}

export interface TurnByTurnStep {
  id: string;
  tag: 'GO' | 'TRN' | 'ARR' | 'METRO';
  instruction: string;
  distanceMeters: number;
  contextNote: string; // e.g. "verandah stays shaded until 17:15" or "well-lit high-mast avenue"
  isShaded: boolean;
  isLit: boolean;
  safetyScore: number;
}

export interface RouteSegment {
  id: string;
  name: string;
  coordinates: Coordinate[];
  lengthMeters: number;
  bearingDegrees: number;
  isColonnade: boolean;          // CP circular covered verandah
  hasTreeCanopy: boolean;        // e.g. Janpath / KG Marg green tree cover
  shadePercentage: number;       // 0-100 calculated from sun angle & architecture
  safety: SafetySignal;
}

export interface FeelsLikeMetrics {
  ambientTempC: number;
  ambientTempF: number;
  feelsLikeTempC: number;
  feelsLikeTempF: number;
  heatStressLabel: 'Moderate' | 'Strong Heat Stress' | 'Very Strong Heat Stress' | 'Extreme Caution';
  heatColor: string; // hex color for headline display
}

export type RouteCategory = 'coolest' | 'safety' | 'fastest';

export interface RouteOption {
  id: string;
  title: string;
  tagline: string;
  type: 'sun_optimized' | 'night_safe' | 'direct_shortest';
  category: RouteCategory;
  categoryLabel: string;
  coordinates: Coordinate[];
  segments: RouteSegment[];
  turnSteps: TurnByTurnStep[];
  totalDistanceMeters: number;
  estimatedDurationMinutes: number;
  averageShadePercentage: number;
  overallSafetyScore: number;
  safetyAnchorCount: number;
  passedSafetyAnchors: string[];
  waterPointsCount: number;
  waterHutsCount: number;
  coolingCentersNearby: number;
  recommendedMode: AppMode | 'both';
  feelsLike: FeelsLikeMetrics;
  tradeOffInsight: string;
  highlights: string[];
  caveats: string[];
}

export interface SafetyAnchor {
  id: string;
  name: string;
  type: 'police' | 'metro_security' | 'pharmacy_24h' | 'hospital' | 'emergency_post';
  coordinates: Coordinate;
  description: string;
  hours: string;
  contact?: string;
  isVerifiedRealData: boolean;
  sourceAttribution: string;
}

export type POIType = 'tree' | 'water' | 'water_hut' | 'cooling_center' | 'safety_anchor' | 'transit_gate';

export interface POIItem {
  id: string;
  name: string;
  type: POIType;
  coordinates: Coordinate;
  description: string;
  details?: string;
  source?: string;
  isFree?: boolean;
  isCovered?: boolean;
}

export interface RiskGridZone {
  id: string;
  name: string;
  boundary: Coordinate[];
  riskFactor: number; // 0.0 (safest) to 1.0 (highest concern)
  lightingQuality: 'high' | 'medium' | 'poor';
  isSimulated: boolean;
  notes: string;
}
