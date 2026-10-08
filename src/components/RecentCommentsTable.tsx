import React, { useState } from 'react';
import { MessageSquare, ChevronRight, Check, Copy, Sparkles } from 'lucide-react';
import { escapeHtml } from '../utils/sanitize';
import { useTheme } from '../context/ThemeContext';

export interface RecentCommentItem {
  id: string;
  comment: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  score: number;
  date: string;
}

interface RecentCommentsTableProps {
  comments?: RecentCommentItem[];
  onSelectComment?: (comment: string) => void;
  onViewAll?: () => void;
  onLoadSamples?: () => void;
}

export const SAMPLE_REVIEWS_PRESET: RecentCommentItem[] = [
  {
    id: 'rc_1',
    comment: 'This product is amazing! Really helps me a lot.',
    sentiment: 'Positive',
    score: 0.92,
    date: 'Oct 4, 2025'
  },
  {
    id: 'rc_2',
    comment: "It's okay, nothing special.",
    sentiment: 'Neutral',
    score: 0.03,
    date: 'Oct 4, 2025'
  },
  {
    id: 'rc_3',
    comment: "I'm really disappointed. It didn't work as expected.",
    sentiment: 'Negative',
    score: -0.78,
    date: 'Oct 4, 2025'
  },
  {
    id: 'rc_4',
    comment: 'Great customer service, very helpful!',
    sentiment: 'Positive',
    score: 0.87,
    date: 'Oct 3, 2025'
  },
  {
    id: 'rc_5',
    comment: 'The app is confusing and hard to use.',
    sentiment: 'Negative',
    score: -0.65,
    date: 'Oct 3, 2025'
  }
];

export const RecentCommentsTable: React.FC<RecentCommentsTableProps> = ({
  comments = [],
  onSelectComment,
  onViewAll,
  onLoadSamples
}) => {
  const { theme } = useTheme();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getSentimentPill = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return 'text-[#22C55E] bg-[#22C55E]/15 border-[#22C55E]/30';
      case 'Negative':
        return 'text-[#EF4444] bg-[#EF4444]/15 border-[#EF4444]/30';
      default:
        return theme === 'dark'
          ? 'text-[#A1A1B5] bg-[#A1A1B5]/15 border-[#A1A1B5]/30'
          : 'text-[#374151] bg-[#6B7280]/15 border-[#6B7280]/30 font-semibold';
    }
  };

  const handleCopy = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className={`p-5 rounded-[14px] border shadow-sm ${
      theme === 'dark'
        ? 'bg-[#14141C] border-[#2A2340]'
        : 'bg-[#FFFFFF] border-[#8B5CF6]/30'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between pb-3 border-b ${
        theme === 'dark' ? 'border-[#2A2340]/70' : 'border-[#8B5CF6]/20'
      }`}>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#8B5CF6]" />
          <h4 className={`text-sm font-bold ${
            theme === 'dark' ? 'text-white' : 'text-[#000000]'
          }`}>
            Recent Comments {comments.length > 0 ? `(${comments.length})` : ''}
          </h4>
        </div>

        {comments.length > 0 && (
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-[#8B5CF6] hover:text-[#7C3AED] transition-colors cursor-pointer"
          >
            View all
          </button>
        )}
      </div>

      {/* Empty State vs Table */}
      {comments.length === 0 ? (
        <div className="py-10 text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-[10px] bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] mb-2">
            <MessageSquare className="w-5 h-5" />
          </div>
          <span className={`text-xs font-bold block ${
            theme === 'dark' ? 'text-white' : 'text-[#000000]'
          }`}>
            No Comments Evaluated Yet
          </span>
          <p className={`text-[11px] max-w-sm mt-1 mb-4 font-medium ${
            theme === 'dark' ? 'text-[#A1A1B5]' : 'text-[#1F2937]'
          }`}>
            Enter or paste customer comments in the input box above, or load 5 sample reviews to see real analysis.
          </p>

          {onLoadSamples && (
            <button
              onClick={onLoadSamples}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] border text-xs font-semibold transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/40 text-[#C4B5FD] hover:bg-[#8B5CF6]/30'
                  : 'bg-[#F3E8FF] border-[#8B5CF6]/40 text-[#6D28D9] hover:bg-[#E9D5FF]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load 5 Sample Reviews</span>
            </button>
          )}
        </div>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b ${
                theme === 'dark'
                  ? 'text-[#A1A1B5] border-[#2A2340]/60'
                  : 'text-[#1F2937] font-bold border-[#8B5CF6]/20'
              }`}>
                <th className="py-2.5 font-semibold pl-1">Comment</th>
                <th className="py-2.5 font-semibold px-4 text-center">Sentiment</th>
                <th className="py-2.5 font-semibold px-4 text-center">Score</th>
                <th className="py-2.5 font-semibold px-4 text-right">Date</th>
                <th className="py-2.5 w-6"></th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              theme === 'dark' ? 'divide-[#2A2340]/40' : 'divide-[#8B5CF6]/15'
            }`}>
              {comments.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelectComment?.(item.comment)}
                  className={`group transition-colors cursor-pointer ${
                    theme === 'dark' ? 'hover:bg-[#0A0A0F]/50' : 'hover:bg-[#F8F6FF]'
                  }`}
                >
                  <td className={`py-3 pl-1 pr-4 max-w-xs sm:max-w-md truncate font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-[#000000]'
                  }`}>
                    <span title={item.comment}>{item.comment}</span>
                  </td>

                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-[6px] text-[11px] font-bold border ${getSentimentPill(
                        item.sentiment
                      )}`}
                    >
                      {item.sentiment}
                    </span>
                  </td>

                  <td className={`py-3 px-4 text-center whitespace-nowrap font-mono text-[11px] font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-[#000000]'
                  }`}>
                    {item.score > 0 ? item.score.toFixed(2) : item.score.toFixed(2)}
                  </td>

                  <td className={`py-3 px-4 text-right whitespace-nowrap text-[11px] font-medium ${
                    theme === 'dark' ? 'text-[#A1A1B5]' : 'text-[#1F2937]'
                  }`}>
                    {item.date}
                  </td>

                  <td className={`py-3 pr-1 text-right transition-colors ${
                    theme === 'dark' ? 'text-[#A1A1B5] group-hover:text-[#8B5CF6]' : 'text-[#4B5563] group-hover:text-[#7C3AED]'
                  }`}>
                    <ChevronRight className="w-3.5 h-3.5 inline" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
