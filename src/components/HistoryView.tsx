import React, { useState } from 'react';
import { Clock, Download, Search, CheckCircle2, AlertTriangle, ArrowRight, Trash2 } from 'lucide-react';

interface HistoryRecord {
  id: string;
  title: string;
  timestamp: string;
  commentCount: number;
  dominantSentiment: 'Positive' | 'Neutral' | 'Negative';
  vaderScore: number;
  hfScore: number;
  agreementRate: number;
}

export const HistoryView: React.FC<{ onInspectBatch?: (id: string) => void }> = ({ onInspectBatch }) => {
  const [records, setRecords] = useState<HistoryRecord[]>([
    {
      id: 'h_1',
      title: 'Wireless Headphones Launch Feedback',
      timestamp: 'Today at 09:15 AM',
      commentCount: 12,
      dominantSentiment: 'Positive',
      vaderScore: 0.62,
      hfScore: 0.68,
      agreementRate: 83
    },
    {
      id: 'h_2',
      title: 'Customer Support Satisfaction Q3',
      timestamp: 'Yesterday at 04:30 PM',
      commentCount: 24,
      dominantSentiment: 'Neutral',
      vaderScore: 0.12,
      hfScore: 0.15,
      agreementRate: 75
    },
    {
      id: 'h_3',
      title: 'App Store v4.2 Release Reviews',
      timestamp: 'Oct 3, 2025',
      commentCount: 50,
      dominantSentiment: 'Negative',
      vaderScore: -0.45,
      hfScore: -0.52,
      agreementRate: 92
    },
    {
      id: 'h_4',
      title: 'Product Landing Page User Feedback',
      timestamp: 'Sep 29, 2025',
      commentCount: 18,
      dominantSentiment: 'Positive',
      vaderScore: 0.78,
      hfScore: 0.81,
      agreementRate: 94
    }
  ]);

  const [search, setSearch] = useState('');

  const filtered = records.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-[14px] border bg-[#14141C] border-[#2A2340] dark:bg-[#14141C] dark:border-[#2A2340] light:bg-[#F5F3FF] light:border-[#DDD6FE]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE]">
          <div>
            <h2 className="text-lg font-bold text-white dark:text-white light:text-[#0A0A0F]">
              Analysis History & Archives
            </h2>
            <p className="text-xs text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B]">
              Browse previous sentiment evaluation sessions and export datasets
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#A1A1B5] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search history sessions..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-[8px] bg-[#0A0A0F] dark:bg-[#0A0A0F] light:bg-[#FFFFFF] border border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE] text-white dark:text-white light:text-[#0A0A0F] purple-input-glow"
            />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#A1A1B5]">
              No history sessions found matching "{search}".
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-[12px] bg-[#0A0A0F]/60 dark:bg-[#0A0A0F]/60 light:bg-[#FFFFFF] border border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#8B5CF6]/50 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white dark:text-white light:text-[#0A0A0F]">
                      {item.title}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] border ${
                        item.dominantSentiment === 'Positive'
                          ? 'text-[#22C55E] bg-[#22C55E]/15 border-[#22C55E]/30'
                          : item.dominantSentiment === 'Negative'
                          ? 'text-[#EF4444] bg-[#EF4444]/15 border-[#EF4444]/30'
                          : 'text-[#A1A1B5] bg-[#A1A1B5]/15 border-[#A1A1B5]/30'
                      }`}
                    >
                      {item.dominantSentiment}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#A1A1B5] font-mono text-[11px]">
                    <span>{item.timestamp}</span>
                    <span>·</span>
                    <span>{item.commentCount} comments</span>
                    <span>·</span>
                    <span>Consensus: {item.agreementRate}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto font-mono text-xs">
                  <div className="text-right">
                    <span className="text-[#A1A1B5] text-[10px] block">VADER / HF:</span>
                    <span className="text-white dark:text-white light:text-[#0A0A0F] font-semibold">
                      {item.vaderScore > 0 ? `+${item.vaderScore.toFixed(2)}` : item.vaderScore.toFixed(2)} / {item.hfScore > 0 ? `+${item.hfScore.toFixed(2)}` : item.hfScore.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    title="Delete record"
                    className="p-1.5 rounded-[6px] text-[#A1A1B5] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
