import React, { useState } from 'react';
import { MessageSquare, Upload, Sparkles, AlertCircle, RotateCcw, CheckCircle2, Cpu, Zap, Activity } from 'lucide-react';
import { SentimentOverviewChart, OverviewPoint } from './SentimentOverviewChart';
import { VaderHfGauges } from './VaderHfGauges';
import { RecentCommentsTable, RecentCommentItem, SAMPLE_REVIEWS_PRESET } from './RecentCommentsTable';
import { RightColumnCards } from './RightColumnCards';
import { analyzeVader } from '../utils/vaderEngine';
import { analyzeHuggingFace, compareModels } from '../utils/transformerEngine';
import { extractKeywords } from '../utils/keywordExtractor';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface HomeDashboardViewProps {
  onNavigateToAnalyze: () => void;
  onNavigateToChat: (initialQuery?: string) => void;
  onOpenEmojiGame?: () => void;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  onNavigateToAnalyze,
  onNavigateToChat,
  onOpenEmojiGame
}) => {
  const { greetingText } = useAuth();
  const { theme } = useTheme();
  const [commentInput, setCommentInput] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);
  const [recentComments, setRecentComments] = useState<RecentCommentItem[]>([]);
  
  // Real-time metrics (starts empty)
  const [isEmpty, setIsEmpty] = useState<boolean>(true);
  const [vaderScore, setVaderScore] = useState<number>(0);
  const [hfScore, setHfScore] = useState<number>(0);
  const [vaderLabel, setVaderLabel] = useState<string>('Awaiting Input');
  const [hfLabel, setHfLabel] = useState<string>('Awaiting Input');
  const [comparisonNote, setComparisonNote] = useState<string>(
    'Enter comments above to run dual VADER and Hugging Face analysis.'
  );

  // Summary percentages
  const [positivePercent, setPositivePercent] = useState<number>(0);
  const [neutralPercent, setNeutralPercent] = useState<number>(0);
  const [negativePercent, setNegativePercent] = useState<number>(0);
  const [topKeywords, setTopKeywords] = useState<{ text: string; count: number; barPercent: number }[]>([]);
  const [overviewData, setOverviewData] = useState<OverviewPoint[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Core analysis runner
  const runAnalysisOnText = (rawInputText: string) => {
    const rawLines = rawInputText
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 2);

    if (rawLines.length === 0) {
      setErrorMessage('Please enter at least one valid comment or review.');
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);
    setAnalysisStep(1);

    // Step 1: Tokenizing
    setTimeout(() => {
      setAnalysisStep(2); // VADER heuristics
    }, 200);

    // Step 2: Transformer self-attention
    setTimeout(() => {
      setAnalysisStep(3); // Model inference
    }, 450);

    setTimeout(() => {
      try {
        const newComments: RecentCommentItem[] = [];
        let posCount = 0;
        let neuCount = 0;
        let negCount = 0;
        let sumVader = 0;
        let sumHf = 0;

        rawLines.forEach((line, idx) => {
          const v = analyzeVader(line);
          const h = analyzeHuggingFace(line);
          
          if (v.label === 'positive') posCount++;
          else if (v.label === 'negative') negCount++;
          else neuCount++;

          sumVader += Math.abs(v.compound);
          sumHf += h.confidence;

          newComments.push({
            id: `rc_${Date.now()}_${idx}`,
            comment: line,
            sentiment: (v.label.charAt(0).toUpperCase() + v.label.slice(1)) as any,
            score: v.compound,
            date: 'Just now'
          });
        });

        const total = rawLines.length;
        const posPct = Math.round((posCount / total) * 100);
        const neuPct = Math.round((neuCount / total) * 100);
        const negPct = Math.round((negCount / total) * 100);

        setPositivePercent(posPct);
        setNeutralPercent(neuPct);
        setNegativePercent(negPct);

        const avgVader = sumVader / total;
        const avgHf = sumHf / total;
        setVaderScore(avgVader);
        setHfScore(avgHf);

        const domLabel = posPct >= 50 ? 'Positive' : negPct >= 50 ? 'Negative' : 'Neutral';
        setVaderLabel(domLabel);
        setHfLabel(domLabel);

        const lastC = compareModels(analyzeVader(rawLines[0]), analyzeHuggingFace(rawLines[0]), rawLines[0]);
        setComparisonNote(lastC.discrepancyNote);

        // Extract keywords
        const kw = extractKeywords(rawLines, 5);
        setTopKeywords(
          kw.all.map(k => ({
            text: k.text,
            count: k.count,
            barPercent: k.salience
          }))
        );

        // Generate overview sequence points
        const points: OverviewPoint[] = newComments.map((c, i) => {
          const isPos = c.sentiment === 'Positive';
          const isNeg = c.sentiment === 'Negative';
          return {
            label: `Item #${i + 1}`,
            positive: isPos ? 80 : 20,
            neutral: c.sentiment === 'Neutral' ? 70 : 20,
            negative: isNeg ? 80 : 10
          };
        });
        setOverviewData(points);

        setRecentComments(newComments);
        setIsEmpty(false);
        setCommentInput('');
      } catch (err: any) {
        setErrorMessage(err?.message || 'Error evaluating sentiment');
      } finally {
        setIsAnalyzing(false);
        setAnalysisStep(0);
      }
    }, 700);
  };

  const handleAnalyzeClick = () => {
    runAnalysisOnText(commentInput);
  };

  const handleLoadSamples = () => {
    const joined = SAMPLE_REVIEWS_PRESET.map(s => s.comment).join('\n');
    runAnalysisOnText(joined);
  };

  const handleResetToEmpty = () => {
    setIsEmpty(true);
    setRecentComments([]);
    setOverviewData([]);
    setTopKeywords([]);
    setPositivePercent(0);
    setNeutralPercent(0);
    setNegativePercent(0);
    setVaderScore(0);
    setHfScore(0);
    setVaderLabel('Awaiting Input');
    setHfLabel('Awaiting Input');
    setComparisonNote('Enter comments above to run dual VADER and Hugging Face analysis.');
    setCommentInput('');
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6">
      {/* Greeting Banner matching screenshot (connected to dynamic login) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${
            theme === 'dark' ? 'text-white' : 'text-[#000000]'
          }`}>
            {greetingText}
          </h1>
          <p className={`text-xs mt-1 font-medium ${
            theme === 'dark' ? 'text-[#A1A1B5]' : 'text-[#1F2937]'
          }`}>
            Enter your comments below and let AI analyze the sentiment for you.
          </p>
        </div>

        {/* Reset / Sample Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {!isEmpty && (
            <button
              onClick={handleResetToEmpty}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border text-xs font-semibold transition-colors cursor-pointer shadow-sm ${
                theme === 'dark'
                  ? 'bg-[#14141C] border-[#2A2340] text-[#A1A1B5] hover:text-white'
                  : 'bg-[#FFFFFF] border-[#8B5CF6]/40 text-[#000000] hover:bg-[#F3E8FF]'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Empty</span>
            </button>
          )}

          {isEmpty && (
            <button
              onClick={handleLoadSamples}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border text-xs font-semibold transition-colors cursor-pointer shadow-sm ${
                theme === 'dark'
                  ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/40 text-[#C4B5FD] hover:bg-[#8B5CF6]/30'
                  : 'bg-[#FFFFFF] border-[#8B5CF6]/40 text-[#000000] hover:bg-[#F3E8FF]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>Try 5 Sample Comments</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left 2 Columns Content + Right 1 Column Sidebar Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left & Center Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* "Add your comments" Input Card matching screenshot */}
          <div className={`p-5 rounded-[14px] border shadow-sm ${
            theme === 'dark'
              ? 'bg-[#14141C] border-[#2A2340]'
              : 'bg-[#FFFFFF] border-[#8B5CF6]/30'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#8B5CF6]" />
                <h3 className={`text-sm font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-[#000000]'
                }`}>
                  Add your comments
                </h3>
              </div>
              <span className={`text-[11px] font-medium ${
                theme === 'dark' ? 'text-[#A1A1B5]' : 'text-[#1F2937]'
              }`}>
                {isEmpty ? '⚡ Graphs & metrics will generate once you analyze' : '🟢 Real-time metrics live'}
              </span>
            </div>

            {/* Glowing input textarea */}
            <div className="relative">
              <textarea
                value={commentInput}
                onChange={(e) => {
                  setCommentInput(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                maxLength={10000}
                placeholder="Paste your comments here... (e.g. product reviews, social media posts, customer feedback). You can paste one or multiple lines."
                rows={4}
                className={`w-full p-4 rounded-[12px] border text-xs sm:text-sm leading-relaxed resize-y transition-all purple-input-glow font-medium ${
                  theme === 'dark'
                    ? 'bg-[#0A0A0F] border-[#8B5CF6]/40 text-white placeholder-[#A1A1B5]/50'
                    : 'bg-[#FFFFFF] border-[#8B5CF6]/40 text-[#000000] placeholder-[#6B7280]'
                }`}
              />
            </div>

            {/* Input Footer: 0/10,000 + Upload file (optional) + Analyze Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-3 pt-2">
              <div className={`flex items-center gap-4 text-xs font-medium ${
                theme === 'dark' ? 'text-[#A1A1B5]' : 'text-[#1F2937]'
              }`}>
                <span className="font-mono">{commentInput.length.toLocaleString()} / 10,000</span>

                <label className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                  theme === 'dark' ? 'hover:text-[#C4B5FD]' : 'hover:text-[#7C3AED]'
                }`}>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload file (optional)</span>
                  <input
                    type="file"
                    accept=".txt,.csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const content = ev.target?.result as string;
                        if (content) setCommentInput(content.slice(0, 10000));
                      };
                      reader.readAsText(file);
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                onClick={handleAnalyzeClick}
                disabled={isAnalyzing}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-[12px] font-bold text-xs text-white bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] shadow-lg shadow-[#8B5CF6]/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze</span>
                  </>
                )}
              </button>
            </div>

            {errorMessage && (
              <div className="mt-3 p-2.5 rounded-[8px] bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* DYNAMIC PIPELINE CARD */}
          {isAnalyzing && (
            <div className="p-4 rounded-[14px] border border-[#8B5CF6]/50 bg-[#14141C] dark:bg-[#14141C] light:bg-[#FFFFFF] shadow-lg space-y-3 animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C4B5FD] dark:text-[#C4B5FD] light:text-[#7C3AED] animate-spin" />
                  <span className="font-semibold text-white dark:text-white light:text-[#000000]">
                    {analysisStep === 1 && 'Tokenizing text & syntactic boundaries...'}
                    {analysisStep === 2 && 'Executing VADER valence & grammatical heuristics...'}
                    {analysisStep === 3 && 'Running CardiffNLP RoBERTa contextual transformer inference...'}
                  </span>
                </div>
                <span className="font-mono text-[#C4B5FD] dark:text-[#C4B5FD] light:text-[#7C3AED]">
                  Step {analysisStep} / 3
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-[#1F192E] dark:bg-[#1F192E] light:bg-[#E9D5FF] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#C4B5FD] transition-all duration-300"
                  style={{ width: `${(analysisStep / 3) * 100}%` }}
                />
              </div>

              {/* 4 Skeleton preview blocks while analyzing */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="p-3 rounded-[10px] bg-[#0A0A0F]/60 dark:bg-[#0A0A0F]/60 light:bg-[#F5F3FF] border border-[#2A2340]/60 dark:border-[#2A2340]/60 light:border-[#8B5CF6]/20 flex items-center gap-2.5 animate-pulse"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#2A2340] dark:bg-[#2A2340] light:bg-[#DDD6FE] shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2 rounded bg-[#2A2340] dark:bg-[#2A2340] light:bg-[#DDD6FE] w-full" />
                      <div className="h-2 rounded bg-[#2A2340] dark:bg-[#2A2340] light:bg-[#DDD6FE] w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Middle Row Grid: Sentiment Overview Pie Chart + VADER vs Hugging Face */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SentimentOverviewChart
              isEmpty={isEmpty}
              positivePercent={positivePercent}
              neutralPercent={neutralPercent}
              negativePercent={negativePercent}
              dataPoints={overviewData}
            />
            <VaderHfGauges
              isEmpty={isEmpty}
              vaderScore={vaderScore}
              hfScore={hfScore}
              vaderLabel={vaderLabel}
              hfLabel={hfLabel}
              comparisonNote={comparisonNote}
            />
          </div>

          {/* Recent Comments Table */}
          <RecentCommentsTable
            comments={recentComments}
            onSelectComment={(text) => setCommentInput(text)}
            onViewAll={onNavigateToAnalyze}
            onLoadSamples={handleLoadSamples}
          />
        </div>

        {/* Right Column Cards */}
        <div className="lg:col-span-1">
          <RightColumnCards
            isEmpty={isEmpty}
            positivePercent={positivePercent}
            neutralPercent={neutralPercent}
            negativePercent={negativePercent}
            topKeywords={topKeywords}
            onSelectRecentAnalysis={(title) => {
              onNavigateToChat(`Analyze comments about: "${title}"`);
            }}
            onOpenEmojiGame={onOpenEmojiGame}
          />
        </div>
      </div>
    </div>
  );
};
