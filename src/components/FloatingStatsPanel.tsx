import React from 'react';
import { useRouteStore } from '../stores/routeStore';
import { DELHI_POIS } from '../data/pois';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export const FloatingStatsPanel: React.FC = () => {
  const { mode, sunMetrics, routes, selectedRouteId, heatmapStats } = useRouteStore();

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const isDark = mode === 'night' || mode === 'heatmap';

  const buildingsCount = 482; // 3D building extrusions count in Central Delhi sector
  const totalPinsCount = DELHI_POIS.length;

  if (mode === 'heatmap') {
    const avgScore = heatmapStats?.averageSafetyScore ?? 74;
    const realCoverage = heatmapStats?.realDataCoveragePercent ?? 68;
    const safest = heatmapStats?.safestSector?.name ?? 'Chanakyapuri Enclave';
    const riskiest = heatmapStats?.highestRiskSector?.name ?? 'Shivaji Bridge Underpass';

    return (
      <div className="absolute top-4 right-4 z-20 pointer-events-none select-none">
        <div className="backdrop-blur-sm rounded-lg px-3.5 py-2 text-[11px] font-mono shadow-xl flex items-center gap-4 bg-[#0c0e11]/92 border border-[#22262f] text-[#8a92a3]">
          {/* Average Safety Score */}
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-[#5f6675]">avg safety</span>
            <span className="font-bold text-[#10b981] text-xs">{avgScore}/100</span>
          </div>

          {/* Greater Delhi Coverage */}
          <div className="flex flex-col border-l border-[#22262f] pl-3">
            <span className="text-[9px] uppercase tracking-wider text-[#5f6675]">coverage</span>
            <span className="font-semibold text-white">~117 km²</span>
          </div>

          {/* Real vs Sim Data Coverage */}
          <div className="hidden sm:flex flex-col border-l border-[#22262f] pl-3">
            <span className="text-[9px] uppercase tracking-wider text-[#5f6675]">data coverage</span>
            <span className="font-semibold text-[#38bdf8]">{realCoverage}% real</span>
          </div>

          {/* Safest Sector */}
          <div className="hidden md:flex flex-col border-l border-[#22262f] pl-3">
            <span className="text-[9px] uppercase tracking-wider text-[#5f6675] flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
              safest
            </span>
            <span className="font-semibold text-emerald-400 truncate max-w-[130px]">{safest}</span>
          </div>

          {/* Highest Risk Sector */}
          <div className="hidden lg:flex flex-col border-l border-[#22262f] pl-3">
            <span className="text-[9px] uppercase tracking-wider text-[#5f6675] flex items-center gap-1">
              <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
              highest risk
            </span>
            <span className="font-semibold text-amber-400 truncate max-w-[130px]">{riskiest}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-20 pointer-events-none select-none">
      <div
        className={`backdrop-blur-sm rounded px-3 py-2 text-[11px] font-mono shadow-lg flex items-center gap-4 transition-colors duration-300 ${
          isDark
            ? 'bg-[#0c0e11]/90 border border-[#22262f] text-[#8a92a3]'
            : 'bg-white/95 border border-slate-200 text-slate-600 shadow-md'
        }`}
      >
        {/* Sun / Time */}
        <div className="flex flex-col">
          <span className={`text-[9px] uppercase tracking-wider ${isDark ? 'text-[#5f6675]' : 'text-slate-400'}`}>
            time
          </span>
          <span className={`font-semibold ${isDark ? 'text-[#f3f4f6]' : 'text-slate-900'}`}>
            {sunMetrics.timeString}
          </span>
        </div>

        {/* Elevation / Lit Segments */}
        <div className={`flex flex-col border-l pl-3 ${isDark ? 'border-[#22262f]' : 'border-slate-200'}`}>
          <span className={`text-[9px] uppercase tracking-wider ${isDark ? 'text-[#5f6675]' : 'text-slate-400'}`}>
            {isDark ? 'lit roads' : 'elevation'}
          </span>
          <span className={`font-semibold ${isDark ? 'text-[#38bdf8]' : 'text-amber-600'}`}>
            {isDark ? `${activeRoute?.overallSafetyScore || 94}%` : `${sunMetrics.altitudeDegrees}°`}
          </span>
        </div>

        {/* Azimuth / Active Anchors */}
        <div className={`flex flex-col border-l pl-3 ${isDark ? 'border-[#22262f]' : 'border-slate-200'}`}>
          <span className={`text-[9px] uppercase tracking-wider ${isDark ? 'text-[#5f6675]' : 'text-slate-400'}`}>
            {isDark ? 'anchors' : 'azimuth'}
          </span>
          <span className={`font-semibold ${isDark ? 'text-[#f3f4f6]' : 'text-slate-900'}`}>
            {isDark ? `${activeRoute?.safetyAnchorCount || 3} active` : `${sunMetrics.azimuthDegrees}°`}
          </span>
        </div>

        {/* Buildings in 3D scene */}
        <div className={`hidden sm:flex flex-col border-l pl-3 ${isDark ? 'border-[#22262f]' : 'border-slate-200'}`}>
          <span className={`text-[9px] uppercase tracking-wider ${isDark ? 'text-[#5f6675]' : 'text-slate-400'}`}>
            buildings
          </span>
          <span className={`font-semibold ${isDark ? 'text-[#f3f4f6]' : 'text-slate-900'}`}>{buildingsCount}</span>
        </div>

        {/* Active Pins in scene */}
        <div className={`hidden sm:flex flex-col border-l pl-3 ${isDark ? 'border-[#22262f]' : 'border-slate-200'}`}>
          <span className={`text-[9px] uppercase tracking-wider ${isDark ? 'text-[#5f6675]' : 'text-slate-400'}`}>
            pins
          </span>
          <span className={`font-semibold ${isDark ? 'text-[#2dd4bf]' : 'text-teal-600'}`}>{totalPinsCount}</span>
        </div>
      </div>
    </div>
  );
};
