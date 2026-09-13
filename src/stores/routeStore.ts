import { create } from 'zustand';
import type {
  AppMode,
  Coordinate,
  LocationPoint,
  RouteOption,
  SafetyHeatmapStats,
  SunMetrics,
  UnitSystem,
  TradeOffPreference,
} from '../types';
import { DELHI_LANDMARKS } from '../data/landmarks';
import { getDelhiSunMetrics } from '../services/sunCalculation';
import { computeCandidateRoutes } from '../services/routingEngine';

interface RouteState {
  mode: AppMode;
  unit: UnitSystem;
  tradeOff: TradeOffPreference;
  simulatedHour: number; // 0 - 24
  sunMetrics: SunMetrics;
  startPoint: LocationPoint;
  endPoint: LocationPoint;
  routes: RouteOption[];
  selectedRouteId: string;
  isNavigating: boolean;
  showPOILayers: boolean;
  showWaterHutsLayer: boolean;
  activePinMode: 'none' | 'start' | 'end';
  isAboutModalOpen: boolean;
  heatmapStats: SafetyHeatmapStats | null;

  // Actions
  setMode: (mode: AppMode) => void;
  setUnit: (unit: UnitSystem) => void;
  setTradeOff: (tradeOff: TradeOffPreference) => void;
  setSimulatedHour: (hour: number) => void;
  setStartPoint: (point: LocationPoint) => void;
  setEndPoint: (point: LocationPoint) => void;
  swapStartAndEnd: () => void;
  setSelectedRouteId: (id: string) => void;
  setIsNavigating: (nav: boolean) => void;
  setShowPOILayers: (show: boolean) => void;
  setShowWaterHutsLayer: (show: boolean) => void;
  setActivePinMode: (mode: 'none' | 'start' | 'end') => void;
  setAboutModalOpen: (open: boolean) => void;
  setHeatmapStats: (stats: SafetyHeatmapStats) => void;
  routeToCell: (cellCoord: Coordinate, cellName: string) => void;
  selectPresetRoute: (startId: string, endId: string) => void;
  useCurrentLocation: () => void;
  selectCategory: (category: 'coolest' | 'safety' | 'fastest') => void;
  recompute: () => void;
}

const defaultStart = DELHI_LANDMARKS[1]; // Rajiv Chowk Gate 2
const defaultEnd = DELHI_LANDMARKS[4];   // Mandi House

const initialHour = 14.5; // 2:30 PM (peak sun highlight)
const initialSun = getDelhiSunMetrics(initialHour);
const initialRoutes = computeCandidateRoutes(defaultStart, defaultEnd, initialSun, 'balanced');

