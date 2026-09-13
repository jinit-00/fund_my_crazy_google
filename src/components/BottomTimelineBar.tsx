import React, { useRef } from 'react';
import { useRouteStore } from '../stores/routeStore';
import { get24HourSunAltitudeCurve } from '../services/sunCalculation';

export const BottomTimelineBar: React.FC = () => {
  const {
    mode,
    simulatedHour,
    setSimulatedHour,
    sunMetrics,
  } = useRouteStore();

  const isNight = mode === 'night';
  const svgRef = useRef<SVGSVGElement>(null);

  const curvePoints = get24HourSunAltitudeCurve();

  const svgWidth = 600;
  const svgHeight = 44;

  const hourToX = (h: number) => (h / 24) * svgWidth;

  const altToY = (alt: number) => {
    const minAlt = -30;
    const maxAlt = 75;
    const normalized = (alt - minAlt) / (maxAlt - minAlt);
    return svgHeight - normalized * svgHeight;
  };

  const pathD = curvePoints.reduce((acc, pt, idx) => {
    const x = hourToX(pt.hour);
    const y = altToY(Math.max(-25, pt.altitude));
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const areaD = `${pathD} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;

  const handleTimelineInteraction = (clientX: number) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const fraction = clickX / rect.width;
    const hour = Math.round(fraction * 24 * 2) / 2;
    setSimulatedHour(hour);
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    handleTimelineInteraction(e.clientX);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      handleTimelineInteraction(moveEvent.clientX);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const currentX = hourToX(simulatedHour);

  const hours = Math.floor(simulatedHour);
  const mins = Math.round((simulatedHour - hours) * 60);
  const timeFormatted = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

  const primaryAccent = isNight ? '#38bdf8' : '#f97316';

  return (
    <div className="relative z-30 w-full bg-[#0c0e11] border-t border-[#22262f] px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-3 select-none">
      {/* Left: Leaving At + Large Time Readout */}
      <div className="flex items-baseline gap-3 shrink-0">
        <div>
          <span className="block font-mono text-[9px] uppercase tracking-widest text-[#6b7280]">
            LEAVING AT
          </span>
          <span className="font-mono text-xl sm:text-2xl font-black tracking-tight text-white">
            {timeFormatted}
          </span>
        </div>
        <div className="hidden lg:block font-mono text-[10px] text-[#5f6675]">
          <span>{isNight ? 'NIGHT TRANSIT WINDOW' : 'SOLAR SHADE SCRUBBER'}</span>
        </div>
      </div>

      {/* Center: 24h Interactive Timeline Area Chart */}
      <div className="w-full max-w-xl flex flex-col items-center">
        <div className="relative w-full h-[44px] cursor-pointer">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
            onMouseDown={handleMouseDown}
          >
            <defs>
              <linearGradient id="dayGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="nightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Zero altitude baseline (Horizon) */}
            <line
              x1="0"
              y1={altToY(0)}
              x2={svgWidth}
              y2={altToY(0)}
              stroke="#242832"
              strokeDasharray="2 2"
              strokeWidth="1"
            />

            {/* Area Fill */}
            <path
              d={areaD}
              fill={isNight ? 'url(#nightGrad)' : 'url(#dayGrad)'}
            />

            {/* Main Solar Curve Line */}
            <path
              d={pathD}
              fill="none"
              stroke={primaryAccent}
              strokeWidth="2"
            />

            {/* Scrubber Line */}
            <line
              x1={currentX}
              y1="0"
              x2={currentX}
              y2={svgHeight}
              stroke="#ffffff"
              strokeWidth="2"
            />
            {/* Scrubber Knob */}
            <circle
              cx={currentX}
              cy={altToY(Math.max(-25, sunMetrics.altitudeDegrees))}
              r="4.5"
              fill={primaryAccent}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Hour tick marks */}
        <div className="w-full flex justify-between font-mono text-[9px] text-[#5f6675] px-1 mt-0.5">
          <span>00:00</span>
          <span>06:00</span>
          <span>09:00</span>
          <span>12:00</span>
          <span>15:00</span>
          <span>18:00</span>
          <span>21:00</span>
          <span>24:00</span>
        </div>
      </div>

      {/* Right: Sun / Safety Status Telemetry */}
      <div className="hidden md:flex items-center gap-4 font-mono text-[11px] text-[#8a92a3] shrink-0 border-l border-[#22262f] pl-4">
        <div>
          <span className="block text-[9px] uppercase text-[#5f6675]">altitude</span>
          <span className="text-[#f3f4f6] font-semibold">{sunMetrics.altitudeDegrees}°</span>
        </div>
        <div>
          <span className="block text-[9px] uppercase text-[#5f6675]">azimuth</span>
          <span className="text-[#f3f4f6] font-semibold">{sunMetrics.azimuthDegrees}°</span>
        </div>
        <div>
          <span className="block text-[9px] uppercase text-[#5f6675]">sunset</span>
          <span className="text-[#f3f4f6] font-semibold">{sunMetrics.sunsetTimeString}</span>
        </div>
      </div>
    </div>
  );
};
