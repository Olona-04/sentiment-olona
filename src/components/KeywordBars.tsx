import React, { useState } from 'react';
import { Tag, Sparkles, TrendingUp, TrendingDown, Layers } from 'lucide-react';
import { KeywordItem } from '../types/sentiment';
import { escapeHtml } from '../utils/sanitize';

interface KeywordBarsProps {
  allKeywords: KeywordItem[];
  positiveKeywords: KeywordItem[];
  negativeKeywords: KeywordItem[];
  title?: string;
}

export const KeywordBars: React.FC<KeywordBarsProps> = ({
  allKeywords,
  positiveKeywords,
  negativeKeywords,
  title = 'Salient Keyword Distribution'
}) => {
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative'>('all');

  const getList = () => {
    switch (filter) {
      case 'positive':
        return positiveKeywords;
      case 'negative':
        return negativeKeywords;
      default:
        return allKeywords;
    }
  };

  const currentList = getList();

  // Purple shades palette for keyword bars
  const purpleGradients = [
    'from-[#8B5CF6] to-[#7C3AED]',
    'from-[#A78BFA] to-[#8B5CF6]',
    'from-[#C4B5FD] to-[#8B5CF6]',
    'from-[#7C3AED] to-[#6D28D9]',
    'from-[#6D28D9] to-[#4C1D95]'
  ];

  return (
    <div className="p-5 rounded-[12px] border bg-[#14141C] border-[#2A2340] dark:bg-[#14141C] dark:border-[#2A2340] light:bg-[#F5F3FF] light:border-[#DDD6FE] shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[8px] bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#C4B5FD]">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white dark:text-white light:text-[#0A0A0F]">
              {title}
            </h4>
            <p className="text-[11px] text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B]">
              Extracted salient tokens & n-grams with relative weight
            </p>
          </div>
        </div>

        {/* Filter Switcher (Purple active state) */}
        <div className="flex items-center gap-1 p-1 rounded-[10px] bg-[#0A0A0F]/60 dark:bg-[#0A0A0F]/60 light:bg-[#FFFFFF] border border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE] self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-[7px] transition-all ${
              filter === 'all'
                ? 'bg-[#8B5CF6] text-white shadow-sm'
                : 'text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B] hover:text-white dark:hover:text-white light:hover:text-[#0A0A0F]'
            }`}
          >
            All ({allKeywords.length})
          </button>
          <button
            onClick={() => setFilter('positive')}
            className={`px-2.5 py-1 text-xs font-medium rounded-[7px] transition-all ${
              filter === 'positive'
                ? 'bg-[#8B5CF6] text-white shadow-sm'
                : 'text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B] hover:text-white dark:hover:text-white light:hover:text-[#0A0A0F]'
            }`}
          >
            Positive ({positiveKeywords.length})
          </button>
          <button
            onClick={() => setFilter('negative')}
            className={`px-2.5 py-1 text-xs font-medium rounded-[7px] transition-all ${
              filter === 'negative'
                ? 'bg-[#8B5CF6] text-white shadow-sm'
                : 'text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B] hover:text-white dark:hover:text-white light:hover:text-[#0A0A0F]'
            }`}
          >
            Negative ({negativeKeywords.length})
          </button>
        </div>
      </div>

      {/* Keyword Bars List */}
      <div className="mt-4">
        {currentList.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B]">
            No salient {filter !== 'all' ? filter : ''} keywords found in this selection.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            {currentList.map((kw, idx) => {
              const gradientClass = purpleGradients[idx % purpleGradients.length];
              return (
                <div
                  key={`${kw.text}-${idx}`}
                  className="group p-2.5 rounded-[10px] bg-[#0A0A0F]/40 dark:bg-[#0A0A0F]/40 light:bg-[#FFFFFF] border border-[#2A2340]/70 dark:border-[#2A2340]/70 light:border-[#DDD6FE]/80 hover:border-[#8B5CF6]/50 transition-all"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-white dark:text-white light:text-[#0A0A0F] truncate max-w-[170px] sm:max-w-[210px]">
                      {kw.text}
                    </span>
                    <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                      <span className="text-[#C4B5FD] dark:text-[#C4B5FD] light:text-[#7C3AED] bg-[#8B5CF6]/15 px-1.5 py-0.5 rounded-[4px]">
                        ×{kw.count}
                      </span>
                      <span
                        className={`text-[10px] font-semibold ${
                          kw.sentiment === 'positive'
                            ? 'text-[#22C55E]'
                            : kw.sentiment === 'negative'
                            ? 'text-[#EF4444]'
                            : 'text-[#A1A1B5]'
                        }`}
                      >
                        {kw.score > 0 ? `+${kw.score.toFixed(1)}` : kw.score.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Purple shade progress bar */}
                  <div className="w-full h-2 rounded-full bg-[#1F192E] dark:bg-[#1F192E] light:bg-[#E9D5FF]/40 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${gradientClass} transition-all duration-300 group-hover:brightness-110`}
                      style={{ width: `${kw.salience}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
