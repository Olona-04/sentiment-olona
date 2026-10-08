import React, { useState } from 'react';
import { Activity, TrendingUp, Info } from 'lucide-react';
import { escapeHtml, truncateText } from '../utils/sanitize';

interface TrendPoint {
  index: number;
  excerpt: string;
  vaderCompound: number; // -1 to +1
  hfPositiveScore?: number; // 0 to 1
  hfNegativeScore?: number; // 0 to 1
  label: string;
  movingAvg: number;
}

interface TrendLinesProps {
  data: TrendPoint[];
  title?: string;
  subtitle?: string;
}

export const TrendLines: React.FC<TrendLinesProps> = ({
  data,
  title = 'Sentiment Trajectory Trend Line',
  subtitle = 'Chronological sentiment progression across sequence'
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeMetric, setActiveMetric] = useState<'compound' | 'dual_hf'>('compound');

  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-[12px] border bg-[#14141C] border-[#2A2340] text-center text-xs text-[#A1A1B5]">
        No trend sequence available for this view.
      </div>
    );
  }

  // Dimensions for SVG canvas
  const svgWidth = 800;
  const svgHeight = 220;
  const padding = { top: 25, right: 30, bottom: 35, left: 45 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Convert index to X coordinate
  const getX = (idx: number) => {
    if (data.length <= 1) return padding.left + graphWidth / 2;
    return padding.left + (idx / (data.length - 1)) * graphWidth;
  };

  // Convert compound (-1 to +1) to Y coordinate
  const getYCompound = (val: number) => {
    // val is -1 to 1. 1 is top, -1 is bottom, 0 is center
    const normalized = (val - (-1)) / 2; // 0 to 1
    return padding.top + graphHeight - normalized * graphHeight;
  };

  // Convert 0 to 1 probability to Y coordinate
  const getYProb = (val: number) => {
    return padding.top + graphHeight - val * graphHeight;
  };

  const zeroY = getYCompound(0);

  // Build SVG Path for VADER Compound
  const pointsCompound = data.map((d, i) => `${getX(i)},${getYCompound(d.vaderCompound)}`);
  const pathD = pointsCompound.length > 0 ? `M ${pointsCompound.join(' L ')}` : '';

  // Area under curve
  const areaD = pointsCompound.length > 0
    ? `M ${getX(0)},${zeroY} L ${pointsCompound.join(' L ')} L ${getX(data.length - 1)},${zeroY} Z`
    : '';

  // Moving average line
  const pointsMA = data.map((d, i) => `${getX(i)},${getYCompound(d.movingAvg)}`);
  const pathMAD = pointsMA.length > 0 ? `M ${pointsMA.join(' L ')}` : '';

  // Hugging Face Dual lines
  const pointsHfPos = data.map((d, i) => `${getX(i)},${getYProb(d.hfPositiveScore ?? 0)}`);
  const pathHfPosD = pointsHfPos.length > 0 ? `M ${pointsHfPos.join(' L ')}` : '';

  const pointsHfNeg = data.map((d, i) => `${getX(i)},${getYProb(d.hfNegativeScore ?? 0)}`);
  const pathHfNegD = pointsHfNeg.length > 0 ? `M ${pointsHfNeg.join(' L ')}` : '';

  const activePoint = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="p-5 rounded-[12px] border bg-[#14141C] border-[#2A2340] dark:bg-[#14141C] dark:border-[#2A2340] light:bg-[#F5F3FF] light:border-[#DDD6FE] shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[8px] bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#C4B5FD]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white dark:text-white light:text-[#0A0A0F]">
              {title}
            </h4>
            <p className="text-[11px] text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B]">
              {subtitle}
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 rounded-[10px] bg-[#0A0A0F]/60 dark:bg-[#0A0A0F]/60 light:bg-[#FFFFFF] border border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE] self-start sm:self-auto">
          <button
            onClick={() => setActiveMetric('compound')}
            className={`px-2.5 py-1 text-xs font-medium rounded-[7px] transition-all ${
              activeMetric === 'compound'
                ? 'bg-[#8B5CF6] text-white shadow-sm'
                : 'text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B] hover:text-white dark:hover:text-white light:hover:text-[#0A0A0F]'
            }`}
          >
            VADER Polarity Curve
          </button>
          <button
            onClick={() => setActiveMetric('dual_hf')}
            className={`px-2.5 py-1 text-xs font-medium rounded-[7px] transition-all ${
              activeMetric === 'dual_hf'
                ? 'bg-[#8B5CF6] text-white shadow-sm'
                : 'text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B] hover:text-white dark:hover:text-white light:hover:text-[#0A0A0F]'
            }`}
          >
            Transformer Probabilities
          </button>
        </div>
      </div>

      {/* SVG Chart in Purple Shades */}
      <div className="mt-4 relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto select-none overflow-visible"
        >
          <defs>
            {/* Purple Linear Gradient for Area Fill */}
            <linearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#4C1D95" stopOpacity="0.0" />
            </linearGradient>

            {/* Purple Stroke Gradient */}
            <linearGradient id="purpleStrokeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#C4B5FD" />
            </linearGradient>

            {/* Glow Filter */}
            <filter id="purpleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines (in subtle purple tone) */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={svgWidth - padding.right}
            y2={padding.top}
            stroke="#2A2340"
            strokeDasharray="3 3"
          />
          <line
            x1={padding.left}
            y1={zeroY}
            x2={svgWidth - padding.right}
            y2={zeroY}
            stroke="#8B5CF6"
            strokeOpacity="0.4"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          <line
            x1={padding.left}
            y1={svgHeight - padding.bottom}
            x2={svgWidth - padding.right}
            y2={svgHeight - padding.bottom}
            stroke="#2A2340"
            strokeDasharray="3 3"
          />

          {/* Y Axis Labels */}
          {activeMetric === 'compound' ? (
            <>
              <text x={padding.left - 8} y={padding.top + 4} textAnchor="end" className="fill-[#C4B5FD] text-[10px] font-mono">
                +1.0
              </text>
              <text x={padding.left - 8} y={zeroY + 3} textAnchor="end" className="fill-[#8B5CF6] text-[10px] font-mono">
                0.0
              </text>
              <text x={padding.left - 8} y={svgHeight - padding.bottom} textAnchor="end" className="fill-[#A78BFA] text-[10px] font-mono">
                -1.0
              </text>
            </>
          ) : (
            <>
              <text x={padding.left - 8} y={padding.top + 4} textAnchor="end" className="fill-[#C4B5FD] text-[10px] font-mono">
                100%
              </text>
              <text x={padding.left - 8} y={zeroY + 3} textAnchor="end" className="fill-[#8B5CF6] text-[10px] font-mono">
                50%
              </text>
              <text x={padding.left - 8} y={svgHeight - padding.bottom} textAnchor="end" className="fill-[#A78BFA] text-[10px] font-mono">
                0%
              </text>
            </>
          )}

          {/* Curves */}
          {activeMetric === 'compound' ? (
            <>
              {/* Purple area fill */}
              <path d={areaD} fill="url(#purpleAreaGrad)" />

              {/* Main Trend Line in Purple Gradient with Glow */}
              <path
                d={pathD}
                fill="none"
                stroke="url(#purpleStrokeGrad)"
                strokeWidth="2.5"
                filter="url(#purpleGlow)"
              />

              {/* Moving Average Line (Lighter Purple Dashed) */}
              {data.length > 3 && (
                <path
                  d={pathMAD}
                  fill="none"
                  stroke="#C4B5FD"
                  strokeWidth="1.5"
                  strokeDasharray="5 3"
                  strokeOpacity="0.75"
                />
              )}
            </>
          ) : (
            <>
              {/* Transformer Positive Probability (Purple-tinted bright curve) */}
              <path
                d={pathHfPosD}
                fill="none"
                stroke="#C4B5FD"
                strokeWidth="2.2"
                filter="url(#purpleGlow)"
              />
              {/* Transformer Negative Probability (Deep purple curve) */}
              <path
                d={pathHfNegD}
                fill="none"
                stroke="#7C3AED"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
            </>
          )}

          {/* Interactive Data Points in Purple */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cy = activeMetric === 'compound'
              ? getYCompound(d.vaderCompound)
              : getYProb(d.hfPositiveScore ?? 0.5);
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={i}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Hit area */}
                <circle cx={cx} cy={cy} r="10" fill="transparent" />

                {/* Visible Point */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 5.5 : 3.5}
                  fill={isHovered ? '#C4B5FD' : '#8B5CF6'}
                  stroke="#14141C"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />

                {isHovered && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="8.5"
                    fill="none"
                    stroke="#C4B5FD"
                    strokeOpacity="0.6"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip card */}
        {activePoint && (
          <div
            className="absolute top-2 right-2 max-w-[280px] p-2.5 rounded-[10px] bg-[#0A0A0F]/95 dark:bg-[#0A0A0F]/95 light:bg-[#FFFFFF] border border-[#8B5CF6]/50 shadow-xl pointer-events-none text-xs transition-opacity duration-150"
          >
            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE]">
              <span className="font-semibold text-white dark:text-white light:text-[#0A0A0F]">
                Item #{activePoint.index + 1}
              </span>
              <span className="font-mono text-[#C4B5FD] dark:text-[#C4B5FD] light:text-[#7C3AED] font-bold">
                Compound: {activePoint.vaderCompound > 0 ? `+${activePoint.vaderCompound.toFixed(2)}` : activePoint.vaderCompound.toFixed(2)}
              </span>
            </div>
            <p className="mt-1 text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#4B5563] text-[11px] line-clamp-2">
              "{truncateText(activePoint.excerpt, 80)}"
            </p>
          </div>
        )}
      </div>

      {/* Legend / Metrics Info in Purple Shades */}
      <div className="mt-3 pt-3 border-t border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE] flex flex-wrap items-center justify-between gap-3 text-xs text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-[#8B5CF6] rounded-full inline-block" />
            <span>VADER Compound</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-[#C4B5FD] inline-block" />
            <span>Moving Average</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-[#8B5CF6]/40 inline-block" />
            <span>Neutral 0.0 Boundary</span>
          </div>
        </div>

        <div className="font-mono text-[11px] text-[#C4B5FD] dark:text-[#C4B5FD] light:text-[#7C3AED]">
          {data.length} sequential datapoints
        </div>
      </div>
    </div>
  );
};
