import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { MapViewport } from './components/MapViewport';
import { FloatingStatsPanel } from './components/FloatingStatsPanel';
import { PlanRoutePanel } from './components/PlanRoutePanel';
import { WalkFeelsLikePanel } from './components/WalkFeelsLikePanel';
import { SafetyHeatmapLegend } from './components/SafetyHeatmapLegend';
import { AboutDataModal } from './components/AboutDataModal';
import { useRouteStore } from './stores/routeStore';
import { ChevronLeft, Compass } from 'lucide-react';

export const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Open by default for instant search & directions
  const { isNavigating, mode, heatmapStats } = useRouteStore();
  const isDark = mode === 'night' || mode === 'heatmap';
  const isHeatmap = mode === 'heatmap';

  // Automatically ensure sidebar is open when navigation is active
  useEffect(() => {
    if (isNavigating && !isHeatmap) {
      setIsSidebarOpen(true);
    }
  }, [isNavigating, isHeatmap]);

  return (
    <div
      className={`flex flex-col h-screen w-screen overflow-hidden font-sans transition-colors duration-300 ${
        isDark ? 'bg-[#0c0e11] text-[#f3f4f6]' : 'bg-[#f8fafc] text-slate-900'
      }`}
    >
      {/* Top Bar Chrome */}
      <TopBar />

      {/* Main Viewport with Floating Controls */}
      <div className="relative flex-1 min-h-0 w-full h-full overflow-hidden">
        {/* Full-bleed 3D Map Viewport (First on Home Page) */}
        <MapViewport />

        {/* Top-Right Floating Stats Telemetry */}
        <FloatingStatsPanel />

        {/* Safety Heat Map Fixed Legend (Heat Map Mode only) */}
        {isHeatmap && <SafetyHeatmapLegend stats={heatmapStats || undefined} />}

        {/* Floating Quick Action: Plan Route (shown when sidebar is closed in routing modes) */}
        {!isSidebarOpen && !isHeatmap && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-2 rounded shadow-xl font-mono text-xs transition-all cursor-pointer ${
              isDark
                ? 'bg-[#12151a]/95 hover:bg-[#181d24] border border-[#262b36] text-white hover:border-[#38bdf8]'
                : 'bg-white/95 hover:bg-slate-50 border border-slate-200 text-slate-900 hover:border-orange-500'
            }`}
            title="Open Route Planner"
          >
            <Compass className={`w-4 h-4 ${isDark ? 'text-[#38bdf8]' : 'text-orange-600'}`} />
            <span className="font-semibold tracking-wide">Search & Plan Route</span>
          </button>
        )}

        {/* Left Floating Panel (Plan Route or Walk Feels Like Results, hidden in exploratory Heat Map) */}
        {!isHeatmap && (
          <div
            className={`absolute top-4 left-4 bottom-4 z-20 flex transition-all duration-300 pointer-events-none ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-[calc(100%+24px)]'
            }`}
          >
            <div className="w-[350px] sm:w-[390px] h-full flex flex-col pointer-events-auto overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {isNavigating ? <WalkFeelsLikePanel /> : <PlanRoutePanel />}
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Close Button */}
        {!isHeatmap && isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(false)}
            className={`absolute top-4 left-[364px] sm:left-[404px] z-20 pointer-events-auto p-1.5 rounded-lg shadow-md transition-all cursor-pointer ${
              isDark
                ? 'bg-[#14171c] border border-[#232732] text-[#9ca3af] hover:text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="Collapse panel"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Modals */}
      <AboutDataModal />
    </div>
  );
};

export default App;
