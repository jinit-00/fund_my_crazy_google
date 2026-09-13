import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Map,
  Marker,
  Popup,
  LngLatBounds,
  NavigationControl,
  type GeoJSONSource,
  type StyleSpecification,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useRouteStore } from '../stores/routeStore';
import { DELHI_POIS } from '../data/pois';
import { CONNAUGHT_PLACE_3D_BUILDINGS } from '../data/cpBuildings';
import { createPinLocation } from '../services/geocodingService';
import {
  generateContinuousHeatmapRaster,
  calculateContinuousPointSafety,
  getHeatmapStats,
  BOUNDS,
} from '../services/safetyHeatmapService';
import type { RouteOption, AppMode } from '../types';
import { Eye, EyeOff, Droplets } from 'lucide-react';

// High-fidelity, zero-watermark OpenStreetMap raster styles (100% free, no API key, no watermark)
const MAP_DARK_STYLE: StyleSpecification = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    'osm-dark-tiles': {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors, Tiles style by Humanitarian OpenStreetMap Team',
    },
  },
  layers: [
    {
      id: 'osm-dark-base',
      type: 'raster',
      source: 'osm-dark-tiles',
      minzoom: 0,
      maxzoom: 20,
      paint: {
        'raster-brightness-max': 0.55,
        'raster-brightness-min': 0.05,
        'raster-contrast': 0.35,
        'raster-saturation': -0.75,
      },
    },
  ],
};

const MAP_LIGHT_STYLE: StyleSpecification = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    'osm-light-tiles': {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors, Tiles style by Humanitarian OpenStreetMap Team',
    },
  },
  layers: [
    {
      id: 'osm-light-base',
      type: 'raster',
      source: 'osm-light-tiles',
      minzoom: 0,
      maxzoom: 20,
    },
  ],
};

