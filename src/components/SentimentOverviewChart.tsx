import React, { useState } from 'react';
import { PieChart, BarChart2, Activity, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface OverviewPoint {
  label: string;
  positive: number; // 0-100
  neutral: number;
  negative: number;
}

interface SentimentOverviewChartProps {
  isEmpty?: boolean;
  positivePercent?: number;
  neutralPercent?: number;
  negativePercent?: number;
  dataPoints?: OverviewPoint[];
}

export const SentimentOverviewChart: React.FC<SentimentOverviewChartProps> = ({
  isEmpty = false,
  positivePercent = 0,
  neutralPercent = 0,
  negativePercent = 0,
  dataPoints = []
}) => {
  const { theme } = useTheme();
  const [chartType, setChartType] = useState<'pie' | 'trend'>('pie'); // Default is PIE chart as requested!
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('7d');
  const [hoveredSlice, setHoveredSlice] = useState<'pos' | 'neu' | 'neg' | null>(null);
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState<number | null>(null);

  const hasData = !isEmpty && (positivePercent > 0 || neutralPercent > 0 || negativePercent > 0 || dataPoints.length > 0);

  // If dataPoints exist but percentages are 0, calculate from dataPoints
  let posPct = positivePercent;
  let neuPct = neutralPercent;
  let negPct = negativePercent;

  if (hasData && posPct === 0 && neuPct === 0 && negPct === 0 && dataPoints.length > 0) {
    const totalPts = dataPoints.length;
    posPct = Math.round(dataPoints.reduce((acc, p) => acc + p.positive, 0) / totalPts);
    neuPct = Math.round(dataPoints.reduce((acc, p) => acc + p.neutral, 0) / totalPts);
    negPct = Math.max(0, 100 - posPct - neuPct);
  }

  // Fallback defaults if analyzing single or batch
  const total = posPct + neuPct + negPct || 100;
  const pNorm = (posPct / total) * 100;
  const nNorm = (neuPct / total) * 100;
  const ngNorm = (negPct / total) * 100;

  // Pie / Donut Math using stroke-dasharray (circumference = 2 * PI * r)
  const radius = 68;
  const circumference = 2 * Math.PI * radius;

  // Segment stroke lengths
  const posStroke = (pNorm / 100) * circumference;
  const neuStroke = (nNorm / 100) * circumference;
  const negStroke = (ngNorm / 100) * circumference;

  // Segment offsets (clockwise around circle starting from -90 deg)
  const posOffset = 0;
  const neuOffset = -posStroke;
  const negOffset = -(posStroke + neuStroke);

  // Dominant Label
  let dominantLabel = 'Positive';
  let dominantVal = Math.round(pNorm);
  let dominantColor = '#22C55E';

  if (nNorm > pNorm && nNorm > ngNorm) {
    dominantLabel = 'Neutral';
    dominantVal = Math.round(nNorm);
    dominantColor = '#A1A1B5';
  } else if (ngNorm > pNorm && ngNorm > nNorm) {
    dominantLabel = 'Negative';
    dominantVal = Math.round(ngNorm);
    dominantColor = '#EF4444';
  }

  // Trend line dimensions
  const svgWidth = 520;
  const svgHeight = 220;
  const pad = { top: 20, right: 25, bottom: 35, left: 45 };
  const graphWidth = svgWidth - pad.left - pad.right;
  const graphHeight = svgHeight - pad.top - pad.bottom;

  const points = dataPoints.length > 0 ? dataPoints : [];
  const getX = (idx: number) => (points.length <= 1 ? pad.left + graphWidth / 2 : pad.left + (idx / (points.length - 1)) * graphWidth);
  const getY = (valPercent: number) => pad.top + graphHeight - (valPercent / 100) * graphHeight;

  const buildSmoothPath = (selector: (p: OverviewPoint) => number) => {
    if (points.length === 0) return '';
    const coords = points.map((p, idx) => ({ x: getX(idx), y: getY(selector(p)) }));
    if (coords.length === 1) return `M ${coords[0].x - 20},${coords[0].y} L ${coords[0].x + 20},${coords[0].y}`;
    let d = `M ${coords[0].x},${coords[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const mx = (p0.x + p1.x) / 2;
      d += ` C ${mx},${p0.y} ${mx},${p1.y} ${p1.x},${p1.y}`;
    }
    return d;
  };

  const posPath = hasData ? buildSmoothPath(p => p.positive) : '';
  const neuPath = hasData ? buildSmoothPath(p => p.neutral) : '';
  const negPath = hasData ? buildSmoothPath(p => p.negative) : '';

  return (
    <div className="p-5 rounded-[14px] border bg-[#14141C] border-[#2A2340] dark:bg-[#14141C] dark:border-[#2A2340] light:bg-[#FFFFFF] light:border-[#E5DEFF] shadow-sm flex flex-col justify-between min-h-[320px]">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#2A2340]/70 dark:border-[#2A2340]/70 light:border-[#E5DEFF]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-[6px] bg-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6]">
            {chartType === 'pie' ? <PieChart className="w-3.5 h-3.5" /> : <BarChart2 className="w-3.5 h-3.5" />}
          </div>
          <h4 className="text-sm font-semibold text-white dark:text-white light:text-[#120D24]">
            Sentiment Overview
          </h4>
        </div>

        {/* View Toggle (Pie Chart vs Trend Line) */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <div className="flex items-center p-0.5 rounded-[8px] bg-[#0A0A0F] dark:bg-[#0A0A0F] light:bg-[#F5F3FF] border border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE] text-[11px]">
            <button
              onClick={() => setChartType('pie')}
              className={`px-2.5 py-1 rounded-[6px] font-medium transition-all cursor-pointer ${
                chartType === 'pie'
                  ? 'bg-[#8B5CF6] text-white shadow-sm'
                  : 'text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#645A7E] hover:text-white dark:hover:text-white light:hover:text-[#120D24]'
              }`}
            >
              Pie Chart
            </button>
            <button
              onClick={() => setChartType('trend')}
              className={`px-2.5 py-1 rounded-[6px] font-medium transition-all cursor-pointer ${
                chartType === 'trend'
                  ? 'bg-[#8B5CF6] text-white shadow-sm'
                  : 'text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#645A7E] hover:text-white dark:hover:text-white light:hover:text-[#120D24]'
              }`}
            >
              Trend Line
            </button>
          </div>
        </div>
      </div>

      {/* Main Visual Display */}
      {!hasData ? (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center my-4 rounded-[12px] border border-dashed border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE] bg-[#0A0A0F]/50 dark:bg-[#0A0A0F]/50 light:bg-[#FAF8FF]">
          <div className="w-12 h-12 rounded-full border-4 border-dashed border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] mb-2.5">
            <PieChart className="w-5 h-5 text-[#8B5CF6]" />
          </div>
          <span className="text-xs font-semibold text-white dark:text-white light:text-[#120D24] block">
            No Sentiment Data Yet
          </span>
          <p className="text-[11px] text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#645A7E] max-w-xs mt-1">
            Add your comments in the input box above and click "Analyze" to generate the live sentiment pie chart.
          </p>
        </div>
      ) : chartType === 'pie' ? (
        /* 1. PIE / DONUT CHART */
        <div className="py-4 flex flex-col sm:flex-row items-center justify-center gap-6">
          {/* Interactive SVG Pie / Donut Chart */}
          <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90 select-none" viewBox="0 0 176 176">
              {/* Background Track */}
              <circle
                cx="88"
                cy="88"
                r={radius}
                fill="none"
                stroke={theme === 'dark' ? '#1F192E' : '#E9D5FF'}
                strokeWidth="20"
              />

              {/* Positive Slice (Green) */}
              {pNorm > 0 && (
                <circle
                  cx="88"
                  cy="88"
                  r={radius}
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth={hoveredSlice === 'pos' ? 24 : 20}
                  strokeDasharray={`${posStroke} ${circumference}`}
                  strokeDashoffset={posOffset}
                  strokeLinecap="butt"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice('pos')}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              )}

              {/* Neutral Slice (Lavender / Slate) */}
              {nNorm > 0 && (
                <circle
                  cx="88"
                  cy="88"
                  r={radius}
                  fill="none"
                  stroke="#A1A1B5"
                  strokeWidth={hoveredSlice === 'neu' ? 24 : 20}
                  strokeDasharray={`${neuStroke} ${circumference}`}
                  strokeDashoffset={neuOffset}
                  strokeLinecap="butt"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice('neu')}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              )}

              {/* Negative Slice (Red) */}
              {ngNorm > 0 && (
                <circle
                  cx="88"
                  cy="88"
                  r={radius}
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth={hoveredSlice === 'neg' ? 24 : 20}
                  strokeDasharray={`${negStroke} ${circumference}`}
                  strokeDashoffset={negOffset}
                  strokeLinecap="butt"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice('neg')}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              )}
            </svg>

            {/* Inner Center Content of Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              {hoveredSlice ? (
                <>
                  <span className="text-xl font-bold font-mono text-white dark:text-white light:text-[#120D24]">
                    {hoveredSlice === 'pos' ? `${Math.round(pNorm)}%` : hoveredSlice === 'neu' ? `${Math.round(nNorm)}%` : `${Math.round(ngNorm)}%`}
                  </span>
                  <span
                    className="text-[10px] font-semibold capitalize"
                    style={{
                      color: hoveredSlice === 'pos' ? '#22C55E' : hoveredSlice === 'neu' ? '#A1A1B5' : '#EF4444'
                    }}
                  >
                    {hoveredSlice === 'pos' ? 'Positive' : hoveredSlice === 'neu' ? 'Neutral' : 'Negative'}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-2xl font-bold font-mono text-white dark:text-white light:text-[#120D24]">
                    {dominantVal}%
                  </span>
                  <span
                    className="text-[11px] font-semibold capitalize tracking-wide"
                    style={{ color: dominantColor }}
                  >
                    {dominantLabel}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Breakdown Stats next to pie chart */}
          <div className="space-y-2.5 min-w-[170px]">
            {/* Positive */}
            <div
              onMouseEnter={() => setHoveredSlice('pos')}
              onMouseLeave={() => setHoveredSlice(null)}
              className={`p-2 rounded-[8px] transition-colors cursor-pointer border ${
                hoveredSlice === 'pos'
                  ? 'bg-[#22C55E]/15 border-[#22C55E]/40'
                  : 'bg-[#0A0A0F]/40 dark:bg-[#0A0A0F]/40 light:bg-[#FAF8FF] border-transparent'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] shrink-0" />
                  <span className="text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#4B5563] font-medium">Positive</span>
                </div>
                <span className="font-mono font-bold text-white dark:text-white light:text-[#120D24]">
                  {Math.round(pNorm)}%
                </span>
              </div>
            </div>

            {/* Neutral */}
            <div
              onMouseEnter={() => setHoveredSlice('neu')}
              onMouseLeave={() => setHoveredSlice(null)}
              className={`p-2 rounded-[8px] transition-colors cursor-pointer border ${
                hoveredSlice === 'neu'
                  ? 'bg-[#A1A1B5]/15 border-[#A1A1B5]/40'
                  : 'bg-[#0A0A0F]/40 dark:bg-[#0A0A0F]/40 light:bg-[#FAF8FF] border-transparent'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A1A1B5] shrink-0" />
                  <span className="text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#4B5563] font-medium">Neutral</span>
                </div>
                <span className="font-mono font-bold text-white dark:text-white light:text-[#120D24]">
                  {Math.round(nNorm)}%
                </span>
              </div>
            </div>

            {/* Negative */}
            <div
              onMouseEnter={() => setHoveredSlice('neg')}
              onMouseLeave={() => setHoveredSlice(null)}
              className={`p-2 rounded-[8px] transition-colors cursor-pointer border ${
                hoveredSlice === 'neg'
                  ? 'bg-[#EF4444]/15 border-[#EF4444]/40'
                  : 'bg-[#0A0A0F]/40 dark:bg-[#0A0A0F]/40 light:bg-[#FAF8FF] border-transparent'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shrink-0" />
                  <span className="text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#4B5563] font-medium">Negative</span>
                </div>
                <span className="font-mono font-bold text-white dark:text-white light:text-[#120D24]">
                  {Math.round(ngNorm)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 2. TREND LINE VIEW */
        <div className="relative w-full mt-1">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible select-none">
            {[100, 75, 50, 25, 0].map((level) => {
              const y = getY(level);
              return (
                <g key={level}>
                  <line
                    x1={pad.left}
                    y1={y}
                    x2={svgWidth - pad.right}
                    y2={y}
                    stroke={theme === 'dark' ? '#2A2340' : '#E9D5FF'}
                    strokeDasharray="2 3"
                    strokeWidth="0.8"
                  />
                  <text
                    x={pad.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="fill-[#A1A1B5] dark:fill-[#A1A1B5] light:fill-[#645A7E] text-[9px] font-mono"
                  >
                    {level}%
                  </text>
                </g>
              );
            })}

            {points.map((pt, idx) => (
              <text
                key={idx}
                x={getX(idx)}
                y={svgHeight - 10}
                textAnchor="middle"
                className="fill-[#A1A1B5] dark:fill-[#A1A1B5] light:fill-[#645A7E] text-[9px]"
              >
                {pt.label}
              </text>
            ))}

            <path d={neuPath} fill="none" stroke="#A1A1B5" strokeWidth="2" strokeLinecap="round" />
            <path d={negPath} fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
            <path d={posPath} fill="none" stroke="#22C55E" strokeWidth="2.4" strokeLinecap="round" />

            {points.map((pt, idx) => {
              const x = getX(idx);
              const isHovered = hoveredTrendIdx === idx;
              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredTrendIdx(idx)}
                  onMouseLeave={() => setHoveredTrendIdx(null)}
                >
                  <circle cx={x} cy={getY(pt.positive)} r={isHovered ? 4.5 : 3} fill="#22C55E" stroke="#14141C" strokeWidth="1.5" />
                  <circle cx={x} cy={getY(pt.neutral)} r={isHovered ? 4.5 : 3} fill="#A1A1B5" stroke="#14141C" strokeWidth="1.5" />
                  <circle cx={x} cy={getY(pt.negative)} r={isHovered ? 4.5 : 3} fill="#EF4444" stroke="#14141C" strokeWidth="1.5" />
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Footer Legend */}
      <div className="flex items-center justify-center gap-6 pt-3 border-t border-[#2A2340]/60 dark:border-[#2A2340]/60 light:border-[#E5DEFF] text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
          <span className="text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#4B5563]">Positive ({Math.round(pNorm)}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#A1A1B5]" />
          <span className="text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#4B5563]">Neutral ({Math.round(nNorm)}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
          <span className="text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#4B5563]">Negative ({Math.round(ngNorm)}%)</span>
        </div>
      </div>
    </div>
  );
};
