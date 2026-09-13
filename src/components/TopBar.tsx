import React, { useState, useEffect } from 'react';
import { useRouteStore } from '../stores/routeStore';
import { Sun, Moon, Shield, Info } from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    mode,
    setMode,
    unit,
    setUnit,
    setAboutModalOpen,
  } = useRouteStore();

  const [clockTime, setClockTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClockTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const isDark = mode === 'night' || mode === 'heatmap';

  return (
    <header
      className={`relative z-30 w-full px-4 py-2.5 flex items-center justify-between text-xs select-none transition-colors duration-300 ${
        isDark
          ? 'bg-[#0c0e11] border-b border-[#22262f] text-[#f3f4f6]'
          : 'bg-white border-b border-slate-200 text-slate-900 shadow-xs'
      }`}
    >
      {/* Left: Two-tone Wordmark & Tagline */}
      <div className="flex items-center gap-3">
        <div className="flex items-baseline tracking-tight">
          <span className={`font-extrabold text-base tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
            delhi
          </span>
          <span className={`font-extrabold text-base tracking-tighter ${isDark ? 'text-[#38bdf8]' : 'text-orange-600'}`}>
            safe
          </span>
        </div>
        <div className={`hidden sm:flex items-center gap-2 border-l pl-3 ${isDark ? 'border-[#262b36]' : 'border-slate-200'}`}>
          <span className={`font-mono text-[10px] tracking-widest uppercase font-semibold ${isDark ? 'text-[#8a92a3]' : 'text-slate-500'}`}>
            {mode === 'heatmap' ? 'EXPLORATORY SAFETY OVERLAY' : 'WHAT THE PATH FEELS LIKE'}
          </span>
        </div>
      </div>

      {/* Center: Tactile 3-Way Segmented Control (Morning / Night / Heat Map) */}
      <div
        className={`flex items-center rounded p-0.5 transition-colors ${
          isDark ? 'bg-[#14171d] border border-[#22262f]' : 'bg-slate-100 border border-slate-200'
        }`}
      >
        <button
          onClick={() => setMode('day')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded font-mono text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
            mode === 'day'
              ? 'bg-amber-500 text-white shadow-sm'
              : isDark
              ? 'text-[#9ca3af] hover:text-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          title="Morning Mode: White Theme, Shaded Walking Route"
        >
          <Sun className="w-3.5 h-3.5" />
          <span>MORNING</span>
        </button>
        <button
          onClick={() => setMode('night')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded font-mono text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
            mode === 'night'
              ? 'bg-[#38bdf8] text-[#0c0e11] shadow-sm'
              : isDark
              ? 'text-[#9ca3af] hover:text-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          title="Night Mode: Black Theme, Well-Lit Safety Route"
        >
          <Moon className="w-3.5 h-3.5" />
          <span>NIGHT</span>
        </button>
        <button
          onClick={() => setMode('heatmap')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded font-mono text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
            mode === 'heatmap'
              ? 'bg-emerald-500 text-[#0c0e11] shadow-sm'
              : isDark
              ? 'text-[#9ca3af] hover:text-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          title="Heat Map Mode: Exploratory Region-by-Region Safety Heatmap"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>HEAT MAP</span>
        </button>
      </div>

      {/* Right: Unit Toggle, Date + Live Clock, & Modals */}
      <div className="flex items-center gap-3">
        {/* Unit Toggle */}
        <div
          className={`flex items-center rounded p-0.5 text-[10px] font-mono font-medium ${
            isDark ? 'bg-[#14171d] border border-[#22262f]' : 'bg-slate-100 border border-slate-200'
          }`}
        >
          <button
            onClick={() => setUnit('metric')}
            className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
              unit === 'metric'
                ? isDark
                  ? 'bg-[#262b36] text-white font-bold'
                  : 'bg-white text-slate-900 font-bold shadow-xs'
                : isDark
                ? 'text-[#8a92a3]'
                : 'text-slate-500'
            }`}
            title="Metric: Celsius & Kilometers"
          >
            °C · km
          </button>
          <button
            onClick={() => setUnit('imperial')}
            className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
              unit === 'imperial'
                ? isDark
                  ? 'bg-[#262b36] text-white font-bold'
                  : 'bg-white text-slate-900 font-bold shadow-xs'
                : isDark
                ? 'text-[#8a92a3]'
                : 'text-slate-500'
            }`}
            title="Imperial: Fahrenheit & Miles"
          >
            °F · mi
          </button>
        </div>

        {/* Live Clock */}
        <div className={`hidden md:flex items-center gap-2 font-mono text-[11px] ${isDark ? 'text-[#8a92a3]' : 'text-slate-600'}`}>
          <span className={`font-semibold ${isDark ? 'text-[#f3f4f6]' : 'text-slate-900'}`}>
            {clockTime || '14:30:00'}
          </span>
        </div>

        {/* Info Modal Button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setAboutModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors font-mono text-[10px] cursor-pointer ${
              isDark
                ? 'bg-[#14171d] border border-[#22262f] text-[#9ca3af] hover:text-white hover:border-[#262b36]'
                : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
            }`}
            title="About this data & methodology"
          >
            <Info className={`w-3.5 h-3.5 ${isDark ? 'text-[#38bdf8]' : 'text-orange-600'}`} />
            <span className="hidden sm:inline">About</span>
          </button>
        </div>
      </div>
    </header>
  );
};