export const MapViewport: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const startMarkerRef = useRef<Marker | null>(null);
  const endMarkerRef = useRef<Marker | null>(null);
  const poiMarkersRef = useRef<Marker[]>([]);
  const prevModeRef = useRef<string>('');
  const heatmapPopupRef = useRef<Popup | null>(null);
  const hoverTooltipRef = useRef<Popup | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);

  const heatmapRaster = React.useMemo(() => generateContinuousHeatmapRaster(256, 256), []);

  const {
    mode,
    startPoint,
    endPoint,
    routes,
    selectedRouteId,
    setStartPoint,
    setEndPoint,
    showPOILayers,
    setShowPOILayers,
    showWaterHutsLayer,
    setShowWaterHutsLayer,
    setActivePinMode,
    setHeatmapStats,
  } = useRouteStore();

  useEffect(() => {
    const stats = getHeatmapStats();
    setHeatmapStats(stats);
  }, [setHeatmapStats]);

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const isNight = mode === 'night';
  const isDark = mode === 'night' || mode === 'heatmap';

  // Helper to add 3D building extrusions, safety heat map layers, and route geometry
  const setupMapLayers = useCallback((map: Map, currentMode: AppMode) => {
    const isNightMode = currentMode === 'night' || currentMode === 'heatmap';

    // 1. Add OSM 3D Building Extrusions across Delhi if openmaptiles vector source exists
    try {
      if (map.getSource('openmaptiles') && !map.getLayer('3d-buildings-osm')) {
        const layers = map.getStyle()?.layers || [];
        let firstSymbolId: string | undefined;
        for (const layer of layers) {
          if (layer.type === 'symbol') {
            firstSymbolId = layer.id;
            break;
          }
        }

        const buildingColors = isNightMode
          ? [
              'interpolate',
              ['linear'],
              ['coalesce', ['get', 'render_height'], 12],
              0, '#1c1f26',
              20, '#232832',
              50, '#2b333f',
              100, '#384252',
            ]
          : [
              'interpolate',
              ['linear'],
              ['coalesce', ['get', 'render_height'], 12],
              0, '#e2e8f0',
              20, '#cbd5e1',
              50, '#94a3b8',
              100, '#64748b',
            ];

        map.addLayer(
          {
            id: '3d-buildings-osm',
            source: 'openmaptiles',
            'source-layer': 'building',
            type: 'fill-extrusion',
            minzoom: 13,
            paint: {
              'fill-extrusion-color': buildingColors as any,
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                13, 0,
                13.5, ['coalesce', ['get', 'render_height'], 12],
              ],
              'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                13, 0,
                13.5, ['coalesce', ['get', 'render_min_height'], 0],
              ],
              'fill-extrusion-opacity': isNightMode ? 0.85 : 0.75,
            },
          },
          firstSymbolId
        );
      }
    } catch (e) {
      console.warn('OSM 3d buildings layer setup skipped:', e);
    }

    // 2. Add Connaught Place High-Precision 3D Extrusions (Blocks A-F & Central Towers)
    try {
      if (!map.getSource('cp-3d-buildings')) {
        map.addSource('cp-3d-buildings', {
          type: 'geojson',
          data: CONNAUGHT_PLACE_3D_BUILDINGS,
        });
      }

      if (!map.getLayer('cp-3d-buildings-layer')) {
        map.addLayer({
          id: 'cp-3d-buildings-layer',
          type: 'fill-extrusion',
          source: 'cp-3d-buildings',
          paint: {
            'fill-extrusion-color': isNightMode ? (['get', 'color'] as any) : '#e2e8f0',
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 0.92,
          },
        });
      }
    } catch (e) {
      console.warn('CP 3D buildings setup error:', e);
    }

    // 3. Add Safety Heat Map Continuous Gradient Raster Layer (Bilinear hardware filtered, 55% opacity)
    try {
      if (!map.getSource('delhi-safety-heatmap-raster')) {
        map.addSource('delhi-safety-heatmap-raster', {
          type: 'image',
          url: heatmapRaster.dataUrl,
          coordinates: heatmapRaster.coordinates,
        });
      }

      if (!map.getLayer('delhi-safety-heatmap-raster-layer')) {
        map.addLayer(
          {
            id: 'delhi-safety-heatmap-raster-layer',
            type: 'raster',
            source: 'delhi-safety-heatmap-raster',
            layout: {
              visibility: currentMode === 'heatmap' ? 'visible' : 'none',
            },
            paint: {
              'raster-opacity': 0.55,
              'raster-fade-duration': 0,
              'raster-resampling': 'linear',
            },
          },
          map.getLayer('cp-3d-buildings-layer') ? 'cp-3d-buildings-layer' : undefined
        );
      }
    } catch (e) {
      console.warn('Safety heatmap raster setup error:', e);
    }

    // 4. Add Active Route Line Layers
    try {
      if (!map.getSource('route-active')) {
        map.addSource('route-active', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: [] },
          },
        });
      }

      if (!map.getLayer('route-active-casing')) {
        map.addLayer({
          id: 'route-active-casing',
          type: 'line',
          source: 'route-active',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': isNightMode ? '#080a0d' : '#ffffff',
            'line-width': 8,
            'line-opacity': 0.95,
          },
        });
      }

      if (!map.getLayer('route-active-line')) {
        map.addLayer({
          id: 'route-active-line',
          type: 'line',
          source: 'route-active',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': isNightMode ? '#38bdf8' : '#ea580c',
            'line-width': 5,
            'line-opacity': 1,
          },
        });
      }
    } catch (e) {
      console.warn('Active route layer setup error:', e);
    }

    // 5. Add Alternative Routes Layer
    try {
      if (!map.getSource('routes-alt')) {
        map.addSource('routes-alt', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
      }

      if (!map.getLayer('routes-alt-line')) {
        map.addLayer({
          id: 'routes-alt-line',
          type: 'line',
          source: 'routes-alt',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': isNightMode ? '#424856' : '#94a3b8',
            'line-width': 3,
            'line-dasharray': [2, 2],
            'line-opacity': 0.7,
          },
        });
      }
    } catch (e) {
      console.warn('Alternative routes layer setup error:', e);
    }

    setMapLoaded(true);
    try {
      map.resize();
    } catch {
      // ignore
    }
  }, [heatmapRaster]);

  // Update Route geometry & camera fit
  const updateRouteGeometry = useCallback(
    (map: Map, route: RouteOption | undefined, allRoutes: RouteOption[], currentMode: AppMode) => {
      const isHeatmapMode = currentMode === 'heatmap';

      if (isHeatmapMode) {
        if (map.getLayer('route-active-line')) {
          map.setLayoutProperty('route-active-line', 'visibility', 'none');
        }
        if (map.getLayer('route-active-casing')) {
          map.setLayoutProperty('route-active-casing', 'visibility', 'none');
        }
        if (map.getLayer('routes-alt-line')) {
          map.setLayoutProperty('routes-alt-line', 'visibility', 'none');
        }
        return;
      }

      if (map.getLayer('route-active-line')) {
        map.setLayoutProperty('route-active-line', 'visibility', 'visible');
      }
      if (map.getLayer('route-active-casing')) {
        map.setLayoutProperty('route-active-casing', 'visibility', 'visible');
      }
      if (map.getLayer('routes-alt-line')) {
        map.setLayoutProperty('routes-alt-line', 'visibility', 'visible');
      }

      if (!route) return;

      const activeSource = map.getSource('route-active') as GeoJSONSource | undefined;
      if (activeSource) {
        activeSource.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route.coordinates,
          },
        });
      }

      const altSource = map.getSource('routes-alt') as GeoJSONSource | undefined;
      if (altSource) {
        const altRoutes = allRoutes.filter((r) => r.id !== route.id);
        altSource.setData({
          type: 'FeatureCollection',
          features: altRoutes.map((r) => ({
            type: 'Feature',
            properties: { id: r.id },
            geometry: {
              type: 'LineString',
              coordinates: r.coordinates,
            },
          })),
        });
      }

      // Dynamic color based on category and mode
      if (map.getLayer('route-active-line')) {
        const isNightMode = currentMode === 'night';
        const isSafety = route.category === 'safety';
        const routeColor = isSafety
          ? isNightMode ? '#38bdf8' : '#0284c7'
          : isNightMode ? '#fb923c' : '#ea580c';
        map.setPaintProperty('route-active-line', 'line-color', routeColor);
      }

      if (map.getLayer('route-active-casing')) {
        const isNightMode = currentMode === 'night';
        map.setPaintProperty('route-active-casing', 'line-color', isNightMode ? '#080a0d' : '#ffffff');
      }

      // Fit camera to encompass route
      if (route.coordinates.length >= 2) {
        try {
          const bounds = new LngLatBounds();
          for (const coord of route.coordinates) {
            bounds.extend(coord as [number, number]);
          }
          map.fitBounds(bounds, {
            padding: { top: 70, bottom: 70, left: 70, right: 70 },
            pitch: 52,
            bearing: -15,
            duration: 600,
            maxZoom: 16.5,
          });
        } catch (err) {
          console.warn('fitBounds caught:', err);
        }
      }
    },
    []
  );

  // Initialize MapLibre GL map (Token-free, 100% reliable 3D vector model)
  useEffect(() => {
    if (!mapContainerRef.current) return;
    let isCancelled = false;

    const initialStyle = mode === 'day' ? MAP_LIGHT_STYLE : MAP_DARK_STYLE;
    prevModeRef.current = mode;

    const map = new Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: [77.2197, 28.6315], // Connaught Place Central Park
      zoom: 15.6,
      pitch: 52,
      bearing: -15,
      maxPitch: 85,
    });
    mapRef.current = map;

    // 3D Navigation Controls (Compass, Pitch, Zoom) like Google Maps 3D
    const navControl = new NavigationControl({
      visualizePitch: true,
      showCompass: true,
      showZoom: true,
    });
    map.addControl(navControl, 'bottom-right');

    map.on('error', (e) => {
      console.warn('Map error caught:', e?.error?.message || e);
    });

    // Provide seamless 1x1 transparent fallbacks for any missing patterns/sprites
    map.on('styleimagemissing', (e: { id: string }) => {
      if (!map.hasImage(e.id)) {
        map.addImage(e.id, { width: 1, height: 1, data: new Uint8Array([0, 0, 0, 0]) });
      }
    });

    map.on('load', () => {
      if (isCancelled) return;
      setupMapLayers(map, mode);
    });

    // Ensure WebGL viewport resizes accurately right after mount
    requestAnimationFrame(() => {
      if (!isCancelled && map) {
        map.resize();
      }
    });
    const resizeTimer = setTimeout(() => {
      if (!isCancelled && map) {
        map.resize();
      }
    }, 250);

    // Continuous spatial heatmap interactions across expanded Delhi bounds
    const isInsideBounds = (lng: number, lat: number) =>
      lng >= BOUNDS.minLng && lng <= BOUNDS.maxLng && lat >= BOUNDS.minLat && lat <= BOUNDS.maxLat;

    map.on('mousemove', (e: { lngLat: { lng: number; lat: number } }) => {
      if (useRouteStore.getState().mode !== 'heatmap') return;
      const { lng, lat } = e.lngLat;

      if (!isInsideBounds(lng, lat)) {
        map.getCanvas().style.cursor = '';
        if (hoverTooltipRef.current) {
          hoverTooltipRef.current.remove();
          hoverTooltipRef.current = null;
        }
        return;
      }

      map.getCanvas().style.cursor = 'crosshair';

      if (heatmapPopupRef.current && heatmapPopupRef.current.isOpen()) return;

      const pointData = calculateContinuousPointSafety([lng, lat]);
      if (!hoverTooltipRef.current) {
        hoverTooltipRef.current = new Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 12,
          className: 'heatmap-hover-tooltip',
        });
      }
      hoverTooltipRef.current
        .setLngLat(e.lngLat)
        .setHTML(`
          <div class="px-2.5 py-1.5 bg-[#0c0e11]/95 text-white font-sans text-xs rounded-lg border border-[#262b36] shadow-2xl pointer-events-none">
            <div class="font-bold flex items-center justify-between gap-3">
              <span class="text-white">${pointData.name}</span>
              <span class="font-mono font-bold px-1.5 py-0.5 rounded text-[10px] text-[#0c0e11]" style="background-color: ${pointData.color}">
                ${pointData.safetyScore}/100
              </span>
            </div>
            <div class="text-[10px] text-[#9ca3af] mt-1">${pointData.contributingFactor}</div>
          </div>
        `)
        .addTo(map);
    });

    const canvas = map.getCanvas();
    const handleMouseLeave = () => {
      canvas.style.cursor = '';
      if (hoverTooltipRef.current) {
        hoverTooltipRef.current.remove();
        hoverTooltipRef.current = null;
      }
    };
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Handle map clicks (continuous sampling in heatmap mode, pin dropping in routing modes)
    map.on('click', (e: { lngLat: { lng: number; lat: number } }) => {
      const { lng, lat } = e.lngLat;

      if (useRouteStore.getState().mode === 'heatmap') {
        if (!isInsideBounds(lng, lat)) return;

        if (hoverTooltipRef.current) {
          hoverTooltipRef.current.remove();
          hoverTooltipRef.current = null;
        }

        const pointData = calculateContinuousPointSafety([lng, lat]);
        const clickedCoord: [number, number] = [lng, lat];

        if (heatmapPopupRef.current) {
          heatmapPopupRef.current.remove();
        }

        const popupContent = document.createElement('div');
        popupContent.className = 'p-3 bg-[#0c0e11] text-white font-sans text-xs rounded-xl border border-[#232836] shadow-2xl min-w-[270px]';
        popupContent.innerHTML = `
          <div class="flex items-center justify-between border-b border-[#1f2430] pb-2 mb-2">
            <span class="font-bold text-sm text-white">${pointData.name}</span>
            <span class="font-mono font-bold px-2 py-0.5 rounded text-xs text-[#0c0e11]" style="background-color: ${pointData.color}">
              ${pointData.safetyScore}/100
            </span>
          </div>
          <div class="text-[11px] font-semibold text-[#38bdf8] mb-1.5">
            ${pointData.riskLabel || ''}
          </div>
          <div class="text-[11px] text-[#9ca3af] bg-[#141822] p-2.5 rounded-lg border border-[#232836] mb-2.5 leading-relaxed">
            <span class="text-[#e2e8f0] font-semibold text-[10px] uppercase tracking-wider block mb-0.5">Continuous Sampled Factor</span>
            ${pointData.contributingFactor}
          </div>
          <div class="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-[#8a92a3] bg-[#12151c] p-2 rounded border border-[#1f2430] mb-3">
            <div>Lighting: <span class="text-white font-bold">${pointData.lightingScore}/100</span></div>
            <div>Incident Risk: <span class="text-white font-bold">${pointData.incidentSafety}/100</span></div>
            <div>Foot Traffic: <span class="text-white font-bold">${pointData.footTrafficScore}/100</span></div>
            <div>Police Prox: <span class="text-white font-bold">${pointData.policeProximityScore}/100</span></div>
          </div>
          <div class="flex items-center justify-between text-[10px] font-mono text-[#64748b] mb-2.5 px-0.5">
            <span>Data Signal:</span>
            <span class="text-slate-300 font-semibold">${pointData.isRealData ? 'Verified Grounded Data' : 'Calibrated Sim'}</span>
          </div>
          <button id="btn-route-to-heatmap-cell" class="w-full py-2 px-3 rounded-lg bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#0c0e11] font-mono font-bold text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5">
            <span>🛡️ Route through here safely</span>
          </button>
        `;

        const btn = popupContent.querySelector('#btn-route-to-heatmap-cell');
        if (btn) {
          btn.addEventListener('click', () => {
            useRouteStore.getState().routeToCell(clickedCoord, pointData.name);
            heatmapPopupRef.current?.remove();
          });
        }

        heatmapPopupRef.current = new Popup({
          offset: 12,
          closeButton: true,
          className: 'heatmap-click-popup',
        })
          .setLngLat(e.lngLat)
          .setDOMContent(popupContent)
          .addTo(map);

        return;
      }

      // Handle pin-drop clicks in routing modes
      const clickedCoord: [number, number] = [lng, lat];
      const newPin = createPinLocation(clickedCoord);

      const currentPinMode = useRouteStore.getState().activePinMode;
      if (currentPinMode === 'start') {
        setStartPoint(newPin);
        setActivePinMode('none');
      } else if (currentPinMode === 'end') {
        setEndPoint(newPin);
        setActivePinMode('none');
      } else {
        if (!startPoint) {
          setStartPoint(newPin);
        } else {
          setEndPoint(newPin);
        }
      }
    });

    // Resize observer for responsive layout changes
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      isCancelled = true;
      clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, []);

  // Handle Mode Change (Morning = Clean Street Map, Night = Dark Precision Map, Heatmap = Dark Map with Raster)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (prevModeRef.current !== mode) {
      const wasDark = prevModeRef.current === 'night' || prevModeRef.current === 'heatmap';
      const isNowDark = mode === 'night' || mode === 'heatmap';
      prevModeRef.current = mode;

      // If transitioning between night and heatmap, both use dark style — toggle instantly without reload!
      if (wasDark && isNowDark) {
        if (map.getLayer('delhi-safety-heatmap-raster-layer')) {
          map.setLayoutProperty(
            'delhi-safety-heatmap-raster-layer',
            'visibility',
            mode === 'heatmap' ? 'visible' : 'none'
          );
        }
        updateRouteGeometry(map, activeRoute, routes, mode);
        if (mode === 'heatmap') {
          map.flyTo({
            center: [77.220, 28.625],
            zoom: 12.8,
            pitch: 38,
            bearing: -10,
            duration: 800,
          });
        }
      } else {
        const targetStyle = mode === 'day' ? MAP_LIGHT_STYLE : MAP_DARK_STYLE;
        map.setStyle(targetStyle);
        map.once('style.load', () => {
          setupMapLayers(map, mode);
          updateRouteGeometry(map, activeRoute, routes, mode);
          if (mode === 'heatmap') {
            map.flyTo({
              center: [77.220, 28.625],
              zoom: 12.8,
              pitch: 38,
              bearing: -10,
              duration: 800,
            });
          }
        });
      }
    }
  }, [mode, mapLoaded, activeRoute, routes, setupMapLayers, updateRouteGeometry]);

  // Update Route geometry & color on route change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !activeRoute) return;
    updateRouteGeometry(map, activeRoute, routes, mode);
  }, [activeRoute, routes, mapLoaded, mode, updateRouteGeometry]);

  // Start & End HTML Markers (Clean, crisp, non-green styling)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (startMarkerRef.current) startMarkerRef.current.remove();
    if (endMarkerRef.current) endMarkerRef.current.remove();

    if (mode === 'heatmap') {
      return; // No route markers in exploratory heatmap view
    }

    // Start marker: Morning = clean white badge with orange accent; Night = dark badge with cyan accent
    if (startPoint) {
      const el = document.createElement('div');
      el.className = 'flex flex-col items-center cursor-pointer';
      if (isNight) {
        el.innerHTML = `
          <div class="px-1.5 py-0.5 rounded bg-[#12151a] text-[#38bdf8] font-mono text-[9px] font-bold border border-[#262b36] shadow-lg mb-1">
            A • ORIGIN
          </div>
          <div class="w-3.5 h-3.5 rounded-full bg-[#38bdf8] border-2 border-[#12151a] shadow-md"></div>
        `;
      } else {
        el.innerHTML = `
          <div class="px-1.5 py-0.5 rounded bg-white text-orange-600 font-mono text-[9px] font-bold border border-slate-300 shadow-md mb-1">
            A • ORIGIN
          </div>
          <div class="w-3.5 h-3.5 rounded-full bg-orange-600 border-2 border-white shadow-md"></div>
        `;
      }
      startMarkerRef.current = new Marker({ element: el })
        .setLngLat(startPoint.coordinates)
        .addTo(map);
    }

    // End marker: Morning = clean white badge with slate accent; Night = dark badge with white accent
    if (endMarkerRef.current) endMarkerRef.current.remove();
    if (endPoint) {
      const el = document.createElement('div');
      el.className = 'flex flex-col items-center cursor-pointer';
      if (isNight) {
        el.innerHTML = `
          <div class="px-1.5 py-0.5 rounded bg-[#12151a] text-white font-mono text-[9px] font-bold border border-[#262b36] shadow-lg mb-1">
            B • DESTINATION
          </div>
          <div class="w-3.5 h-3.5 rounded-full bg-white border-2 border-[#12151a] shadow-md"></div>
        `;
      } else {
        el.innerHTML = `
          <div class="px-1.5 py-0.5 rounded bg-white text-slate-900 font-mono text-[9px] font-bold border border-slate-300 shadow-md mb-1">
            B • DESTINATION
          </div>
          <div class="w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-white shadow-md"></div>
        `;
      }
      endMarkerRef.current = new Marker({ element: el })
        .setLngLat(endPoint.coordinates)
        .addTo(map);
    }
  }, [startPoint, endPoint, mapLoaded, isNight, mode]);

  // Render Color-Coded POI Dot Layers (Water teal, Cooling cyan, Safety blue)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    poiMarkersRef.current.forEach((m) => m.remove());
    poiMarkersRef.current = [];

    if (!showPOILayers) return;

    DELHI_POIS.forEach((poi) => {
      // Independent toggle for water huts / shelters
      if (poi.type === 'water_hut' && !showWaterHutsLayer) {
        return;
      }

      const el = document.createElement('div');
      el.className = 'group cursor-pointer transform hover:scale-125 transition-transform';

      let dotColor = '#2dd4bf'; // default teal (public fountains)
      let label = 'WATER';

      if (poi.type === 'water_hut') {
        dotColor = '#2563eb'; // saturated vibrant cobalt / royal blue
        label = 'FREE WATER HUT';
      } else if (poi.type === 'cooling_center') {
        dotColor = '#38bdf8'; // cyan
        label = 'COOLING';
      } else if (poi.type === 'safety_anchor') {
        dotColor = '#60a5fa'; // soft blue
        label = 'POLICE';
      }

      const ringBorder = isNight ? '#0c0e11' : '#ffffff';
      el.innerHTML = `
        <div class="w-2.5 h-2.5 rounded-full border border-[${ringBorder}]" style="background-color: ${dotColor}; box-shadow: 0 0 6px ${dotColor}88;"></div>
      `;

      const sourceBadge = poi.source ? `<div class="mt-1 inline-flex items-center text-[8px] font-mono uppercase tracking-wider px-1 py-0.5 rounded ${isNight ? 'bg-[#182030] text-[#60a5fa]' : 'bg-blue-50 text-blue-700'}">source: ${poi.source}</div>` : '';

      const popup = new Popup({ offset: 12, closeButton: true }).setHTML(`
        <div class="${isNight ? 'text-[#f3f4f6]' : 'text-slate-900'} font-sans p-1">
          <div class="font-mono text-[9px] uppercase tracking-wider mb-0.5 font-bold" style="color: ${dotColor}">
            ${label}
          </div>
          <div class="font-bold text-xs ${isNight ? 'text-white' : 'text-slate-900'} mb-1">
            ${poi.name}
          </div>
          <p class="text-[11px] ${isNight ? 'text-[#9ca3af]' : 'text-slate-600'} leading-tight mb-1">
            ${poi.description}
          </p>
          ${poi.details ? `<div class="text-[9px] font-mono ${isNight ? 'text-[#7e8798] border-[#262b36]' : 'text-slate-500 border-slate-200'} border-t pt-1">${poi.details}</div>` : ''}
          ${sourceBadge}
        </div>
      `);

      // Add small hover tooltip on marker
      el.setAttribute('title', poi.type === 'water_hut' ? `${poi.name} (Free water point)` : poi.name);

      const marker = new Marker({ element: el })
        .setLngLat(poi.coordinates)
        .setPopup(popup)
        .addTo(map);

      poiMarkersRef.current.push(marker);
    });
  }, [mapLoaded, showPOILayers, showWaterHutsLayer, isNight]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Bottom-Left City Overview Hint (only in routing modes) */}
      {mode !== 'heatmap' && (
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none select-none hidden sm:block">
          <div
            className={`border rounded px-3 py-1.5 text-[10px] font-mono shadow-md ${
              isDark
                ? 'bg-[#0c0e11]/85 border-[#22262f] text-[#8a92a3]'
                : 'bg-white/90 border-slate-200 text-slate-600'
            }`}
          >
            <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>DELHI</span> • CITY OVERVIEW • Right-drag to rotate and tilt 3D buildings
          </div>
        </div>
      )}

      {/* Bottom-Right Controls: POI layers & Water Huts toggles (positioned above 3D navigation controls) */}
      <div className="absolute bottom-28 right-3.5 z-20 pointer-events-auto select-none flex flex-col items-end gap-1.5">
        {/* Independent Water Huts / Pyaaus Toggle */}
        <button
          onClick={() => setShowWaterHutsLayer(!showWaterHutsLayer)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-[10px] font-mono transition-colors shadow-lg cursor-pointer ${
            showWaterHutsLayer
              ? isNight
                ? 'bg-[#182436] hover:bg-[#1c2a40] border-[#2563eb]/60 text-white ring-1 ring-[#2563eb]/40'
                : 'bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-900 font-semibold ring-1 ring-blue-400/30'
              : isNight
              ? 'bg-[#12151a]/90 hover:bg-[#161920] border-[#262b36] text-[#6b7280] hover:text-white'
              : 'bg-white/90 hover:bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'
          }`}
          title="Toggle Free Water Huts & Traditional Pyaau Shelters"
        >
          <Droplets className={`w-3 h-3 ${showWaterHutsLayer ? 'text-[#3b82f6]' : 'text-[#64748b]'}`} />
          <span>{showWaterHutsLayer ? 'Water Huts (Pyaau): ON' : 'Water Huts: OFF'}</span>
        </button>

        {/* Master POI Layers Toggle */}
        <button
          onClick={() => setShowPOILayers(!showPOILayers)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-[10px] font-mono transition-colors shadow-lg cursor-pointer ${
            isNight
              ? 'bg-[#12151a] hover:bg-[#161920] border-[#262b36] text-[#9ca3af] hover:text-white'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-950'
          }`}
        >
          {showPOILayers ? (
            <EyeOff className={`w-3 h-3 ${isNight ? 'text-[#38bdf8]' : 'text-orange-600'}`} />
          ) : (
            <Eye className="w-3 h-3" />
          )}
          <span>{showPOILayers ? 'Hide All POIs' : 'Show All POIs'}</span>
        </button>
      </div>
    </div>
  );
};
