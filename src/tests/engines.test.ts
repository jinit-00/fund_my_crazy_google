import { describe, it, expect } from 'vitest';
import {
  getDelhiSunMetrics,
  get24HourSunAltitudeCurve,
  calculateFeelsLikeMetrics,
} from '../services/sunCalculation';
import {
  findNearestSafetyAnchor,
} from '../services/safetyScoring';
import { computeCandidateRoutes } from '../services/routingEngine';
import { searchDelhiLocations } from '../services/geocodingService';
import { DELHI_LANDMARKS } from '../data/landmarks';
import { DELHI_POIS } from '../data/pois';


describe('Sun Calculation & 24h Timeline Engine', () => {
  it('calculates realistic solar position for Delhi at midday', () => {
    const metrics = getDelhiSunMetrics(12.5);
    expect(metrics.altitudeDegrees).toBeGreaterThan(30);
    expect(metrics.azimuthDegrees).toBeGreaterThan(0);
    expect(metrics.azimuthDegrees).toBeLessThan(360);
    expect(metrics.uvIndexEstimated).toBeGreaterThan(3);
  });

  it('generates complete 24-hour solar elevation curve for timeline scrubber', () => {
    const curve = get24HourSunAltitudeCurve();
    expect(curve.length).toBe(49); // 0 to 24 with 0.5 step
    // Noon should have highest altitude
    const noonPt = curve.find((p) => p.hour === 12);
    expect(noonPt!.altitude).toBeGreaterThan(40);
  });

  it('calculates feels-like heat stress temperature metrics', () => {
    const sun = getDelhiSunMetrics(14.0);
    const metrics = calculateFeelsLikeMetrics(30, sun); // 30% shade = high sun
    expect(metrics.feelsLikeTempC).toBeGreaterThan(38);
    expect(metrics.feelsLikeTempF).toBeGreaterThan(100);
    expect(metrics.heatColor).toBeDefined();
  });
});

describe('Environmental POIs & Safety Engine', () => {
  it('contains color-coded POIs across all categories', () => {
    const water = DELHI_POIS.filter((p) => p.type === 'water');
    const waterHuts = DELHI_POIS.filter((p) => p.type === 'water_hut');
    const cooling = DELHI_POIS.filter((p) => p.type === 'cooling_center');
    const anchors = DELHI_POIS.filter((p) => p.type === 'safety_anchor');

    expect(water.length).toBeGreaterThanOrEqual(4);
    expect(waterHuts.length).toBeGreaterThanOrEqual(15);
    expect(cooling.length).toBeGreaterThanOrEqual(3);
    expect(anchors.length).toBeGreaterThanOrEqual(4);

    // Verify OpenStreetMap and Civic attribution on water huts
    const osmPoints = waterHuts.filter((w) => w.source === 'OpenStreetMap');
    expect(osmPoints.length).toBeGreaterThan(5);
    expect(osmPoints[0].coordinates.length).toBe(2);
  });

  it('identifies nearest Delhi Police anchor', () => {
    const cpStationCoord: [number, number] = [77.2145, 28.6322];
    const { anchor, distanceMeters } = findNearestSafetyAnchor(cpStationCoord);
    expect(anchor.id).toBe('anchor-cp-police');
    expect(distanceMeters).toBeLessThan(50);
  });
});

describe('Multi-Criteria Routing with Feature Layers', () => {
  it('generates 3 candidate routes with turn-by-turn directions and POI counts', () => {
    const start = DELHI_LANDMARKS[1]; // Rajiv Chowk Gate 2
    const end = DELHI_LANDMARKS[4];   // Mandi House
    const noonSun = getDelhiSunMetrics(14.0);

    const routes = computeCandidateRoutes(start, end, noonSun, 'balanced');
    expect(routes.length).toBe(3);

    const shadeRoute = routes.find((r) => r.type === 'sun_optimized')!;
    expect(shadeRoute).toBeDefined();
    expect(shadeRoute.turnSteps.length).toBeGreaterThan(2);
    expect(shadeRoute.turnSteps[0].tag).toBe('GO');
    expect(shadeRoute.turnSteps[shadeRoute.turnSteps.length - 1].tag).toBe('ARR');

    // Check trade-off insight string
    expect(shadeRoute.tradeOffInsight).toBeDefined();
    expect(shadeRoute.feelsLike).toBeDefined();
  });

  it('adjusts routing weights based on user trade-off preferences', () => {
    const start = DELHI_LANDMARKS[1];
    const end = DELHI_LANDMARKS[4];
    const noonSun = getDelhiSunMetrics(14.0);

    const fastestRoutes = computeCandidateRoutes(start, end, noonSun, 'fastest');
    const safeCoolRoutes = computeCandidateRoutes(start, end, noonSun, 'safe_cool');

    expect(fastestRoutes.length).toBe(3);
    expect(safeCoolRoutes.length).toBe(3);
  });

  it('searches Delhi locations and maps paths between arbitrary Point A and Point B', () => {
    const results = searchDelhiLocations('India Gate');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toContain('India Gate');

    // Route between India Gate and Jantar Mantar
    const jantarMantar = searchDelhiLocations('Jantar Mantar')[0];
    const sun = getDelhiSunMetrics(11.0);
    const routes = computeCandidateRoutes(results[0], jantarMantar, sun, 'balanced');
    expect(routes.length).toBe(3);
    expect(routes[0].coordinates.length).toBeGreaterThan(1);
  });

  it('generates the 2 distinct categories: Best Coolest Path and Best as per Safety for any locations', () => {
    const indiaGate = searchDelhiLocations('India Gate')[0];
    const khanMarket = searchDelhiLocations('Khan Market')[0];
    const sun = getDelhiSunMetrics(13.5);

    const routes = computeCandidateRoutes(indiaGate, khanMarket, sun, 'balanced');
    expect(routes.length).toBeGreaterThanOrEqual(2);

    const coolestPath = routes.find((r) => r.category === 'coolest')!;
    expect(coolestPath).toBeDefined();
    expect(coolestPath.title).toBe('Best Coolest Path');
    expect(coolestPath.averageShadePercentage).toBeGreaterThanOrEqual(75);
    expect(coolestPath.coordinates.length).toBeGreaterThan(2);

    const safestPath = routes.find((r) => r.category === 'safety')!;
    expect(safestPath).toBeDefined();
    expect(safestPath.title).toBe('Best as per Safety');
    expect(safestPath.overallSafetyScore).toBeGreaterThanOrEqual(85);
    expect(safestPath.safetyAnchorCount).toBeGreaterThan(0);
    expect(safestPath.coordinates.length).toBeGreaterThan(2);
  });
});

