import React from 'react';
import { Cpu, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface VaderHfGaugesProps {
  isEmpty?: boolean;
  vaderScore?: number;
  hfScore?: number;
  vaderLabel?: string;
  hfLabel?: string;
  comparisonNote?: string;
}

export const VaderHfGauges: React.FC<VaderHfGaugesProps> = ({
  isEmpty = false,
  vaderScore = 0,
  hfScore = 0,
  vaderLabel = 'Awaiting Input',
  hfLabel = 'Awaiting Input',
  comparisonNote = 'Enter comments above to run dual VADER and Hugging Face analysis.'
}) => {
  const { theme } = useTheme();
  const radius = 34;
  const circumference = 2 * Math.PI * radius;

  const vaderOffset = circumference - (vaderScore * circumference);
  const hfOffset = circumference - (hfScore * circumference);

  return (
    <div className={`p-5 rounded-[14px] border shadow-sm flex flex-col justify-between min-h-[300px] ${
      theme === 'dark'
        ? 'bg-[#14141C] border-[#2A2340]'
        : 'bg-[#FFFFFF] border-[#8B5CF6]/30'
    }`}>
      {/* Header */}
      <div className="flex items-center gap-2 pb-2">
        <div className="w-5 h-5 rounded-[6px] bg-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6]">
          <Cpu className="w-3.5 h-3.5" />
        </div>
        <h4 className={`text-sm font-bold ${
          theme === 'dark' ? 'text-white' : 'text-[#000000]'
        }`}>
          VADER vs Hugging Face
        </h4>
      </div>

      {isEmpty ? (
        <div className={`flex-1 flex flex-col items-center justify-center p-8 text-center my-4 rounded-[12px] border border-dashed ${
          theme === 'dark'
            ? 'border-[#2A2340] bg-[#0A0A0F]/50'
            : 'border-[#8B5CF6]/30 bg-[#FBF9FF]'
        }`}>
          <div className="w-10 h-10 rounded-[10px] bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] mb-2.5">
            <Zap className="w-5 h-5" />
          </div>
          <span className={`text-xs font-bold block ${
            theme === 'dark' ? 'text-white' : 'text-[#000000]'
          }`}>
            Awaiting Input
          </span>
          <p className={`text-[11px] max-w-xs mt-1 ${
            theme === 'dark' ? 'text-[#A1A1B5]' : 'text-[#1F2937]'
          }`}>
            Analyze your comments above to see circular polarity gauges and comparative metrics.
          </p>
        </div>
      ) : (
        <>
          {/* Dual Circular Gauges */}
          <div className="grid grid-cols-2 gap-4 py-3">
            {/* VADER Circular Donut Gauge */}
            <div className="flex flex-col items-center">
              <span className={`text-xs font-semibold mb-2 ${
                theme === 'dark' ? 'text-[#A1A1B5]' : 'text-[#000000]'
              }`}>
                VADER
              </span>

              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
                  <circle
                    cx="44"
                    cy="44"
                    r={radius}
                    fill="none"
                    stroke={theme === 'dark' ? '#2A2340' : '#E9D5FF'}
                    strokeWidth="7"
                  />
                  <circle
                    cx="44"
                    cy="44"
                    r={radius}
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    strokeDashoffset={vaderOffset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className={`text-sm font-bold font-mono ${
                    theme === 'dark' ? 'text-white' : 'text-[#000000]'
                  }`}>
                    {vaderScore.toFixed(2)}
                  </span>
                  <span className={`text-[10px] font-medium ${
                    theme === 'dark' ? 'text-[#A1A1B5]' : 'text-[#1F2937]'
                  }`}>
                    {vaderLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Hugging Face Circular Donut Gauge */}
            <div className="flex flex-col items-center">
              <span className={`text-xs font-semibold mb-2 ${
                theme === 'dark' ? 'text-[#A1A1B5]' : 'text-[#000000]'
              }`}>
                Hugging Face
              </span>

              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
                  <circle
                    cx="44"
                    cy="44"
                    r={radius}
                    fill="none"
                    stroke={theme === 'dark' ? '#2A2340' : '#E9D5FF'}
                    strokeWidth="7"
                  />
                  <circle
                    cx="44"
                    cy="44"
                    r={radius}
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    strokeDashoffset={hfOffset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className={`text-sm font-bold font-mono ${
                    theme === 'dark' ? 'text-white' : 'text-[#000000]'
                  }`}>
                    {hfScore.toFixed(2)}
                  </span>
                  <span className={`text-[10px] font-medium ${
                    theme === 'dark' ? 'text-[#A1A1B5]' : 'text-[#1F2937]'
                  }`}>
                    {hfLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Horizontal Bars */}
          <div className="space-y-2.5 pt-1">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={`font-medium ${
                  theme === 'dark' ? 'text-[#A1A1B5]' : 'text-[#000000]'
                }`}>
                  VADER
                </span>
                <span className={`font-mono text-xs font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-[#000000]'
                }`}>
                  {vaderScore.toFixed(2)}
                </span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${
                theme === 'dark' ? 'bg-[#1F192E]' : 'bg-[#E9D5FF]'
              }`}>
                <div
                  className="h-full rounded-full bg-[#8B5CF6] transition-all duration-500"
                  style={{ width: `${Math.round(vaderScore * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={`font-medium ${
                  theme === 'dark' ? 'text-[#A1A1B5]' : 'text-[#000000]'
                }`}>
                  Hugging Face
                </span>
                <span className={`font-mono text-xs font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-[#000000]'
                }`}>
                  {hfScore.toFixed(2)}
                </span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${
                theme === 'dark' ? 'bg-[#1F192E]' : 'bg-[#E9D5FF]'
              }`}>
                <div
                  className="h-full rounded-full bg-[#8B5CF6] transition-all duration-500"
                  style={{ width: `${Math.round(hfScore * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Subtitle / Insight Note */}
      <p className={`mt-3 text-[11px] leading-relaxed font-medium ${
        theme === 'dark' ? 'text-[#A78BFA]' : 'text-[#6D28D9]'
      }`}>
        {comparisonNote}
      </p>
    </div>
  );
};
