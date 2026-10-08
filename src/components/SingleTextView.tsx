import React, { useState } from 'react';
import { Send, RotateCcw, Sparkles, FileText, Clock, AlignLeft, Check, AlertCircle } from 'lucide-react';
import { analyzeVader } from '../utils/vaderEngine';
import { analyzeHuggingFace, compareModels } from '../utils/transformerEngine';
import { extractKeywords } from '../utils/keywordExtractor';
import { SingleAnalysisResult, SentenceAnalysis } from '../types/sentiment';
import { SINGLE_TEXT_PRESETS } from '../data/sampleDatasets';
import { escapeHtml } from '../utils/sanitize';
import { VaderVsHfComparison } from './VaderVsHfComparison';
import { KeywordBars } from './KeywordBars';
import { TrendLines } from './TrendLines';

export const SingleTextView: React.FC = () => {
  const [inputText, setInputText] = useState<string>(SINGLE_TEXT_PRESETS[2].text); // Start with sarcastic preset demonstrating VADER vs HF!
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(2);
  const [selectedSentenceIdx, setSelectedSentenceIdx] = useState<number | null>(null);
  const [result, setResult] = useState<SingleAnalysisResult | null>(() => {
    // Initial analysis of default text
    return executeAnalysis(SINGLE_TEXT_PRESETS[2].text);
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function executeAnalysis(text: string): SingleAnalysisResult {
    const trimmed = text.trim();
    const vader = analyzeVader(trimmed);
    const huggingFace = analyzeHuggingFace(trimmed);
    const comparison = compareModels(vader, huggingFace, trimmed);
    const kw = extractKeywords(trimmed, 12);

    // Sentence splitting
    const rawSentences = trimmed
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(Boolean);

    const sentences: SentenceAnalysis[] = rawSentences.map(sent => {
      const sentVader = analyzeVader(sent);
      const sentHf = analyzeHuggingFace(sent);
      return {
        text: sent,
        vaderCompound: sentVader.compound,
        vaderLabel: sentVader.label,
        hfLabel: sentHf.label,
        hfConfidence: sentHf.confidence
      };
    });

    const words = trimmed.split(/\s+/).filter(Boolean);
    const charCount = trimmed.length;
    const wordCount = words.length;
    const readingTimeSec = Math.max(1, Math.round(wordCount / 3.5)); // ~210 wpm
    const subjectivity = Math.min(1, Number((vader.pos + vader.neg + 0.1).toFixed(2)));

    return {
      id: Math.random().toString(36).substring(7),
      text: trimmed,
      timestamp: Date.now(),
      vader,
      huggingFace,
      comparison,
      keywords: kw.all,
      positiveKeywords: kw.positive,
      negativeKeywords: kw.negative,
      sentences,
      metrics: {
        charCount,
        wordCount,
        readingTimeSec,
        subjectivity
      }
    };
  }

  const handleAnalyze = () => {
    if (!inputText.trim()) {
      setErrorMessage('Please enter or paste some text to analyze.');
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);
    setSelectedSentenceIdx(null);

    // Simulated short async delay to display loading skeleton
    setTimeout(() => {
      try {
        const analysis = executeAnalysis(inputText);
        setResult(analysis);
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to analyze text.');
      } finally {
        setIsAnalyzing(false);
      }
    }, 280);
  };

  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index);
    setInputText(SINGLE_TEXT_PRESETS[index].text);
    setErrorMessage(null);
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
    setErrorMessage(null);
    setSelectedPresetIndex(-1);
  };

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <div className="p-5 sm:p-6 rounded-[12px] border bg-[#14141C] border-[#2A2340] dark:bg-[#14141C] dark:border-[#2A2340] light:bg-[#F5F3FF] light:border-[#DDD6FE] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-semibold text-white dark:text-white light:text-[#0A0A0F]">
              Sentiment Input Console
            </h3>
            <p className="text-xs text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B]">
              Analyze reviews, tweets, customer feedback, or long-form passages
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B] mr-1 hidden lg:inline">
              Sample Prompts:
            </span>
            {SINGLE_TEXT_PRESETS.map((p, idx) => (
              <button
                key={p.label}
                onClick={() => handleSelectPreset(idx)}
                className={`text-xs px-2.5 py-1 rounded-[8px] border transition-all duration-150 ${
                  selectedPresetIndex === idx
                    ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-sm shadow-[#8B5CF6]/30'
                    : 'bg-[#0A0A0F]/60 text-[#A1A1B5] border-[#2A2340] hover:text-white hover:border-[#8B5CF6]/50 dark:bg-[#0A0A0F]/60 dark:text-[#A1A1B5] light:bg-[#FFFFFF] light:text-[#4B5563] light:border-[#DDD6FE]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area with Purple Glow on Focus */}
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="Paste customer review, social media comment, article paragraph, or product feedback..."
            rows={5}
            className="w-full p-4 rounded-[12px] bg-[#0A0A0F] dark:bg-[#0A0A0F] light:bg-[#FFFFFF] border border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE] text-white dark:text-white light:text-[#0A0A0F] placeholder-[#A1A1B5]/50 text-sm leading-relaxed resize-y transition-all duration-200 purple-input-glow"
          />

          {inputText && (
            <button
              onClick={handleClear}
              title="Clear input"
              className="absolute top-3 right-3 p-1.5 rounded-[8px] bg-[#14141C]/80 hover:bg-[#2A2340] text-[#A1A1B5] hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Character & Word counter + Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE]">
          <div className="flex items-center gap-4 text-xs font-mono text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B]">
            <span>{inputText.length} characters</span>
            <span>·</span>
            <span>{inputText.trim() ? inputText.trim().split(/\s+/).length : 0} words</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Gradient Purple Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-[12px] font-medium text-sm text-white bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] shadow-lg shadow-[#8B5CF6]/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Analyzing Models...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Sentiment</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-3 p-3 rounded-[10px] bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isAnalyzing && (
        <div className="space-y-4 animate-pulse">
          <div className="h-28 rounded-[12px] bg-[#14141C] border border-[#2A2340]" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-64 rounded-[12px] bg-[#14141C] border border-[#2A2340]" />
            <div className="h-64 rounded-[12px] bg-[#14141C] border border-[#2A2340]" />
          </div>
          <div className="h-48 rounded-[12px] bg-[#14141C] border border-[#2A2340]" />
        </div>
      )}

      {/* Empty State */}
      {!isAnalyzing && !result && (
        <div className="p-12 text-center rounded-[12px] border border-dashed border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE] bg-[#14141C]/40">
          <div className="w-12 h-12 rounded-[12px] bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#C4B5FD] flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-white dark:text-white light:text-[#0A0A0F]">
            Ready to Evaluate Sentiment
          </h4>
          <p className="mt-1 text-xs text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B] max-w-sm mx-auto">
            Input any sentence, product feedback, or review above and click "Analyze Sentiment" to compare VADER vs Hugging Face Transformer.
          </p>
        </div>
      )}

      {/* Populated Result View */}
      {!isAnalyzing && result && (
        <div className="space-y-6">
          {/* VADER vs Hugging Face Comparison Panel */}
          <VaderVsHfComparison
            vader={result.vader}
            huggingFace={result.huggingFace}
            comparison={result.comparison}
          />

          {/* Sentence-by-Sentence Breakdown */}
          {result.sentences.length > 1 && (
            <div className="p-5 rounded-[12px] border bg-[#14141C] border-[#2A2340] dark:bg-[#14141C] dark:border-[#2A2340] light:bg-[#F5F3FF] light:border-[#DDD6FE] shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE]">
                <div>
                  <h4 className="text-sm font-semibold text-white dark:text-white light:text-[#0A0A0F]">
                    Sentence Breakdown ({result.sentences.length} sentences)
                  </h4>
                  <p className="text-[11px] text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B]">
                    Click any sentence to inspect individual VADER compound and Hugging Face prediction
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {result.sentences.map((sent, sIdx) => {
                  const isSelected = selectedSentenceIdx === sIdx;
                  return (
                    <div
                      key={sIdx}
                      onClick={() => setSelectedSentenceIdx(isSelected ? null : sIdx)}
                      className={`p-3 rounded-[10px] border cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'bg-[#8B5CF6]/15 border-[#8B5CF6] shadow-sm'
                          : 'bg-[#0A0A0F]/50 border-[#2A2340] hover:border-[#8B5CF6]/50 dark:bg-[#0A0A0F]/50 dark:border-[#2A2340] light:bg-[#FFFFFF] light:border-[#DDD6FE]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <span className="text-white dark:text-white light:text-[#0A0A0F] leading-relaxed flex-1">
                          {sent.text}
                        </span>
                        <div className="flex items-center gap-2 font-mono shrink-0 self-start sm:self-auto">
                          <span className="text-[11px] px-1.5 py-0.5 rounded-[4px] bg-[#14141C] border border-[#2A2340] text-[#C4B5FD] dark:bg-[#14141C] light:bg-[#F5F3FF]">
                            VADER: {sent.vaderCompound > 0 ? `+${sent.vaderCompound.toFixed(2)}` : sent.vaderCompound.toFixed(2)}
                          </span>
                          <span className={`text-[11px] px-1.5 py-0.5 rounded-[4px] font-semibold ${
                            sent.hfLabel === 'positive'
                              ? 'text-[#22C55E] bg-[#22C55E]/10'
                              : sent.hfLabel === 'negative'
                              ? 'text-[#EF4444] bg-[#EF4444]/10'
                              : 'text-[#A1A1B5] bg-[#A1A1B5]/10'
                          }`}>
                            HF: {sent.hfLabel.toUpperCase()} ({(sent.hfConfidence * 100).toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Trend Line for Sentence Trajectory (in purple shades) */}
          {result.sentences.length > 1 && (
            <TrendLines
              data={result.sentences.map((s, idx) => ({
                index: idx,
                excerpt: s.text,
                vaderCompound: s.vaderCompound,
                hfPositiveScore: s.hfLabel === 'positive' ? s.hfConfidence : 0.15,
                hfNegativeScore: s.hfLabel === 'negative' ? s.hfConfidence : 0.15,
                label: s.vaderLabel,
                movingAvg: s.vaderCompound
              }))}
              title="Sentence-by-Sentence Sentiment Trajectory"
              subtitle="Progression curve through the text from start to finish in purple shades"
            />
          )}

          {/* Salient Keyword Distribution (in purple shades) */}
          <KeywordBars
            allKeywords={result.keywords}
            positiveKeywords={result.positiveKeywords}
            negativeKeywords={result.negativeKeywords}
            title="Extracted Salient Keywords & Phrases"
          />
        </div>
      )}
    </div>
  );
};
