import React from 'react';
import { Smile, Frown, Meh, Tag, Clock, Lightbulb, Gamepad2, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface RightColumnCardsProps {
  isEmpty?: boolean;
  positivePercent?: number;
  neutralPercent?: number;
  negativePercent?: number;
  topKeywords?: { text: string; count: number; barPercent: number }[];
  onSelectKeyword?: (keyword: string) => void;
  onSelectRecentAnalysis?: (item: string) => void;
  onOpenEmojiGame?: () => void;
}

export const RightColumnCards: React.FC<RightColumnCardsProps> = ({
  isEmpty = false,
  positivePercent = 0,
  neutralPercent = 0,
  negativePercent = 0,
  topKeywords = [],
  onSelectKeyword,
  onSelectRecentAnalysis,
  onOpenEmojiGame,
}) => {
  const { theme } = useTheme();
  const recentAnalyses = [
    { id: '1', title: 'Product review comments', time: '2 hours ago', sentiment: 'positive' },
    { id: '2', title: 'Customer feedback', time: '5 hours ago', sentiment: 'positive' },
    { id: '3', title: 'Social media mentions', time: '1 day ago', sentiment: 'neutral' },
    { id: '4', title: 'Support tickets', time: '2 days ago', sentiment: 'negative' },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Quick Summary Card */}
      <div className={`p-5 rounded-[14px] border shadow-sm ${
        theme === 'dark'
          ? 'bg-[#14141C] border-[#2A2340]'
          : 'bg-[#FFFFFF] border-[#8B5CF6]/30'
      }`}>
        <div className="flex items-center gap-2 pb-3">
          <div className="w-5 h-5 rounded-[6px] bg-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6]">
            <Smile className="w-3.5 h-3.5" />
          </div>
          <h4 className={`text-sm font-bold ${
            theme === 'dark' ? 'text-white' : 'text-[#000000]'
          }`}>
            Quick Summary
          </h4>
        </div>

        {isEmpty ? (
          <div className="py-4 text-center">
            <div className={`w-12 h-12 rounded-full border flex items-center justify-center mx-auto mb-2 ${
              theme === 'dark'
                ? 'bg-[#2A2340]/40 border-[#2A2340] text-[#A1A1B5]'
                : 'bg-[#F3E8FF] border-[#8B5CF6]/30 text-[#7C3AED]'
            }`}>
              <Meh className="w-6 h-6" />
            </div>
            <span className={`text-sm font-bold block ${
              theme === 'dark' ? 'text-white' : 'text-[#000000]'
            }`}>
              Awaiting Input
            </span>
            <span className={`text-xs font-medium ${
              theme === 'dark' ? 'text-[#A1A1B5]' : 'text-[#1F2937]'
            }`}>
              0% Analyzed
            </span>
            <p className={`text-[11px] mt-2 font-medium ${
              theme === 'dark' ? 'text-[#A1A1B5]' : 'text-[#1F2937]'
            }`}>
              Add comments to see live percentage breakdown.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3.5 py-2">
              <div className="w-12 h-12 rounded-full bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E] shrink-0">
                <Smile className="w-7 h-7" />
              </div>
              <div>
                <h5 className={`text-base font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-[#000000]'
                }`}>
                  {positivePercent >= 50 ? 'Positive' : neutralPercent >= 50 ? 'Neutral' : 'Negative'}
                </h5>
                <span className="text-2xl font-mono font-bold text-[#22C55E]">
                  {positivePercent}%
                </span>
              </div>
            </div>

            <div className={`space-y-3 mt-3 pt-2 border-t ${
              theme === 'dark' ? 'border-[#2A2340]/60' : 'border-[#8B5CF6]/20'
            }`}>
              {/* Positive Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                    <span className={`font-medium ${
                      theme === 'dark' ? 'text-[#A1A1B5]' : 'text-[#000000]'
                    }`}>
                      Positive
                    </span>
                  </div>
                  <span className={`font-mono text-xs font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-[#000000]'
                  }`}>
                    {positivePercent}%
                  </span>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                  theme === 'dark' ? 'bg-[#1F192E]' : 'bg-[#E9D5FF]'
                }`}>
                  <div
                    className="h-full rounded-full bg-[#22C55E] transition-all duration-500"
                    style={{ width: `${positivePercent}%` }}
                  />
                </div>
              </div>

              {/* Neutral Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#A1A1B5]" />
                    <span className={`font-medium ${
                      theme === 'dark' ? 'text-[#A1A1B5]' : 'text-[#000000]'
                    }`}>
                      Neutral
                    </span>
                  </div>
                  <span className={`font-mono text-xs font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-[#000000]'
                  }`}>
                    {neutralPercent}%
                  </span>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                  theme === 'dark' ? 'bg-[#1F192E]' : 'bg-[#E9D5FF]'
                }`}>
                  <div
                    className="h-full rounded-full bg-[#A1A1B5] transition-all duration-500"
                    style={{ width: `${neutralPercent}%` }}
                  />
                </div>
              </div>

              {/* Negative Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                    <span className={`font-medium ${
                      theme === 'dark' ? 'text-[#A1A1B5]' : 'text-[#000000]'
                    }`}>
                      Negative
                    </span>
                  </div>
                  <span className={`font-mono text-xs font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-[#000000]'
                  }`}>
                    {negativePercent}%
                  </span>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                  theme === 'dark' ? 'bg-[#1F192E]' : 'bg-[#E9D5FF]'
                }`}>
                  <div
                    className="h-full rounded-full bg-[#EF4444] transition-all duration-500"
                    style={{ width: `${negativePercent}%` }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 2. Top Keywords Card */}
      <div className={`p-5 rounded-[14px] border shadow-sm ${
        theme === 'dark'
          ? 'bg-[#14141C] border-[#2A2340]'
          : 'bg-[#FFFFFF] border-[#8B5CF6]/30'
      }`}>
        <div className="flex items-center gap-2 pb-3">
          <Tag className="w-4 h-4 text-[#8B5CF6]" />
          <h4 className={`text-sm font-bold ${
            theme === 'dark' ? 'text-white' : 'text-[#000000]'
          }`}>
            Top Keywords
          </h4>
        </div>

        {topKeywords.length === 0 ? (
          <div className={`py-6 text-center text-xs font-medium ${
            theme === 'dark' ? 'text-[#A1A1B5]' : 'text-[#1F2937]'
          }`}>
            No keywords extracted yet.
          </div>
        ) : (
          <div className="space-y-3">
            {topKeywords.map((kw) => (
              <div
                key={kw.text}
                onClick={() => onSelectKeyword?.(kw.text)}
                className="cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={`font-medium transition-colors ${
                    theme === 'dark'
                      ? 'text-white group-hover:text-[#8B5CF6]'
                      : 'text-[#000000] group-hover:text-[#7C3AED]'
                  }`}>
                    {kw.text}
                  </span>
                  <span className={`font-mono text-xs font-semibold ${
                    theme === 'dark' ? 'text-[#A1A1B5]' : 'text-[#1F2937]'
                  }`}>
                    {kw.count}
                  </span>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                  theme === 'dark' ? 'bg-[#1F192E]' : 'bg-[#E9D5FF]'
                }`}>
                  <div
                    className="h-full rounded-full bg-[#8B5CF6] group-hover:bg-[#7C3AED] transition-all duration-300"
                    style={{ width: `${kw.barPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Emotion Game Feature Callout */}
      {onOpenEmojiGame && (
        <div
          onClick={onOpenEmojiGame}
          className={`p-4 rounded-[14px] border transition-all duration-200 cursor-pointer shadow-sm group ${
            theme === 'dark'
              ? 'border-[#8B5CF6]/40 bg-gradient-to-br from-[#8B5CF6]/15 to-[#4C1D95]/20 hover:border-[#8B5CF6]'
              : 'border-[#8B5CF6]/40 bg-[#FFFFFF] hover:border-[#8B5CF6]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎭</span>
              <h5 className={`text-xs font-bold transition-colors ${
                theme === 'dark'
                  ? 'text-white group-hover:text-[#C4B5FD]'
                  : 'text-[#000000] group-hover:text-[#7C3AED]'
              }`}>
                Emoji Mood & Emotion Game
              </h5>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
              theme === 'dark'
                ? 'bg-[#8B5CF6]/30 text-[#C4B5FD] border-[#8B5CF6]/40'
                : 'bg-[#F3E8FF] text-[#7C3AED] border-[#8B5CF6]/40'
            }`}>
              Interactive
            </span>
          </div>
          <p className={`text-[11px] leading-relaxed font-medium ${
            theme === 'dark' ? 'text-[#A1A1B5]' : 'text-[#1F2937]'
          }`}>
            Pick how you are feeling today with animated emojis, or test if you can outsmart the AI in the Emotion Guessing Challenge!
          </p>
        </div>
      )}

      {/* 4. Recent Analysis Card */}
      <div className={`p-5 rounded-[14px] border shadow-sm ${
        theme === 'dark'
          ? 'bg-[#14141C] border-[#2A2340]'
          : 'bg-[#FFFFFF] border-[#8B5CF6]/30'
      }`}>
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#8B5CF6]" />
            <h4 className={`text-sm font-bold ${
              theme === 'dark' ? 'text-white' : 'text-[#000000]'
            }`}>
              Recent Analysis
            </h4>
          </div>
          <span className="text-xs font-bold text-[#8B5CF6] hover:text-[#7C3AED] cursor-pointer">
            View all
          </span>
        </div>

        <div className="space-y-3">
          {recentAnalyses.map((ra) => {
            let Icon = Smile;
            let iconColor = 'text-[#22C55E] bg-[#22C55E]/15';
            if (ra.sentiment === 'neutral') {
              Icon = Meh;
              iconColor = theme === 'dark' ? 'text-[#A1A1B5] bg-[#A1A1B5]/15' : 'text-[#4B5563] bg-[#6B7280]/15';
            } else if (ra.sentiment === 'negative') {
              Icon = Frown;
              iconColor = 'text-[#EF4444] bg-[#EF4444]/15';
            }

            return (
              <div
                key={ra.id}
                onClick={() => onSelectRecentAnalysis?.(ra.title)}
                className={`flex items-center gap-3 p-1 rounded-[8px] cursor-pointer transition-colors ${
                  theme === 'dark' ? 'hover:bg-[#0A0A0F]/50' : 'hover:bg-[#F8F6FF]'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-semibold truncate ${
                    theme === 'dark' ? 'text-white' : 'text-[#000000]'
                  }`}>
                    {ra.title}
                  </div>
                  <div className={`text-[10px] font-medium ${
                    theme === 'dark' ? 'text-[#A1A1B5]' : 'text-[#1F2937]'
                  }`}>
                    {ra.time}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