export const useRouteStore = create<RouteState>((set, get) => ({
  mode: 'day',
  unit: 'metric',
  tradeOff: 'balanced',
  simulatedHour: initialHour,
  sunMetrics: initialSun,
  startPoint: defaultStart,
  endPoint: defaultEnd,
  routes: initialRoutes,
  selectedRouteId: initialRoutes[0]?.id || 'route-coolest',
  isNavigating: false,
  showPOILayers: true,
  showWaterHutsLayer: true,
  activePinMode: 'none',
  isAboutModalOpen: false,
  heatmapStats: null,

  setMode: (mode) => {
    const state = get();
    let newHour = state.simulatedHour;
    if ((mode === 'night' || mode === 'heatmap') && newHour < 19 && newHour > 6) {
      newHour = 21.5; // 9:30 PM
    } else if (mode === 'day' && (newHour >= 20 || newHour < 6)) {
      newHour = 14.5; // 2:30 PM
    }

    const newSun = getDelhiSunMetrics(newHour);
    const updatedRoutes = computeCandidateRoutes(
      state.startPoint,
      state.endPoint,
      newSun,
      state.tradeOff
    );
    const targetRoute =
      updatedRoutes.find((r) =>
        mode === 'day' ? r.category === 'coolest' : r.category === 'safety'
      ) || updatedRoutes[0];

    set({
      mode,
      simulatedHour: newHour,
      sunMetrics: newSun,
      routes: updatedRoutes,
      selectedRouteId: targetRoute ? targetRoute.id : state.selectedRouteId,
    });
  },

  setUnit: (unit) => set({ unit }),

  setTradeOff: (tradeOff) => {
    const state = get();
    const updatedRoutes = computeCandidateRoutes(
      state.startPoint,
      state.endPoint,
      state.sunMetrics,
      tradeOff
    );
    let matched = updatedRoutes.find((r) => r.id === state.selectedRouteId);
    if (!matched) {
      matched =
        updatedRoutes.find((r) =>
          state.mode === 'day' ? r.category === 'coolest' : r.category === 'safety'
        ) || updatedRoutes[0];
    }
    set({ tradeOff, routes: updatedRoutes, selectedRouteId: matched ? matched.id : state.selectedRouteId });
  },

  setSimulatedHour: (hour) => {
    const state = get();
    const newSun = getDelhiSunMetrics(hour);
    const updatedRoutes = computeCandidateRoutes(
      state.startPoint,
      state.endPoint,
      newSun,
      state.tradeOff
    );
    set({
      simulatedHour: hour,
      sunMetrics: newSun,
      routes: updatedRoutes,
    });
  },

  setStartPoint: (point) => {
    const state = get();
    const updatedRoutes = computeCandidateRoutes(
      point,
      state.endPoint,
      state.sunMetrics,
      state.tradeOff
    );
    const matched =
      updatedRoutes.find((r) =>
        state.mode === 'day' ? r.category === 'coolest' : r.category === 'safety'
      ) || updatedRoutes[0];

    set({
      startPoint: point,
      routes: updatedRoutes,
      selectedRouteId: matched?.id || '',
      activePinMode: 'none',
    });
  },

  setEndPoint: (point) => {
    const state = get();
    const updatedRoutes = computeCandidateRoutes(
      state.startPoint,
      point,
      state.sunMetrics,
      state.tradeOff
    );
    const matched =
      updatedRoutes.find((r) =>
        state.mode === 'day' ? r.category === 'coolest' : r.category === 'safety'
      ) || updatedRoutes[0];

    set({
      endPoint: point,
      routes: updatedRoutes,
      selectedRouteId: matched?.id || '',
      activePinMode: 'none',
    });
  },

  selectCategory: (category) => {
    const state = get();
    const route = state.routes.find((r) => r.category === category);
    if (route) {
      set({ selectedRouteId: route.id });
    }
  },

  swapStartAndEnd: () => {
    const state = get();
    const newStart = state.endPoint;
    const newEnd = state.startPoint;
    const updatedRoutes = computeCandidateRoutes(
      newStart,
      newEnd,
      state.sunMetrics,
      state.tradeOff
    );

    set({
      startPoint: newStart,
      endPoint: newEnd,
      routes: updatedRoutes,
    });
  },

  setSelectedRouteId: (id) => set({ selectedRouteId: id }),

  setIsNavigating: (isNavigating) => set({ isNavigating }),

  setShowPOILayers: (showPOILayers) => set({ showPOILayers }),

  setShowWaterHutsLayer: (showWaterHutsLayer) => set({ showWaterHutsLayer }),

  setActivePinMode: (activePinMode) => set({ activePinMode }),

  setAboutModalOpen: (open) => set({ isAboutModalOpen: open }),

  setHeatmapStats: (heatmapStats) => set({ heatmapStats }),

  routeToCell: (cellCoord: Coordinate, cellName: string) => {
    const targetPoint: LocationPoint = {
      id: `heatmap-dest-${Date.now()}`,
      name: cellName,
      description: 'Destination selected from Safety Heat Map',
      coordinates: cellCoord,
      category: 'landmark',
    };

    const state = get();
    // Force night mode for safe routing
    const nightSun = getDelhiSunMetrics(21.5);
    const updatedRoutes = computeCandidateRoutes(
      state.startPoint,
      targetPoint,
      nightSun,
      'balanced'
    );
    const safeRoute = updatedRoutes.find((r) => r.category === 'safety') || updatedRoutes[0];

    set({
      endPoint: targetPoint,
      mode: 'night',
      simulatedHour: 21.5,
      sunMetrics: nightSun,
      routes: updatedRoutes,
      selectedRouteId: safeRoute ? safeRoute.id : state.selectedRouteId,
      isNavigating: true,
    });
  },

  selectPresetRoute: (startId, endId) => {
    const start = DELHI_LANDMARKS.find((l) => l.id === startId) || DELHI_LANDMARKS[0];
    const end = DELHI_LANDMARKS.find((l) => l.id === endId) || DELHI_LANDMARKS[1];
    const state = get();
    const updatedRoutes = computeCandidateRoutes(
      start,
      end,
      state.sunMetrics,
      state.tradeOff
    );
    const matched =
      updatedRoutes.find((r) =>
        state.mode === 'day' ? r.type === 'sun_optimized' : r.type === 'night_safe'
      ) || updatedRoutes[0];

    set({
      startPoint: start,
      endPoint: end,
      routes: updatedRoutes,
      selectedRouteId: matched?.id || '',
      isNavigating: true,
    });
  },

  useCurrentLocation: () => {
    // Default to central Connaught Park pavilion if browser geolocation isn't allowed
    const userLoc: LocationPoint = {
      id: 'current-user-location',
      name: 'Current Location (Connaught Place)',
      description: 'Central Delhi Pedestrian Zone',
      coordinates: [77.2197, 28.6315],
      category: 'landmark',
    };
    const state = get();
    const updatedRoutes = computeCandidateRoutes(
      userLoc,
      state.endPoint,
      state.sunMetrics,
      state.tradeOff
    );
    set({ startPoint: userLoc, routes: updatedRoutes });
  },

  recompute: () => {
    const state = get();
    const updatedRoutes = computeCandidateRoutes(
      state.startPoint,
      state.endPoint,
      state.sunMetrics,
      state.tradeOff
    );
    set({ routes: updatedRoutes });
  },
}));
