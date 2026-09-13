import React, { useState, useRef, useEffect } from 'react';
import { useRouteStore } from '../stores/routeStore';
import { searchDelhiLocations } from '../services/geocodingService';
import type { LocationPoint } from '../types';

export const PlanRoutePanel: React.FC = () => {
  const {
    mode,
    startPoint,
    endPoint,
    setStartPoint,
    setEndPoint,
    setIsNavigating,
    selectPresetRoute,
    useCurrentLocation,
    activePinMode,
    setActivePinMode,
    routes,
  } = useRouteStore();

  const isNight = mode === 'night';

  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const startContainerRef = useRef<HTMLDivElement>(null);
  const endContainerRef = useRef<HTMLDivElement>(null);

  const startResults = searchDelhiLocations(startQuery);
  const endResults = searchDelhiLocations(endQuery);

  const canNavigate = Boolean(startPoint && endPoint);
  const activeRoute = routes[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (startContainerRef.current && !startContainerRef.current.contains(event.target as Node)) {
        setIsStartOpen(false);
      }
      if (endContainerRef.current && !endContainerRef.current.contains(event.target as Node)) {
        setIsEndOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectStart = (point: LocationPoint) => {
    setStartPoint(point);
    setStartQuery('');
    setIsStartOpen(false);
  };

  const handleSelectEnd = (point: LocationPoint) => {
    setEndPoint(point);
    setEndQuery('');
    setIsEndOpen(false);
  };

  const handleDirectionsClick = () => {
    if (canNavigate) {
      setIsNavigating(true);
    } else if (!startPoint) {
      setIsStartOpen(true);
    } else if (!endPoint) {
      setIsEndOpen(true);
    }
  };

  // Dynamic status text for bottom left
  let statusText = 'Enter your starting point';
  if (startPoint && !endPoint) {
    statusText = 'Enter destination address';
  } else if (startPoint && endPoint) {
    statusText = activeRoute
      ? `${activeRoute.totalDistanceMeters}m • ~${activeRoute.estimatedDurationMinutes} min walk`
      : 'Ready for directions';
  }

  return (
    <div
      className={`rounded-2xl p-5 select-none shadow-2xl transition-colors duration-300 ${
        isNight
          ? 'bg-[#14171c] border border-[#232732] text-[#f3f4f6]'
          : 'bg-white border border-slate-200 text-slate-900 shadow-xl'
      }`}
    >
      {/* Header */}
      <div className="mb-4">
        <span
          className={`block font-mono text-[10px] tracking-widest font-semibold uppercase ${
            isNight ? 'text-[#71798a]' : 'text-slate-400'
          }`}
        >
          WALKING DIRECTIONS
        </span>
        <h1
          className={`text-2xl font-bold tracking-tight mt-1 ${
            isNight ? 'text-white' : 'text-slate-900'
          }`}
        >
          Plan your route
        </h1>
      </div>

      {/* Starting Point Section */}
      <div className="relative">
        <label
          className={`block font-mono text-[10px] uppercase tracking-wider font-semibold mb-1.5 ${
            isNight ? 'text-[#7e8798]' : 'text-slate-500'
          }`}
        >
          STARTING POINT
        </label>

        {/* Starting Point Input Box */}
        <div ref={startContainerRef} className="relative">
          <div
            className={`flex items-center rounded-xl px-3 py-2 border transition-all ${
              isNight
                ? 'bg-[#1b1f27] border-[#292f3d] focus-within:border-[#38bdf8]/60'
                : 'bg-slate-50 border-slate-200 focus-within:border-orange-500'
            }`}
          >
            {/* Lime/Green Dot */}
            <span className="w-2.5 h-2.5 rounded-full bg-[#84cc16] shrink-0 mr-3 shadow-sm" />

            {/* Input field */}
            <input
              type="text"
              value={isStartOpen ? startQuery : startPoint?.name || ''}
              onFocus={() => {
                setIsStartOpen(true);
                setStartQuery('');
              }}
              onChange={(e) => setStartQuery(e.target.value)}
              placeholder="Enter starting address"
              className={`w-full bg-transparent text-xs outline-none ${
                isNight
                  ? 'text-white placeholder-[#687182]'
                  : 'text-slate-900 placeholder:text-slate-400'
              }`}
            />

            {/* Right Buttons: Map & Search */}
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <button
                type="button"
                onClick={() => setActivePinMode(activePinMode === 'start' ? 'none' : 'start')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  activePinMode === 'start'
                    ? isNight
                      ? 'bg-[#84cc16] text-[#0c0e11] font-bold'
                      : 'bg-emerald-600 text-white font-bold'
                    : isNight
                    ? 'bg-[#242935] hover:bg-[#2c3342] text-[#8d95a5] hover:text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-950'
                }`}
                title="Choose starting point by clicking on map"
              >
                Map
              </button>
              <button
                type="button"
                onClick={() => setIsStartOpen(!isStartOpen)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  isNight
                    ? 'bg-[#242935] hover:bg-[#2c3342] text-[#8d95a5] hover:text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-950'
                }`}
              >
                Search
              </button>
            </div>
          </div>

          {/* Autocomplete dropdown for Start Point */}
          {isStartOpen && (
            <div
              className={`absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl shadow-2xl max-h-52 overflow-y-auto border p-1 ${
                isNight
                  ? 'bg-[#161a22] border-[#292f3d] text-[#f3f4f6]'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              {startResults.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleSelectStart(loc)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex flex-col cursor-pointer ${
                    isNight ? 'hover:bg-[#202531] text-[#f3f4f6]' : 'hover:bg-slate-100 text-slate-900'
                  }`}
                >
                  <span className="font-semibold text-xs">{loc.name}</span>
                  <span className={`text-[10px] truncate ${isNight ? 'text-[#717a8c]' : 'text-slate-500'}`}>
                    {loc.description}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Subtitle with vertical connector stem */}
        <div className="relative flex items-center py-2">
          {/* Vertical line connecting Green dot to White dot */}
          <div
            className={`absolute left-[17px] top-0 bottom-0 w-[1.5px] ${
              isNight ? 'bg-[#2a303e]' : 'bg-slate-300'
            }`}
          />
          <p
            className={`pl-8 text-xs ${
              isNight ? 'text-[#565e6f]' : 'text-slate-400'
            }`}
          >
            Search an address or choose it on the map
          </p>
        </div>
      </div>

      {/* Destination Section */}
      <div className="relative mb-3">
        <label
          className={`block font-mono text-[10px] uppercase tracking-wider font-semibold mb-1.5 ${
            isNight ? 'text-[#7e8798]' : 'text-slate-500'
          }`}
        >
          DESTINATION
        </label>

        {/* Destination Input Box */}
        <div ref={endContainerRef} className="relative">
          <div
            className={`flex items-center rounded-xl px-3 py-2 border transition-all ${
              isNight
                ? 'bg-[#1b1f27] border-[#292f3d] focus-within:border-white/60'
                : 'bg-slate-50 border-slate-200 focus-within:border-slate-800'
            }`}
          >
            {/* White Dot */}
            <span className="w-2.5 h-2.5 rounded-full bg-white shrink-0 mr-3 shadow-sm" />

            {/* Input field */}
            <input
              type="text"
              value={isEndOpen ? endQuery : endPoint?.name || ''}
              onFocus={() => {
                setIsEndOpen(true);
                setEndQuery('');
              }}
              onChange={(e) => setEndQuery(e.target.value)}
              placeholder="Enter destination address"
              className={`w-full bg-transparent text-xs outline-none ${
                isNight
                  ? 'text-white placeholder-[#687182]'
                  : 'text-slate-900 placeholder:text-slate-400'
              }`}
            />

            {/* Right Buttons: Map & Search */}
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <button
                type="button"
                onClick={() => setActivePinMode(activePinMode === 'end' ? 'none' : 'end')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  activePinMode === 'end'
                    ? isNight
                      ? 'bg-white text-[#0c0e11] font-bold'
                      : 'bg-slate-900 text-white font-bold'
                    : isNight
                    ? 'bg-[#242935] hover:bg-[#2c3342] text-[#8d95a5] hover:text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-950'
                }`}
                title="Choose destination by clicking on map"
              >
                Map
              </button>
              <button
                type="button"
                onClick={() => setIsEndOpen(!isEndOpen)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  isNight
                    ? 'bg-[#242935] hover:bg-[#2c3342] text-[#8d95a5] hover:text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-950'
                }`}
              >
                Search
              </button>
            </div>
          </div>

          {/* Autocomplete dropdown for Destination */}
          {isEndOpen && (
            <div
              className={`absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl shadow-2xl max-h-52 overflow-y-auto border p-1 ${
                isNight
                  ? 'bg-[#161a22] border-[#292f3d] text-[#f3f4f6]'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              {endResults.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleSelectEnd(loc)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex flex-col cursor-pointer ${
                    isNight ? 'hover:bg-[#202531] text-[#f3f4f6]' : 'hover:bg-slate-100 text-slate-900'
                  }`}
                >
                  <span className="font-semibold text-xs">{loc.name}</span>
                  <span className={`text-[10px] truncate ${isNight ? 'text-[#717a8c]' : 'text-slate-500'}`}>
                    {loc.description}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Subtitle under destination */}
        <p
          className={`text-xs mt-2 pl-1 ${
            isNight ? 'text-[#565e6f]' : 'text-slate-400'
          }`}
        >
          Search an address or choose it on the map
        </p>
      </div>

      {/* "Use my current location" Action Card */}
      <button
        type="button"
        onClick={useCurrentLocation}
        className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-all cursor-pointer mb-4 ${
          isNight
            ? 'bg-[#131d2e] hover:bg-[#16243a] border-[#2563eb]/70 text-white'
            : 'bg-blue-50/90 hover:bg-blue-100 border-blue-400/80 text-blue-950'
        }`}
      >
        {/* Reticle Target Crosshair Icon */}
        <svg
          className={`w-5 h-5 shrink-0 ${isNight ? 'text-[#3b82f6]' : 'text-blue-600'}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="7" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <line x1="12" y1="1" x2="12" y2="4" />
          <line x1="12" y1="20" x2="12" y2="23" />
          <line x1="1" y1="12" x2="4" y2="12" />
          <line x1="20" y1="12" x2="23" y2="12" />
        </svg>

        <div>
          <div className="font-semibold text-[13px] leading-tight text-white">
            Use my current location
          </div>
          <div
            className={`text-xs mt-0.5 ${
              isNight ? 'text-[#7588a4]' : 'text-blue-700'
            }`}
          >
            set as starting point
          </div>
        </div>
      </button>

      {/* Bottom Row: Status Text on left, Directions Button on right */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <span
          className={`text-xs font-normal truncate max-w-[200px] ${
            isNight ? 'text-[#717a8c]' : 'text-slate-500'
          }`}
        >
          {statusText}
        </span>

        <button
          type="button"
          onClick={handleDirectionsClick}
          className={`px-5 py-2.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
            canNavigate
              ? isNight
                ? 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-md'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
              : isNight
              ? 'bg-[#242935] text-[#555e70] hover:text-[#7b8394]'
              : 'bg-slate-200 text-slate-400 hover:text-slate-600'
          }`}
        >
          Directions
        </button>
      </div>

      {/* Footer / Sample Trips Link */}
      <div className="mt-4 pt-2">
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${
            isNight ? 'text-[#717a8c] hover:text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span className="text-[10px] transform transition-transform">
            {showPresets ? '▼' : '▶'}
          </span>
          <span>or try a sample Delhi trip</span>
        </button>

        {showPresets && (
          <div
            className={`space-y-1 mt-2.5 p-2 rounded-xl border ${
              isNight
                ? 'bg-[#1b1f27] border-[#292f3d]'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                selectPresetRoute('rajiv-chowk-gate2', 'mandi-house');
                setIsNavigating(true);
              }}
              className={`w-full text-left p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                isNight ? 'hover:bg-[#252a36] text-white' : 'hover:bg-white text-slate-900'
              }`}
            >
              <div className="font-semibold">Rajiv Chowk Metro → Mandi House</div>
              <div className={`text-[10px] ${isNight ? 'text-[#717a8c]' : 'text-slate-500'}`}>
                Colonnade verandahs vs wide Barakhamba avenue
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                selectPresetRoute('palika-bazaar', 'janpath-market');
                setIsNavigating(true);
              }}
              className={`w-full text-left p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                isNight ? 'hover:bg-[#252a36] text-white' : 'hover:bg-white text-slate-900'
              }`}
            >
              <div className="font-semibold">Palika Bazaar → Janpath Market</div>
              <div className={`text-[10px] ${isNight ? 'text-[#717a8c]' : 'text-slate-500'}`}>
                High footfall artisanal shopping lane
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                selectPresetRoute('shivaji-bridge', 'barakhamba-towers');
                setIsNavigating(true);
              }}
              className={`w-full text-left p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                isNight ? 'hover:bg-[#252a36]' : 'hover:bg-white'
              }`}
            >
              <div className={`font-semibold ${isNight ? 'text-[#f97316]' : 'text-orange-600'}`}>
                Shivaji Underpass → Barakhamba Towers
              </div>
              <div className={`text-[10px] ${isNight ? 'text-[#717a8c]' : 'text-slate-500'}`}>
                Demonstrates avoidance of unlit rail underpass at night
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
