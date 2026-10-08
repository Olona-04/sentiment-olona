import React from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, Zap, Cpu, BarChart2, Info } from 'lucide-react';
import { VaderScores, HuggingFaceScores, ModelComparison } from '../types/sentiment';

interface VaderVsHfComparisonProps {
  vader: VaderScores;
  huggingFace: HuggingFaceScores;
  comparison: ModelComparison;
}

export const VaderVsHfComparison: React.FC<VaderVsHfComparisonProps> = ({
  vader,
  huggingFace,
  comparison
}) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/30';
      case 'negative':
        return 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30';
      default:
        return 'text-[#A1A1B5] bg-[#A1A1B5]/10 border-[#A1A1B5]/30';
    }
  };

  const getSentimentDot = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-[#22C55E]';
      case 'negative':
        return 'bg-[#EF4444]';
      default:
        return 'bg-[#A1A1B5]';
    }
  };

  // Convert compound (-1 to +1) to percentage (0% to 100%) for visual bar
  const compoundPercent = Math.round(((vader.compound + 1) / 2) * 100);

  return (
    <div className="space-y-4">
      {/* Agreement / Discrepancy Overview Banner (in purple shades) */}
      <div
        className={`p-4 rounded-[12px] border transition-all duration-200 ${
          comparison.agreement
            ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/30 text-white dark:text-white light:text-[#0A0A0F]'
            : 'bg-[#4C1D95]/20 border-[#8B5CF6]/50 text-white dark:text-white light:text-[#0A0A0F]'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-[10px] bg-[#8B5CF6]/20 text-[#C4B5FD] shrink-0 mt-0.5">
            {comparison.agreement ? (
              <CheckCircle2 className="w-5 h-5 text-[#C4B5FD]" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-[#C4B5FD]" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold tracking-wide text-white dark:text-white light:text-[#0A0A0F]">
                {comparison.agreement
                  ? 'Model Consensus: Both Agree'
                  : comparison.agreementType === 'polar_opposite'
                  ? 'Polar Discrepancy Detected'
                  : 'Nuanced Divergence Detected'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-[6px] font-mono font-medium bg-[#14141C] border border-[#2A2340] text-[#C4B5FD] dark:bg-[#14141C] dark:border-[#2A2340] light:bg-[#FFFFFF] light:border-[#DDD6FE]">
                VADER: {vader.label.toUpperCase()} · HF: {huggingFace.label.toUpperCase()}
              </span>
            </div>
            <p className="mt-1.5 text-xs sm:text-sm text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#4B5563] leading-relaxed">
              {comparison.discrepancyNote}
            </p>
          </div>
        </div>
      </div>

      {/* Side-by-Side Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Model 1: VADER (Lexicon & Rule Heuristics) */}
        <div className="p-5 rounded-[12px] border bg-[#14141C] border-[#2A2340] dark:bg-[#14141C] dark:border-[#2A2340] light:bg-[#F5F3FF] light:border-[#DDD6FE] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE]/70">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[8px] bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#C4B5FD]">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white dark:text-white light:text-[#0A0A0F]">
                    VADER
                  </h4>
                  <p className="text-[11px] text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B]">
                    Rule-Based Lexicon (Hutto & Gilbert)
                  </p>
                </div>
              </div>

              <div className={`px-2.5 py-1 rounded-[8px] border text-xs font-semibold capitalize flex items-center gap-1.5 ${getSentimentColor(vader.label)}`}>
                <span className={`w-2 h-2 rounded-full ${getSentimentDot(vader.label)}`} />
                {vader.label}
              </div>
            </div>

            {/* Compound Metric Meter (using purple styling) */}
            <div className="mt-4 p-3 rounded-[10px] bg-[#0A0A0F]/60 dark:bg-[#0A0A0F]/60 light:bg-[#FFFFFF] border border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B]">
                  Compound Normalized Score
                </span>
                <span className="font-mono font-bold text-white dark:text-white light:text-[#0A0A0F]">
                  {vader.compound > 0 ? `+${vader.compound.toFixed(2)}` : vader.compound.toFixed(2)}
                </span>
              </div>

              {/* Purple gradient slider meter */}
              <div className="relative w-full h-2 rounded-full bg-[#1F192E] dark:bg-[#1F192E] light:bg-[#E2E8F0] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#C4B5FD]"
                  style={{ width: `${compoundPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B] mt-1 font-mono">
                <span>-1.0 (Neg)</span>
                <span>0.0 (Neu)</span>
                <span>+1.0 (Pos)</span>
              </div>
            </div>

            {/* Proportional Breakdown */}
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div className="p-2 rounded-[8px] bg-[#0A0A0F]/40 dark:bg-[#0A0A0F]/40 light:bg-[#FFFFFF] border border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE]">
                <div className="text-[10px] text-[#22C55E] font-medium">Positive</div>
                <div className="text-xs font-mono font-bold text-white dark:text-white light:text-[#0A0A0F] mt-0.5">
                  {(vader.pos * 100).toFixed(0)}%
                </div>
              </div>
              <div className="p-2 rounded-[8px] bg-[#0A0A0F]/40 dark:bg-[#0A0A0F]/40 light:bg-[#FFFFFF] border border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE]">
                <div className="text-[10px] text-[#A1A1B5] font-medium">Neutral</div>
                <div className="text-xs font-mono font-bold text-white dark:text-white light:text-[#0A0A0F] mt-0.5">
                  {(vader.neu * 100).toFixed(0)}%
                </div>
              </div>
              <div className="p-2 rounded-[8px] bg-[#0A0A0F]/40 dark:bg-[#0A0A0F]/40 light:bg-[#FFFFFF] border border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE]">
                <div className="text-[10px] text-[#EF4444] font-medium">Negative</div>
                <div className="text-xs font-mono font-bold text-white dark:text-white light:text-[#0A0A0F] mt-0.5">
                  {(vader.neg * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE]/70 text-[11px] text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B]">
            ⚡ Microsecond execution · Negation 3-token window · Punctuation boost (!)
          </div>
        </div>

        {/* Model 2: Hugging Face (Transformer Self-Attention) */}
        <div className="p-5 rounded-[12px] border bg-[#14141C] border-[#2A2340] dark:bg-[#14141C] dark:border-[#2A2340] light:bg-[#F5F3FF] light:border-[#DDD6FE] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE]/70">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[8px] bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#C4B5FD]">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white dark:text-white light:text-[#0A0A0F]">
                    Hugging Face
                  </h4>
                  <p className="text-[11px] text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B]">
                    Twitter-RoBERTa / DistilBERT Pipeline
                  </p>
                </div>
              </div>

              <div className={`px-2.5 py-1 rounded-[8px] border text-xs font-semibold capitalize flex items-center gap-1.5 ${getSentimentColor(huggingFace.label)}`}>
                <span className={`w-2 h-2 rounded-full ${getSentimentDot(huggingFace.label)}`} />
                {huggingFace.label}
              </div>
            </div>

            {/* Confidence & Probability Breakdown (with purple bars) */}
            <div className="mt-4 p-3 rounded-[10px] bg-[#0A0A0F]/60 dark:bg-[#0A0A0F]/60 light:bg-[#FFFFFF] border border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE]">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B]">
                  Transformer Confidence
                </span>
                <span className="font-mono font-bold text-[#C4B5FD] dark:text-[#C4B5FD] light:text-[#7C3AED]">
                  {(huggingFace.confidence * 100).toFixed(1)}%
                </span>
              </div>

              {/* Stacked or separate probability bars in purple shades */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#22C55E]">Positive probability</span>
                  <span className="font-mono text-white dark:text-white light:text-[#0A0A0F]">
                    {(huggingFace.positive * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#1F192E] dark:bg-[#1F192E] light:bg-[#E2E8F0] overflow-hidden">
                  <div
                    className="h-full bg-[#22C55E] rounded-full transition-all duration-300"
                    style={{ width: `${Math.round(huggingFace.positive * 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-[#A1A1B5]">Neutral probability</span>
                  <span className="font-mono text-white dark:text-white light:text-[#0A0A0F]">
                    {(huggingFace.neutral * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#1F192E] dark:bg-[#1F192E] light:bg-[#E2E8F0] overflow-hidden">
                  <div
                    className="h-full bg-[#A1A1B5] rounded-full transition-all duration-300"
                    style={{ width: `${Math.round(huggingFace.neutral * 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-[#EF4444]">Negative probability</span>
                  <span className="font-mono text-white dark:text-white light:text-[#0A0A0F]">
                    {(huggingFace.negative * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#1F192E] dark:bg-[#1F192E] light:bg-[#E2E8F0] overflow-hidden">
                  <div
                    className="h-full bg-[#EF4444] rounded-full transition-all duration-300"
                    style={{ width: `${Math.round(huggingFace.negative * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Attention focus callout */}
            {huggingFace.contextAttentionSpan && (
              <div className="mt-2.5 px-3 py-1.5 rounded-[8px] bg-[#8B5CF6]/10 border border-[#8B5CF6]/25 text-[11px] text-[#C4B5FD] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{huggingFace.contextAttentionSpan}</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE]/70 text-[11px] text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B]">
            🧠 Multi-head contextual attention · Sarcasm & ironic syntax resolution
          </div>
        </div>
      </div>
    </div>
  );
};
