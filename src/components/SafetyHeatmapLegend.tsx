import React from 'react';
import { Shield, Info, Sparkles } from 'lucide-react';
import type { SafetyHeatmapStats } from '../types';

interface SafetyHeatmapLegendProps {
  stats?: SafetyHeatmapStats;
}

export const SafetyHeatmapLegend: React.FC<SafetyHeatmapLegendProps> = ({ stats }) => {
  const realPct = stats?.realDataCoveragePercent ?? 68;
  const simPct = 100 - realPct;

  return (
    <div className="absolute bottom-6 left-6 z-20 pointer-events-auto select-none max-w-[290px] sm:max-w-[340px]">
      <div className="bg-[#0c0e11]/95 backdrop-blur-md border border-[#232834] rounded-xl p-3.5 shadow-2xl text-white font-sans text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#1f2430] mb-2.5">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#38bdf8]" />
            <span className="font-bold text-xs tracking-tight text-white">SAFETY HEAT MAP</span>
          </div>
          <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30 font-semibold">
            <Sparkles className="w-2.5 h-2.5" />
            <span>SMOOTH GRADIENT</span>
          </div>
        </div>

        {/* Continuous Gradient Bar */}
        <div className="mb-3">
          <div className="text-[11px] text-[#9ca3af] font-medium mb-1.5 flex items-center justify-between">
            <span>Safety Surface Spectrum</span>
            <span className="text-[10px] font-mono text-[#64748b]">Continuous 0–100</span>
          </div>
          <div
            className="h-3 w-full rounded-md shadow-inner border border-white/10"
            style={{
              background:
                'linear-gradient(to right, #ef4444 0%, #f97316 25%, #eab308 50%, #84cc16 75%, #10b981 100%)',
            }}
          />
          <div className="flex items-center justify-between text-[10px] font-mono mt-1.5 px-0.5">
            <span className="text-[#ef4444] font-semibold">High risk</span>
            <span className="text-[#eab308] font-medium">Moderate</span>
            <span className="text-[#10b981] font-semibold">Safer</span>
          </div>
        </div>

        {/* Coverage Scope */}
        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-[#8a92a3] mb-2.5 bg-[#141822] p-2 rounded-lg border border-[#232836]">
          <div>Coverage: <span className="text-white font-bold">~117 km²</span></div>
          <div>Sampling: <span className="text-[#38bdf8] font-bold">Continuous</span></div>
        </div>

        {/* Data Transparency Disclosure */}
        <div className="bg-[#141822] rounded-lg p-2 border border-[#232836] text-[10px] text-[#9ca3af] leading-relaxed">
          <div className="flex items-center gap-1 text-[#38bdf8] font-semibold mb-1">
            <Info className="w-3 h-3 flex-shrink-0" />
            <span>Greater Delhi Coverage Disclosure</span>
          </div>
          <p className="text-[#8a92a3]">
            <strong className="text-slate-200">{realPct}% Grounded Data</strong> (Delhi Police open crime records, NCRB statistics, OSM <code className="text-[#38bdf8]">lit=yes/no</code>) •{' '}
            <strong className="text-slate-200">{simPct}% Calibrated Simulation</strong> covering Central, North, South & Old Delhi corridors.
          </p>
        </div>

        {/* Interaction Hint */}
        <div className="mt-2 text-[10px] text-[#64748b] font-mono text-center">
          Hover or tap anywhere to sample continuous point safety
        </div>
      </div>
    </div>
  );
};
