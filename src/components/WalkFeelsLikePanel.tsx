import React, { useState } from 'react';
import { useRouteStore } from '../stores/routeStore';
import { GeminiRouteBriefingCard } from './GeminiRouteBriefingCard';
import {
  ChevronDown,
  ChevronUp,
  Droplets,
  Trees,
  Snowflake,
  ShieldCheck,
  Edit3,
  Navigation,
} from 'lucide-react';

export const WalkFeelsLikePanel: React.FC = () => {
  const {
    mode,
    unit,
    routes,
    selectedRouteId,
    setSelectedRouteId,
    setIsNavigating,
    startPoint,
    endPoint,
  } = useRouteStore();

  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [showWalkSteps, setShowWalkSteps] = useState(true);

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const isNight = mode === 'night';

  if (!activeRoute) return null;

  const headlineTemp =
    unit === 'metric'
      ? `${activeRoute.feelsLike.feelsLikeTempC}°C`
      : `${activeRoute.feelsLike.feelsLikeTempF}°F`;

  const isCoolestSelected = activeRoute.category === 'coolest';
  const isSafetySelected = activeRoute.category === 'safety';

  const headlineMetric = isSafetySelected
    ? `${activeRoute.overallSafetyScore} / 100`
    : headlineTemp;

  const headlineMetricColor = isSafetySelected
    ? activeRoute.overallSafetyScore >= 85
      ? '#38bdf8'
      : activeRoute.overallSafetyScore >= 65
      ? '#f59e0b'
      : '#ef4444'
    : activeRoute.feelsLike.heatColor;

  const humanSummary = isSafetySelected
    ? `Optimized for personal safety: ${activeRoute.overallSafetyScore}/100 safety score, ${activeRoute.safetyAnchorCount} police/help anchors in sight, zero unlit alleys.`
    : isCoolestSelected
    ? `Optimized for shade: ${activeRoute.averageShadePercentage}% continuous cover via colonnades & tree canopies. Feels like ${headlineTemp} (${activeRoute.feelsLike.heatStressLabel}).`
    : `Direct physical walking route (~${activeRoute.estimatedDurationMinutes} min, ${activeRoute.totalDistanceMeters}m).`;

  const now = new Date();
  const arrivalDate = new Date(now.getTime() + activeRoute.estimatedDurationMinutes * 60000);
  const arrivalTime = arrivalDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div
      className={`rounded-lg p-4 text-xs select-none shadow-2xl space-y-3.5 transition-colors duration-300 ${
        isNight
          ? 'bg-[#12151a] border border-[#242832] text-[#f3f4f6]'
          : 'bg-white/95 border border-slate-200 text-slate-900 backdrop-blur-md'
      }`}
    >
      {/* Route Header & Edit Button */}
      <div
        className={`flex items-center justify-between pb-2 border-b ${
          isNight ? 'border-[#1d212a]' : 'border-slate-200'
        }`}
      >
        <div
          className={`flex items-center gap-1.5 font-mono text-[10px] ${
            isNight ? 'text-[#8a92a3]' : 'text-slate-500'
          }`}
        >
          <span className={`font-semibold truncate max-w-[110px] ${isNight ? 'text-white' : 'text-slate-900'}`}>
            {startPoint?.name}
          </span>
          <span>→</span>
          <span className={`font-semibold truncate max-w-[110px] ${isNight ? 'text-white' : 'text-slate-900'}`}>
            {endPoint?.name}
          </span>
        </div>
        <button
          onClick={() => setIsNavigating(false)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
            isNight
              ? 'bg-[#181c24] border border-[#262b36] text-[#9ca3af] hover:text-[#38bdf8]'
              : 'bg-slate-100 border border-slate-200 text-slate-700 hover:text-orange-600 hover:bg-slate-200'
          }`}
        >
          <Edit3 className="w-3 h-3" />
          <span>Edit</span>
        </button>
      </div>

      {/* Big Headline Metric: "WHAT THE WALK FEELS LIKE" */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-0.5">
          <span
            className={`block font-mono text-[9px] uppercase tracking-widest ${
              isNight ? 'text-[#6b7280]' : 'text-slate-400'
            }`}
          >
            {isSafetySelected ? 'PERSONAL SAFETY SCORE' : 'WHAT THE WALK FEELS LIKE'}
          </span>
          <span
            className={`font-mono text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
              isSafetySelected
                ? isNight
                  ? 'bg-[#1e2d3d] text-[#38bdf8]'
                  : 'bg-blue-100 text-blue-800'
                : isNight
                ? 'bg-[#332211] text-[#fb923c]'
                : 'bg-orange-100 text-orange-800'
            }`}
          >
            {activeRoute.categoryLabel || activeRoute.title}
          </span>
        </div>
        <div
          className="font-mono text-3xl sm:text-4xl font-black tracking-tight mt-0.5"
          style={{ color: headlineMetricColor }}
        >
          {headlineMetric}
        </div>
        <p className={`text-[11px] mt-1 leading-relaxed ${isNight ? 'text-[#9ca3af]' : 'text-slate-600'}`}>
          {humanSummary}
        </p>
      </div>

      {/* Gemini AI Route Intelligence & Safety Co-Pilot */}
      <GeminiRouteBriefingCard />

      {/* "Your Options" Section */}
      <div className={`pt-2 border-t ${isNight ? 'border-[#1d212a]' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between mb-1.5">
          <span
            className={`font-mono text-[9px] uppercase tracking-wider ${
              isNight ? 'text-[#6b7280]' : 'text-slate-400'
            }`}
          >
            CATEGORIES & OPTIONS
          </span>
          <span className={`font-mono text-[9px] ${isNight ? 'text-[#5f6675]' : 'text-slate-400'}`}>
            {routes.length} candidates
          </span>
        </div>

        {/* 2 Quick Category Select Pills */}
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          <button
            onClick={() => {
              const r = routes.find((x) => x.category === 'coolest');
              if (r) setSelectedRouteId(r.id);
            }}
            className={`p-1.5 rounded border text-center font-mono text-[10px] transition-all cursor-pointer ${
              activeRoute.category === 'coolest'
                ? isNight
                  ? 'bg-[#182430] border-[#38bdf8] text-white font-bold ring-1 ring-[#38bdf8]/40'
                  : 'bg-orange-50 border-orange-500 text-slate-900 font-bold ring-1 ring-orange-400/50 shadow-sm'
                : isNight
                ? 'bg-[#14171d] border-[#242832] text-[#8a92a3] hover:text-white'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>❄️ 1. Coolest Path</span>
          </button>

          <button
            onClick={() => {
              const r = routes.find((x) => x.category === 'safety');
              if (r) setSelectedRouteId(r.id);
            }}
            className={`p-1.5 rounded border text-center font-mono text-[10px] transition-all cursor-pointer ${
              activeRoute.category === 'safety'
                ? isNight
                  ? 'bg-[#182430] border-[#38bdf8] text-white font-bold ring-1 ring-[#38bdf8]/40'
                  : 'bg-blue-50 border-blue-500 text-slate-900 font-bold ring-1 ring-blue-400/50 shadow-sm'
                : isNight
                ? 'bg-[#14171d] border-[#242832] text-[#8a92a3] hover:text-white'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🛡️ 2. Best Safety</span>
          </button>
        </div>

        <div className="space-y-1.5">
          {routes.map((route) => {
            const isSelected = route.id === selectedRouteId;
            const isRecommended =
              (mode === 'day' && route.category === 'coolest') ||
              (mode === 'night' && route.category === 'safety');

            const routeTemp =
              unit === 'metric'
                ? `${route.feelsLike.feelsLikeTempC}°C`
                : `${route.feelsLike.feelsLikeTempF}°F`;

            const routeMetricBadge =
              route.category === 'safety'
                ? `${route.overallSafetyScore} safe`
                : routeTemp;

            const leftBorderColor =
              route.category === 'coolest'
                ? '#ea580c'
                : route.category === 'safety'
                ? '#0284c7'
                : '#64748b';

            const categoryIcon =
              route.category === 'coolest'
                ? '❄️'
                : route.category === 'safety'
                ? '🛡️'
                : '⚡';

            return (
              <button
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className={`w-full text-left p-2 rounded transition-all flex items-center justify-between cursor-pointer ${
                  isNight
                    ? isSelected
                      ? 'bg-[#181d26] border border-[#2d3442]'
                      : 'bg-[#14171d] hover:bg-[#181c24] border border-transparent'
                    : isSelected
                    ? 'bg-orange-50/80 border border-orange-200 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                }`}
                style={{ borderLeft: `3px solid ${leftBorderColor}` }}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px]">{categoryIcon}</span>
                    <span
                      className={`font-semibold text-[11px] ${
                        isNight ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {route.title}
                    </span>
                    {isRecommended && (
                      <span
                        className={`px-1 py-0.2 rounded font-mono text-[8px] font-bold uppercase ${
                          route.category === 'safety'
                            ? 'bg-[#38bdf8] text-[#0c0e11]'
                            : 'bg-orange-600 text-white'
                        }`}
                      >
                        {mode === 'day' ? 'Best for Sun' : 'Best for Night'}
                      </span>
                    )}
                  </div>
                  <div
                    className={`font-mono text-[10px] mt-0.5 ${
                      isNight ? 'text-[#6b7280]' : 'text-slate-500'
                    }`}
                  >
                    {route.category === 'coolest'
                      ? `${route.averageShadePercentage}% shade • ${route.estimatedDurationMinutes} min • ${route.totalDistanceMeters}m`
                      : route.category === 'safety'
                      ? `${route.safetyAnchorCount} police anchors • ${route.estimatedDurationMinutes} min • ${route.totalDistanceMeters}m`
                      : `${route.estimatedDurationMinutes} min • arr ~${arrivalTime} • ${route.totalDistanceMeters}m`}
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className="font-mono font-bold text-xs"
                    style={{
                      color:
                        route.category === 'safety'
                          ? route.overallSafetyScore >= 85
                            ? '#38bdf8'
                            : '#f59e0b'
                          : route.feelsLike.heatColor,
                    }}
                  >
                    {routeMetricBadge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Short Trade-Off Insight Line */}
        <div
          className={`mt-2 p-2 rounded border text-[10px] font-mono leading-tight ${
            isNight
              ? 'bg-[#161920] border-[#242832] text-[#38bdf8]'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          💡 {activeRoute.tradeOffInsight}
        </div>
      </div>

      {/* Expandable "More Details" Row */}
      <div className={`pt-1 border-t ${isNight ? 'border-[#1d212a]' : 'border-slate-200'}`}>
        <button
          onClick={() => setShowMoreDetails(!showMoreDetails)}
          className={`w-full flex items-center justify-between text-[10px] font-mono py-1 cursor-pointer ${
            isNight ? 'text-[#8a92a3] hover:text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>More details & environmental features</span>
          {showMoreDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showMoreDetails && (
          <div
            className={`space-y-2 mt-2 p-2.5 rounded border text-[10px] font-mono ${
              isNight
                ? 'bg-[#161920] border-[#242832] text-[#9ca3af]'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`flex items-center gap-1.5 ${isNight ? 'text-white' : 'text-slate-900'}`}>
                <Trees className={`w-3 h-3 ${isNight ? 'text-[#38bdf8]' : 'text-emerald-600'}`} />
                Tree Canopy & Verandahs:
              </span>
              <span className={`font-bold ${isNight ? 'text-[#38bdf8]' : 'text-emerald-700'}`}>
                {activeRoute.averageShadePercentage}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className={`flex items-center gap-1.5 ${isNight ? 'text-white' : 'text-slate-900'}`}>
                <Droplets className={`w-3 h-3 ${isNight ? 'text-[#2563eb]' : 'text-blue-600'}`} />
                Free Water Huts & Pyaaus:
              </span>
              <span className={`font-bold ${isNight ? 'text-[#38bdf8]' : 'text-blue-700'}`}>
                {activeRoute.waterHutsCount > 0
                  ? `${activeRoute.waterHutsCount} free shelter(s) on route`
                  : '0 on direct path'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className={`flex items-center gap-1.5 ${isNight ? 'text-white' : 'text-slate-900'}`}>
                <Droplets className={`w-3 h-3 ${isNight ? 'text-[#2dd4bf]' : 'text-teal-600'}`} />
                Public Water Points:
              </span>
              <span className={`font-bold ${isNight ? 'text-[#2dd4bf]' : 'text-teal-700'}`}>
                {activeRoute.waterPointsCount > 0
                  ? `${activeRoute.waterPointsCount} station(s) on route`
                  : 'None directly on path'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className={`flex items-center gap-1.5 ${isNight ? 'text-white' : 'text-slate-900'}`}>
                <Snowflake className={`w-3 h-3 ${isNight ? 'text-[#38bdf8]' : 'text-blue-600'}`} />
                Climate Cooling Centers:
              </span>
              <span className={`font-bold ${isNight ? 'text-[#38bdf8]' : 'text-blue-700'}`}>
                {activeRoute.coolingCentersNearby > 0
                  ? `${activeRoute.coolingCentersNearby} refuge(s) within 120m`
                  : '0 nearby'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className={`flex items-center gap-1.5 ${isNight ? 'text-white' : 'text-slate-900'}`}>
                <ShieldCheck className={`w-3 h-3 ${isNight ? 'text-[#60a5fa]' : 'text-indigo-600'}`} />
                Active Police Anchors:
              </span>
              <span className={`font-bold ${isNight ? 'text-white' : 'text-slate-900'}`}>
                {activeRoute.safetyAnchorCount} in sight
              </span>
            </div>
          </div>
        )}
      </div>

      {/* "The Walk" Turn-by-Turn Section */}
      <div className={`pt-1 border-t ${isNight ? 'border-[#1d212a]' : 'border-slate-200'}`}>
        <button
          onClick={() => setShowWalkSteps(!showWalkSteps)}
          className={`w-full flex items-center justify-between text-[10px] font-mono py-1 cursor-pointer ${
            isNight ? 'text-[#8a92a3] hover:text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span
            className={`flex items-center gap-1 font-bold uppercase tracking-wider ${
              isNight ? 'text-white' : 'text-slate-900'
            }`}
          >
            <Navigation className={`w-3 h-3 ${isNight ? 'text-[#38bdf8]' : 'text-orange-600'}`} />
            The walk ({activeRoute.turnSteps.length} segments)
          </span>
          {showWalkSteps ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showWalkSteps && (
          <div className="space-y-2 mt-2 max-h-56 overflow-y-auto pr-1">
            {activeRoute.turnSteps.map((step) => (
              <div
                key={step.id}
                className={`p-2 rounded border text-[11px] ${
                  isNight
                    ? 'bg-[#161920] border-[#242832]'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={`font-mono text-[9px] font-bold px-1 py-0.2 rounded uppercase ${
                      step.tag === 'GO'
                        ? isNight
                          ? 'bg-[#38bdf8] text-[#0c0e11]'
                          : 'bg-orange-500 text-white'
                        : step.tag === 'ARR'
                        ? isNight
                          ? 'bg-white text-[#0c0e11]'
                          : 'bg-slate-900 text-white'
                        : step.tag === 'METRO'
                        ? 'bg-[#a855f7] text-white'
                        : isNight
                        ? 'bg-[#242832] text-[#9ca3af]'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {step.tag}
                  </span>
                  <span className={`font-semibold ${isNight ? 'text-white' : 'text-slate-900'}`}>
                    {step.instruction}
                  </span>
                  {step.distanceMeters > 0 && (
                    <span
                      className={`ml-auto font-mono text-[10px] ${
                        isNight ? 'text-[#6b7280]' : 'text-slate-400'
                      }`}
                    >
                      {step.distanceMeters}m
                    </span>
                  )}
                </div>
                <p
                  className={`text-[10px] leading-tight pl-7 ${
                    isNight ? 'text-[#8a92a3]' : 'text-slate-600'
                  }`}
                >
                  {step.contextNote}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