describe('Safety Heat Map Exploratory Overlay Engine', () => {
  it('performs continuous point safety sampling across Greater Delhi', async () => {
    const { calculateContinuousPointSafety, BOUNDS, getInterpolatedRgb, getInterpolatedSafetyColor } =
      await import('../services/safetyHeatmapService');

    // Test spatial coverage bounds
    expect(BOUNDS.minLng).toBe(77.160);
    expect(BOUNDS.maxLng).toBe(77.280);
    expect(BOUNDS.minLat).toBe(28.580);
    expect(BOUNDS.maxLat).toBe(28.670);

    // Test continuous RGB color interpolation
    const redRgb = getInterpolatedRgb(0);
    expect(redRgb).toEqual([239, 68, 68]);

    const greenRgb = getInterpolatedRgb(100);
    expect(greenRgb).toEqual([16, 185, 129]);

    const midRgb = getInterpolatedRgb(50);
    expect(midRgb).toEqual([234, 179, 8]);

    const colorStr = getInterpolatedSafetyColor(75);
    expect(colorStr).toBe('rgb(132, 204, 22)');

    // Sample CP Core (high safety)
    const cpPoint = calculateContinuousPointSafety([77.2197, 28.6315]);
    expect(cpPoint.safetyScore).toBeGreaterThanOrEqual(85);
    expect(cpPoint.contributingFactor).toBeDefined();

    // Sample Shivaji Bridge railway blind spot (high risk)
    const blindSpot = calculateContinuousPointSafety([77.2255, 28.6355]);
    expect(blindSpot.safetyScore).toBeLessThanOrEqual(50);
    expect(blindSpot.contributingFactor).toContain('Railway underpass');

    // Sample South Delhi Khan Market
    const southDelhi = calculateContinuousPointSafety([77.2270, 28.6003]);
    expect(southDelhi.safetyScore).toBeGreaterThan(60);
  });

  it('generates a continuous heatmap raster with coordinate envelope', async () => {
    const { generateContinuousHeatmapRaster } = await import('../services/safetyHeatmapService');
    const raster = generateContinuousHeatmapRaster(64, 64);

    expect(raster.dataUrl).toBeDefined();
    expect(raster.dataUrl.length).toBeGreaterThan(20);
    expect(raster.coordinates.length).toBe(4);
    expect(raster.coordinates[0]).toEqual([77.160, 28.670]); // Top-left
    expect(raster.coordinates[2]).toEqual([77.280, 28.580]); // Bottom-right
  });

  it('calculates map-wide safety telemetry with real data coverage and extremums', async () => {
    const { getHeatmapStats } = await import('../services/safetyHeatmapService');
    const stats = getHeatmapStats();

    expect(stats.totalSectors).toBeGreaterThan(100);
    expect(stats.averageSafetyScore).toBeGreaterThan(40);
    expect(stats.averageSafetyScore).toBeLessThan(95);
    expect(stats.realDataCoveragePercent).toBeGreaterThanOrEqual(50);
    expect(stats.realDataCoveragePercent).toBeLessThanOrEqual(100);
    expect(stats.safestSector.score).toBeGreaterThanOrEqual(85);
    expect(stats.highestRiskSector.score).toBeLessThanOrEqual(50);
  });

  it('supports 3-way mode switching and click-to-route shortcut into night mode in routeStore', async () => {
    const { useRouteStore } = await import('../stores/routeStore');

    // Switch to Heat Map
    useRouteStore.getState().setMode('heatmap');
    expect(useRouteStore.getState().mode).toBe('heatmap');

    // Click to route into a sampled point
    useRouteStore.getState().routeToCell([77.2285, 28.6350], 'Shivaji Bridge Sector');
    expect(useRouteStore.getState().mode).toBe('night');
    expect(useRouteStore.getState().isNavigating).toBe(true);
    expect(useRouteStore.getState().endPoint.name).toBe('Shivaji Bridge Sector');
  });

  it('generates Gemini route briefing and handles interactive route Q&A', async () => {
    const { fetchGeminiRouteBriefing, askGeminiAboutRoute } = await import('../services/geminiService');
    const { useRouteStore } = await import('../stores/routeStore');

    const state = useRouteStore.getState();
    const route = state.routes[0];

    // Briefing generation
    const briefing = await fetchGeminiRouteBriefing(route, 'day', 14.5, state.sunMetrics);
    expect(briefing).toBeDefined();
    expect(briefing.headlineQuote.length).toBeGreaterThan(5);
    expect(briefing.briefing.length).toBeGreaterThan(20);
    expect(briefing.advisories.length).toBeGreaterThan(0);

    // Interactive Q&A
    const answer = await askGeminiAboutRoute('Is this route safe for solo women?', route, 'night', 21.5);
    expect(answer).toBeDefined();
    expect(answer.length).toBeGreaterThan(15);
  });
});


