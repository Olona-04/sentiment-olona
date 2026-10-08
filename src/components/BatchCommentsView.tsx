import React, { useState, useMemo } from 'react';
import {
  Upload,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  FileSpreadsheet,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { analyzeVader } from '../utils/vaderEngine';
import { analyzeHuggingFace, compareModels } from '../utils/transformerEngine';
import { extractKeywords } from '../utils/keywordExtractor';
import { BatchItem, BatchSummary, SentimentClass } from '../types/sentiment';
import { SAMPLE_DATASETS, SampleDataset } from '../data/sampleDatasets';
import { escapeHtml, truncateText } from '../utils/sanitize';
import { TrendLines } from './TrendLines';
import { KeywordBars } from './KeywordBars';

export const BatchCommentsView: React.FC = () => {
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('tech_reviews');
  const [rawText, setRawText] = useState<string>(() => {
    return SAMPLE_DATASETS[0].comments.join('\n');
  });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSentiment, setFilterSentiment] = useState<'all' | 'positive' | 'neutral' | 'negative' | 'divergent'>('all');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initial processed state
  const [batchData, setBatchData] = useState<{
    items: BatchItem[];
    summary: BatchSummary;
  }>(() => {
    return processComments(SAMPLE_DATASETS[0].comments);
  });

  function processComments(commentsList: string[]): { items: BatchItem[]; summary: BatchSummary } {
    const cleanComments = commentsList
      .map(c => c.trim().replace(/^["']|["']$/g, '').replace(/^\d+[\.\)]\s*/, ''))
      .filter(c => c.length > 2);

    if (cleanComments.length === 0) {
      throw new Error('No valid comments detected. Please provide text with at least 1 comment.');
    }

    const items: BatchItem[] = [];
    let posCount = 0;
    let neuCount = 0;
    let negCount = 0;
    let agreementCount = 0;
    let totalCompound = 0;

    for (let i = 0; i < cleanComments.length; i++) {
      const text = cleanComments[i];
      const vader = analyzeVader(text);
      const hf = analyzeHuggingFace(text);
      const comparison = compareModels(vader, hf, text);

      if (vader.label === 'positive') posCount++;
      else if (vader.label === 'negative') negCount++;
      else neuCount++;

      if (comparison.agreement) agreementCount++;
      totalCompound += vader.compound;

      const kw = extractKeywords(text, 3);

      items.push({
        id: `c_${i}_${Math.random().toString(36).substring(6)}`,
        index: i,
        text,
        vader,
        huggingFace: hf,
        comparison,
        primaryKeywords: kw.all.map(k => k.text)
      });
    }

    const total = items.length;
    const avgCompound = total > 0 ? Number((totalCompound / total).toFixed(2)) : 0;
    const agreementRate = total > 0 ? Math.round((agreementCount / total) * 100) : 0;
    const divergentCount = total - agreementCount;

    // Aggregate keywords
    const aggregatedKw = extractKeywords(cleanComments, 16);

    // Compute moving average for trend points
    const windowSize = Math.max(2, Math.min(4, Math.floor(total / 4)));
    const trendPoints = items.map((item, idx) => {
      let sum = 0;
      let count = 0;
      for (let w = Math.max(0, idx - windowSize + 1); w <= Math.min(items.length - 1, idx + windowSize - 1); w++) {
        sum += items[w].vader.compound;
        count++;
      }
      const movingAvg = count > 0 ? Number((sum / count).toFixed(2)) : item.vader.compound;

      return {
        index: idx,
        excerpt: item.text,
        vaderCompound: item.vader.compound,
        hfPositiveScore: item.huggingFace.positive,
        hfNegativeScore: item.huggingFace.negative,
        label: item.vader.label,
        movingAvg
      };
    });

    const summary: BatchSummary = {
      total,
      positiveCount: posCount,
      neutralCount: neuCount,
      negativeCount: negCount,
      positivePercent: Math.round((posCount / total) * 100),
      neutralPercent: Math.round((neuCount / total) * 100),
      negativePercent: Math.round((negCount / total) * 100),
      avgCompound,
      agreementRate,
      divergentCount,
      topPositiveKeywords: aggregatedKw.positive,
      topNegativeKeywords: aggregatedKw.negative,
      allKeywords: aggregatedKw.all,
      trendPoints
    };

    return { items, summary };
  }

  const handleProcessBatch = () => {
    if (!rawText.trim()) {
      setErrorMessage('Please paste at least one comment or upload a file.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    setTimeout(() => {
      try {
        const lines = rawText
          .split(/\r?\n/)
          .map(l => l.trim())
          .filter(Boolean);

        const processed = processComments(lines);
        setBatchData(processed);
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to process batch.');
      } finally {
        setIsProcessing(false);
      }
    }, 320);
  };

  const handleSelectDataset = (datasetId: string) => {
    setSelectedDatasetId(datasetId);
    const ds = SAMPLE_DATASETS.find(d => d.id === datasetId);
    if (ds) {
      const textJoined = ds.comments.join('\n');
      setRawText(textJoined);
      setErrorMessage(null);
      setIsProcessing(true);
      setTimeout(() => {
        try {
          const processed = processComments(ds.comments);
          setBatchData(processed);
        } catch (err: any) {
          setErrorMessage(err?.message);
        } finally {
          setIsProcessing(false);
        }
      }, 200);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
        setSelectedDatasetId('custom');
      }
    };
    reader.readAsText(file);
  };

  // Filter & Search comments
  const filteredItems = useMemo(() => {
    return batchData.items.filter(item => {
      const matchesSearch = searchQuery
        ? item.text.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      let matchesSentiment = true;
      if (filterSentiment === 'divergent') {
        matchesSentiment = !item.comparison.agreement;
      } else if (filterSentiment !== 'all') {
        matchesSentiment = item.vader.label === filterSentiment;
      }

      return matchesSearch && matchesSentiment;
    });
  }, [batchData.items, searchQuery, filterSentiment]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Index', 'Comment', 'VADER_Label', 'VADER_Compound', 'HF_Label', 'HF_Confidence', 'Models_Agree'];
    const rows = batchData.items.map(it => [
      it.index + 1,
      `"${it.text.replace(/"/g, '""')}"`,
      it.vader.label,
      it.vader.compound,
      it.huggingFace.label,
      (it.huggingFace.confidence * 100).toFixed(1) + '%',
      it.comparison.agreement ? 'YES' : 'NO'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sentix_batch_analysis_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyComment = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Batch Input Console */}
      <div className="p-5 sm:p-6 rounded-[12px] border bg-[#14141C] border-[#2A2340] dark:bg-[#14141C] dark:border-[#2A2340] light:bg-[#F5F3FF] light:border-[#DDD6FE] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-semibold text-white dark:text-white light:text-[#0A0A0F]">
              Batch Comments & Review Pipeline
            </h3>
            <p className="text-xs text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B]">
              Paste one comment per line, upload CSV/TXT, or select preloaded benchmarks
            </p>
          </div>

          {/* Dataset selector */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B] mr-1">
              Datasets:
            </span>
            {SAMPLE_DATASETS.map((ds) => (
              <button
                key={ds.id}
                onClick={() => handleSelectDataset(ds.id)}
                className={`text-xs px-2.5 py-1 rounded-[8px] border transition-all duration-150 ${
                  selectedDatasetId === ds.id
                    ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-sm shadow-[#8B5CF6]/30'
                    : 'bg-[#0A0A0F]/60 text-[#A1A1B5] border-[#2A2340] hover:text-white hover:border-[#8B5CF6]/50 dark:bg-[#0A0A0F]/60 dark:text-[#A1A1B5] light:bg-[#FFFFFF] light:text-[#4B5563] light:border-[#DDD6FE]'
                }`}
              >
                {ds.name}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area with Purple Glow on Focus */}
        <div className="relative">
          <textarea
            value={rawText}
            onChange={(e) => {
              setRawText(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="Paste multiple comments (one comment per line)..."
            rows={6}
            className="w-full p-4 rounded-[12px] bg-[#0A0A0F] dark:bg-[#0A0A0F] light:bg-[#FFFFFF] border border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE] text-white dark:text-white light:text-[#0A0A0F] placeholder-[#A1A1B5]/50 text-sm leading-relaxed resize-y transition-all duration-200 purple-input-glow font-mono text-xs"
          />
        </div>

        {/* Console Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE]">
          <div className="flex items-center gap-3 text-xs text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B]">
            {/* File Upload Button */}
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#0A0A0F]/60 dark:bg-[#0A0A0F]/60 light:bg-[#FFFFFF] border border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE] hover:border-[#8B5CF6] text-[#C4B5FD] cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Import .csv / .txt</span>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <span className="font-mono">
              {rawText.split(/\r?\n/).filter(l => l.trim()).length} lines detected
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Gradient Purple Analyze Button */}
            <button
              onClick={handleProcessBatch}
              disabled={isProcessing}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-[12px] font-medium text-sm text-white bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] shadow-lg shadow-[#8B5CF6]/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Evaluating Batch...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Comments Batch</span>
                </>
              )}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-3 p-3 rounded-[10px] bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isProcessing && (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 rounded-[12px] bg-[#14141C] border border-[#2A2340]" />
            ))}
          </div>
          <div className="h-56 rounded-[12px] bg-[#14141C] border border-[#2A2340]" />
          <div className="h-64 rounded-[12px] bg-[#14141C] border border-[#2A2340]" />
        </div>
      )}

      {/* Populated Analytics Dashboard */}
      {!isProcessing && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Total Analyzed */}
            <div className="p-3.5 rounded-[12px] border bg-[#14141C] border-[#2A2340] dark:bg-[#14141C] dark:border-[#2A2340] light:bg-[#F5F3FF] light:border-[#DDD6FE]">
              <span className="text-[11px] text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B] block truncate">
                Total Comments
              </span>
              <span className="text-xl font-mono font-bold text-white dark:text-white light:text-[#0A0A0F] mt-1 block">
                {batchData.summary.total}
              </span>
            </div>

            {/* Positive */}
            <div className="p-3.5 rounded-[12px] border bg-[#14141C] border-[#2A2340] dark:bg-[#14141C] dark:border-[#2A2340] light:bg-[#F5F3FF] light:border-[#DDD6FE]">
              <span className="text-[11px] text-[#22C55E] block truncate font-medium">
                Positive ({batchData.summary.positivePercent}%)
              </span>
              <span className="text-xl font-mono font-bold text-[#22C55E] mt-1 block">
                {batchData.summary.positiveCount}
              </span>
            </div>

            {/* Neutral */}
            <div className="p-3.5 rounded-[12px] border bg-[#14141C] border-[#2A2340] dark:bg-[#14141C] dark:border-[#2A2340] light:bg-[#F5F3FF] light:border-[#DDD6FE]">
              <span className="text-[11px] text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B] block truncate font-medium">
                Neutral ({batchData.summary.neutralPercent}%)
              </span>
              <span className="text-xl font-mono font-bold text-[#A1A1B5] mt-1 block">
                {batchData.summary.neutralCount}
              </span>
            </div>

            {/* Negative */}
            <div className="p-3.5 rounded-[12px] border bg-[#14141C] border-[#2A2340] dark:bg-[#14141C] dark:border-[#2A2340] light:bg-[#F5F3FF] light:border-[#DDD6FE]">
              <span className="text-[11px] text-[#EF4444] block truncate font-medium">
                Negative ({batchData.summary.negativePercent}%)
              </span>
              <span className="text-xl font-mono font-bold text-[#EF4444] mt-1 block">
                {batchData.summary.negativeCount}
              </span>
            </div>

            {/* Avg Compound (Purple Accent) */}
            <div className="p-3.5 rounded-[12px] border bg-[#14141C] border-[#2A2340] dark:bg-[#14141C] dark:border-[#2A2340] light:bg-[#F5F3FF] light:border-[#DDD6FE]">
              <span className="text-[11px] text-[#C4B5FD] dark:text-[#C4B5FD] light:text-[#7C3AED] block truncate font-medium">
                Avg Compound
              </span>
              <span className="text-xl font-mono font-bold text-[#C4B5FD] dark:text-[#C4B5FD] light:text-[#7C3AED] mt-1 block">
                {batchData.summary.avgCompound > 0 ? `+${batchData.summary.avgCompound.toFixed(2)}` : batchData.summary.avgCompound.toFixed(2)}
              </span>
            </div>

            {/* Agreement Rate (Purple highlight) */}
            <div className="p-3.5 rounded-[12px] border bg-[#14141C] border-[#2A2340] dark:bg-[#14141C] dark:border-[#2A2340] light:bg-[#F5F3FF] light:border-[#DDD6FE]">
              <span className="text-[11px] text-[#C4B5FD] dark:text-[#C4B5FD] light:text-[#7C3AED] block truncate font-medium">
                Consensus Rate
              </span>
              <span className="text-xl font-mono font-bold text-[#C4B5FD] dark:text-[#C4B5FD] light:text-[#7C3AED] mt-1 block">
                {batchData.summary.agreementRate}%
              </span>
            </div>
          </div>

          {/* Batch Trend Line (in purple shades) */}
          <TrendLines
            data={batchData.summary.trendPoints}
            title="Batch Sentiment Trajectory Across Comments"
            subtitle="Sequential sentiment trajectory and moving average line in purple shades"
          />

          {/* Aggregate Salient Keyword Distribution (in purple shades) */}
          <KeywordBars
            allKeywords={batchData.summary.allKeywords}
            positiveKeywords={batchData.summary.topPositiveKeywords}
            negativeKeywords={batchData.summary.topNegativeKeywords}
            title="Batch Keyword Salience & Frequency"
          />

          {/* Detailed Comments Table with Escaped Text */}
          <div className="p-5 rounded-[12px] border bg-[#14141C] border-[#2A2340] dark:bg-[#14141C] dark:border-[#2A2340] light:bg-[#F5F3FF] light:border-[#DDD6FE] shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE]">
              <div>
                <h4 className="text-sm font-semibold text-white dark:text-white light:text-[#0A0A0F]">
                  Classified Comments Feed ({filteredItems.length} of {batchData.items.length})
                </h4>
                <p className="text-[11px] text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B]">
                  Pasted text is safely escaped. Click row to reveal comparative model diagnostics.
                </p>
              </div>

              {/* Action Buttons: Export CSV */}
              <div className="flex items-center gap-2 self-start md:self-auto">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 border border-[#8B5CF6]/30 text-xs font-medium text-[#C4B5FD] transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
              {/* Search input with purple glow */}
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-[#A1A1B5] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search inside comments..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-[8px] bg-[#0A0A0F] dark:bg-[#0A0A0F] light:bg-[#FFFFFF] border border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE] text-white dark:text-white light:text-[#0A0A0F] purple-input-glow"
                />
              </div>

              {/* Sentiment Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1 self-start sm:self-auto">
                <button
                  onClick={() => setFilterSentiment('all')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-[6px] transition-all ${
                    filterSentiment === 'all'
                      ? 'bg-[#8B5CF6] text-white'
                      : 'text-[#A1A1B5] hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterSentiment('positive')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-[6px] transition-all ${
                    filterSentiment === 'positive'
                      ? 'bg-[#22C55E] text-white'
                      : 'text-[#A1A1B5] hover:text-[#22C55E]'
                  }`}
                >
                  Positive ({batchData.summary.positiveCount})
                </button>
                <button
                  onClick={() => setFilterSentiment('neutral')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-[6px] transition-all ${
                    filterSentiment === 'neutral'
                      ? 'bg-[#A1A1B5] text-[#0A0A0F]'
                      : 'text-[#A1A1B5] hover:text-white'
                  }`}
                >
                  Neutral ({batchData.summary.neutralCount})
                </button>
                <button
                  onClick={() => setFilterSentiment('negative')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-[6px] transition-all ${
                    filterSentiment === 'negative'
                      ? 'bg-[#EF4444] text-white'
                      : 'text-[#A1A1B5] hover:text-[#EF4444]'
                  }`}
                >
                  Negative ({batchData.summary.negativeCount})
                </button>
                <button
                  onClick={() => setFilterSentiment('divergent')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-[6px] border border-[#8B5CF6]/40 transition-all ${
                    filterSentiment === 'divergent'
                      ? 'bg-[#8B5CF6] text-white'
                      : 'text-[#C4B5FD] hover:bg-[#8B5CF6]/15'
                  }`}
                >
                  Divergent ({batchData.summary.divergentCount})
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="mt-4 space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredItems.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B]">
                  No comments match the search and filter criteria.
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isExpanded = expandedItemId === item.id;
                  const isCopied = copiedId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-[10px] border transition-all duration-150 ${
                        isExpanded
                          ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]'
                          : 'bg-[#0A0A0F]/50 border-[#2A2340] hover:border-[#8B5CF6]/50 dark:bg-[#0A0A0F]/50 dark:border-[#2A2340] light:bg-[#FFFFFF] light:border-[#DDD6FE]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <span className="font-mono text-[11px] text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B] pt-0.5 shrink-0">
                            #{item.index + 1}
                          </span>

                          <div className="flex-1 min-w-0">
                            {/* Strictly escaped safe text rendering */}
                            <p className="text-xs sm:text-sm text-white dark:text-white light:text-[#0A0A0F] leading-relaxed break-words">
                              {item.text}
                            </p>

                            {/* Keywords pills */}
                            {item.primaryKeywords.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1 mt-2 text-[10px] text-[#C4B5FD]">
                                <span className="text-[#A1A1B5] mr-1">Tokens:</span>
                                {item.primaryKeywords.map((kw, ki) => (
                                  <span
                                    key={ki}
                                    className="px-1.5 py-0.5 rounded-[4px] bg-[#8B5CF6]/15 border border-[#8B5CF6]/25"
                                  >
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Badges & Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* VADER Compound */}
                          <div className="text-right">
                            <span
                              className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-[6px] block ${
                                item.vader.label === 'positive'
                                  ? 'text-[#22C55E] bg-[#22C55E]/10'
                                  : item.vader.label === 'negative'
                                  ? 'text-[#EF4444] bg-[#EF4444]/10'
                                  : 'text-[#A1A1B5] bg-[#A1A1B5]/10'
                              }`}
                            >
                              VADER: {item.vader.compound > 0 ? `+${item.vader.compound.toFixed(2)}` : item.vader.compound.toFixed(2)}
                            </span>
                          </div>

                          {/* Hugging Face Label */}
                          <div className="text-right hidden sm:block">
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-[6px] block capitalize ${
                                item.huggingFace.label === 'positive'
                                  ? 'text-[#22C55E] bg-[#22C55E]/10'
                                  : item.huggingFace.label === 'negative'
                                  ? 'text-[#EF4444] bg-[#EF4444]/10'
                                  : 'text-[#A1A1B5] bg-[#A1A1B5]/10'
                              }`}
                            >
                              HF: {item.huggingFace.label} ({(item.huggingFace.confidence * 100).toFixed(0)}%)
                            </span>
                          </div>

                          {/* Agreement / Divergence Icon */}
                          <div title={item.comparison.agreement ? 'Models Agree' : 'Models Disagree'}>
                            {item.comparison.agreement ? (
                              <CheckCircle2 className="w-4 h-4 text-[#8B5CF6]" />
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40">
                                DIVERGENT
                              </span>
                            )}
                          </div>

                          {/* Copy Action */}
                          <button
                            onClick={() => handleCopyComment(item.id, item.text)}
                            title="Copy text"
                            className="p-1 rounded-[6px] text-[#A1A1B5] hover:text-white transition-colors"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          {/* Expand details */}
                          <button
                            onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                            className="text-xs font-mono text-[#8B5CF6] hover:text-[#C4B5FD] px-1.5 py-0.5 rounded-[4px] hover:bg-[#8B5CF6]/15 transition-all"
                          >
                            {isExpanded ? 'Hide' : 'Inspect'}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Comparative Diagnostics */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE] text-xs space-y-2">
                          <div className="p-2.5 rounded-[8px] bg-[#0A0A0F]/80 border border-[#8B5CF6]/30 text-[#C4B5FD] text-[11px] leading-relaxed">
                            <span className="font-bold text-white block mb-0.5">Model Comparison Rationale:</span>
                            {item.comparison.discrepancyNote}
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-[11px]">
                            <div className="p-2 rounded-[6px] bg-[#14141C] border border-[#2A2340]">
                              <span className="text-[#A1A1B5] block">VADER Breakdown:</span>
                              <span className="font-mono text-white">
                                Pos: {(item.vader.pos * 100).toFixed(0)}% · Neu: {(item.vader.neu * 100).toFixed(0)}% · Neg: {(item.vader.neg * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="p-2 rounded-[6px] bg-[#14141C] border border-[#2A2340]">
                              <span className="text-[#A1A1B5] block">Transformer Probabilities:</span>
                              <span className="font-mono text-white">
                                Pos: {(item.huggingFace.positive * 100).toFixed(0)}% · Neu: {(item.huggingFace.neutral * 100).toFixed(0)}% · Neg: {(item.huggingFace.negative * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
