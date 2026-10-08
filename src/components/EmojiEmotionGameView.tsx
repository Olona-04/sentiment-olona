import React, { useState } from 'react';
import { Smile, Sparkles, Trophy, Flame, RotateCcw, ArrowRight, Heart, Brain, CheckCircle2, AlertCircle } from 'lucide-react';
import { analyzeVader } from '../utils/vaderEngine';
import { analyzeHuggingFace, compareModels } from '../utils/transformerEngine';
import { useAuth } from '../context/AuthContext';

// Emotion emoji choices for "How are you feeling?"
interface MoodOption {
  id: string;
  emoji: string;
  label: string;
  sublabel: string;
  expectedValence: number; // -1 to +1
  color: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { id: 'joyful', emoji: '😄', label: 'Joyful', sublabel: 'Happy & energized', expectedValence: 0.8, color: '#22C55E' },
  { id: 'calm', emoji: '😌', label: 'Calm', sublabel: 'Peaceful & centered', expectedValence: 0.4, color: '#38BDF8' },
  { id: 'hyped', emoji: '🚀', label: 'Inspired', sublabel: 'Creative & motivated', expectedValence: 0.9, color: '#8B5CF6' },
  { id: 'grateful', emoji: '🥰', label: 'Grateful', sublabel: 'Warm & appreciative', expectedValence: 0.85, color: '#EC4899' },
  { id: 'neutral', emoji: '😐', label: 'Neutral', sublabel: 'Balanced & steady', expectedValence: 0.0, color: '#A1A1B5' },
  { id: 'frustrated', emoji: '😤', label: 'Frustrated', sublabel: 'Blocked or annoyed', expectedValence: -0.6, color: '#F97316' },
  { id: 'sad', emoji: '😢', label: 'Down', sublabel: 'Low energy or upset', expectedValence: -0.7, color: '#6366F1' },
  { id: 'stressed', emoji: '😰', label: 'Stressed', sublabel: 'Overwhelmed or tense', expectedValence: -0.8, color: '#EF4444' },
];

// Emotion Guessing Game Questions
interface GameQuestion {
  id: number;
  text: string;
  context: string;
  options: { emoji: string; label: string; isCorrect: boolean }[];
  explanation: string;
  aiBreakdown: string;
}

const GAME_QUESTIONS: GameQuestion[] = [
  {
    id: 1,
    text: "Oh wonderful, another mandatory software update that broke my audio drivers. Just what I needed on a Monday morning!",
    context: "Product Review / Tech Forum",
    options: [
      { emoji: '🤩', label: 'Thrilled & Excited', isCorrect: false },
      { emoji: '🙄', label: 'Sarcastic & Annoyed', isCorrect: true },
      { emoji: '😌', label: 'Calm & Relaxed', isCorrect: false },
      { emoji: '😴', label: 'Sleepy & Bored', isCorrect: false },
    ],
    explanation: "Classic sarcasm! The words 'wonderful' and 'needed' mask bitter frustration.",
    aiBreakdown: "VADER saw 'wonderful' (+3.2) and scored Positive (+0.61), while Hugging Face Transformer correctly recognized the sarcastic syntax and flagged Negative (94% confidence)!"
  },
  {
    id: 2,
    text: "Killed it on stage tonight! The crowd went crazy during the final guitar solo 🔥🎸",
    context: "Social Media Post",
    options: [
      { emoji: '😱', label: 'Horrified / Violent', isCorrect: false },
      { emoji: '🚀', label: 'Triumphant & Hyped', isCorrect: true },
      { emoji: '😐', label: 'Neutral & Factual', isCorrect: false },
      { emoji: '😢', label: 'Sad & Defeated', isCorrect: false },
    ],
    explanation: "'Killed it' is positive slang for outstanding success.",
    aiBreakdown: "Both engines correctly picked up the high energy (+0.88 compound, 98% positive probability)!"
  },
  {
    id: 3,
    text: "While the battery life is admittedly mediocre, the screen clarity and haptic feedback make this an absolute joy to use.",
    context: "Smartphone Review",
    options: [
      { emoji: '🥰', label: 'Satisfied Delight', isCorrect: true },
      { emoji: '😡', label: 'Pure Outrage', isCorrect: false },
      { emoji: '😴', label: 'Uninterested', isCorrect: false },
      { emoji: '😱', label: 'Terrified', isCorrect: false },
    ],
    explanation: "Concessive praise: acknowledging minor flaws while delivering an overwhelmingly positive conclusion.",
    aiBreakdown: "Hugging Face resolved the subordinate clause and weighted the final praise 'joy to use' (+0.82)."
  },
  {
    id: 4,
    text: "I spent three hours on hold only for the representative to disconnect the call without saying a single word.",
    context: "Customer Support Grievance",
    options: [
      { emoji: '🤬', label: 'Livid & Frustrated', isCorrect: true },
      { emoji: '😂', label: 'Amused & Laughing', isCorrect: false },
      { emoji: '🤔', label: 'Curious & Inquisitive', isCorrect: false },
      { emoji: '🥳', label: 'Celebratory', isCorrect: false },
    ],
    explanation: "Extreme friction and abandonment by customer service.",
    aiBreakdown: "Both VADER (-0.72) and Transformer (99% negative) flagged severe discontent."
  },
  {
    id: 5,
    text: "The box contains one AC adapter, a 1.5-meter USB-C braided cable, and the quick start guide.",
    context: "Unboxing Description",
    options: [
      { emoji: '😐', label: 'Neutral / Informational', isCorrect: true },
      { emoji: '😭', label: 'Heartbroken', isCorrect: false },
      { emoji: '🤩', label: 'Ecstatic', isCorrect: false },
      { emoji: '😤', label: 'Angry', isCorrect: false },
    ],
    explanation: "Zero subjective or emotional modifiers—pure objective inventory.",
    aiBreakdown: "Neutral compound: 0.00. 94% neutral probability."
  }
];

export const EmojiEmotionGameView: React.FC = () => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'mood' | 'game'>('mood');

  // Mood Tracker State
  const [selectedMood, setSelectedMood] = useState<MoodOption>(MOOD_OPTIONS[0]);
  const [moodJournalText, setMoodJournalText] = useState<string>('');
  const [moodHistory, setMoodHistory] = useState<
    { id: string; emoji: string; label: string; text: string; alignment: number; time: string }[]
  >([]);

  // Emotion Game State
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [gameFinished, setGameFinished] = useState<boolean>(false);

  // Compute live sentiment of mood journal text
  const currentJournalVader = moodJournalText.trim() ? analyzeVader(moodJournalText) : null;
  const currentJournalHf = moodJournalText.trim() ? analyzeHuggingFace(moodJournalText) : null;

  // Calculate alignment between selected emoji and typed words
  let alignmentScore = 100;
  if (currentJournalVader) {
    const diff = Math.abs(selectedMood.expectedValence - currentJournalVader.compound);
    alignmentScore = Math.max(10, Math.round(100 - diff * 45));
  }

  const handleSaveMood = () => {
    if (!moodJournalText.trim()) return;
    const newEntry = {
      id: `m_${Date.now()}`,
      emoji: selectedMood.emoji,
      label: selectedMood.label,
      text: moodJournalText.trim(),
      alignment: alignmentScore,
      time: 'Just now'
    };
    setMoodHistory([newEntry, ...moodHistory]);
    setMoodJournalText('');
  };

  // Game Logic
  const currentQ = GAME_QUESTIONS[currentQIndex];

  const handleSelectOption = (idx: number) => {
    if (showAnswer) return;
    setSelectedOptionIdx(idx);
    setShowAnswer(true);

    const isCorrect = currentQ.options[idx].isCorrect;
    if (isCorrect) {
      setScore(prev => prev + 100 + streak * 20);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOptionIdx(null);
    setShowAnswer(false);
    if (currentQIndex < GAME_QUESTIONS.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      setGameFinished(true);
    }
  };

  const handleRestartGame = () => {
    setCurrentQIndex(0);
    setSelectedOptionIdx(null);
    setShowAnswer(false);
    setScore(0);
    setStreak(0);
    setGameFinished(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Selector Banner */}
      <div className="p-5 rounded-[14px] border bg-[#14141C] border-[#2A2340] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎭</span>
            <h2 className="text-lg font-bold text-white">
              Emoji Moods & Emotion Game
            </h2>
          </div>
          <p className="text-xs text-[#A1A1B5] mt-0.5">
            Check in with your personal feelings today or challenge your emotional intuition against AI
          </p>
        </div>

        {/* Sub-tab toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-[10px] bg-[#0A0A0F] border border-[#2A2340] self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('mood')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all ${
              activeSubTab === 'mood'
                ? 'bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/30'
                : 'text-[#A1A1B5] hover:text-white'
            }`}
          >
            <span>✨ How Are You Feeling?</span>
          </button>
          <button
            onClick={() => setActiveSubTab('game')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all ${
              activeSubTab === 'game'
                ? 'bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/30'
                : 'text-[#A1A1B5] hover:text-white'
            }`}
          >
            <span>🎮 Emoji Emotion Game</span>
          </button>
        </div>
      </div>

      {/* MODE 1: HOW ARE YOU FEELING TODAY? */}
      {activeSubTab === 'mood' && (
        <div className="space-y-6">
          {/* Emoji Selection Grid */}
          <div className="p-5 rounded-[14px] border bg-[#14141C] border-[#2A2340]">
            <h3 className="text-sm font-semibold text-white mb-1">
              Select Your Current Emotion:
            </h3>
            <p className="text-xs text-[#A1A1B5] mb-4">
              Click an emoji to set your emotional state, {user?.name.split(' ')[0] || 'Olona'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {MOOD_OPTIONS.map((mood) => {
                const isSelected = selectedMood.id === mood.id;
                return (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood)}
                    className={`p-3.5 rounded-[12px] border text-left transition-all duration-150 cursor-pointer flex flex-col items-center justify-center text-center ${
                      isSelected
                        ? 'bg-[#8B5CF6]/25 border-[#8B5CF6] ring-2 ring-[#8B5CF6]/30 shadow-lg shadow-[#8B5CF6]/20'
                        : 'bg-[#0A0A0F]/60 border-[#2A2340] hover:border-[#8B5CF6]/50 hover:bg-[#14141C]'
                    }`}
                  >
                    <span className="text-3xl mb-1.5 transform hover:scale-110 transition-transform">
                      {mood.emoji}
                    </span>
                    <span className="text-xs font-bold text-white block">
                      {mood.label}
                    </span>
                    <span className="text-[10px] text-[#A1A1B5] block truncate max-w-[110px]">
                      {mood.sublabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Journal Input & Real-time AI Sentiment Mirror */}
          <div className="p-5 rounded-[14px] border bg-[#14141C] border-[#2A2340]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedMood.emoji}</span>
                <h4 className="text-sm font-semibold text-white">
                  Why are you feeling {selectedMood.label.toLowerCase()} today?
                </h4>
              </div>
              <span className="text-xs font-mono text-[#C4B5FD] px-2 py-0.5 rounded-[6px] bg-[#8B5CF6]/15 border border-[#8B5CF6]/30">
                Target Valence: {selectedMood.expectedValence > 0 ? `+${selectedMood.expectedValence}` : selectedMood.expectedValence}
              </span>
            </div>

            <textarea
              value={moodJournalText}
              onChange={(e) => setMoodJournalText(e.target.value)}
              placeholder={`Share what's on your mind... (e.g. "Just finished an intense sprint and feeling proud of our progress!")`}
              rows={3}
              className="w-full p-3.5 rounded-[12px] bg-[#0A0A0F] border border-[#2A2340] text-white text-xs sm:text-sm leading-relaxed purple-input-glow resize-y placeholder-[#A1A1B5]/50"
            />

            {/* Live AI Alignment Bar */}
            {moodJournalText.trim() && currentJournalVader && (
              <div className="mt-3 p-3 rounded-[10px] bg-[#0A0A0F]/80 border border-[#8B5CF6]/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#A1A1B5]">
                    AI Emotional Alignment (Selected Mood vs Written Words):
                  </span>
                  <span className="font-mono font-bold text-[#C4B5FD]">
                    {alignmentScore}% Match
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-[#1F192E] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#22C55E] transition-all duration-300"
                    style={{ width: `${alignmentScore}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#A1A1B5] font-mono pt-1">
                  <span>VADER Score: {currentJournalVader.compound > 0 ? `+${currentJournalVader.compound.toFixed(2)}` : currentJournalVader.compound.toFixed(2)}</span>
                  <span>HF: {currentJournalHf?.label.toUpperCase()} ({(currentJournalHf ? currentJournalHf.confidence * 100 : 0).toFixed(0)}%)</span>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSaveMood}
                disabled={!moodJournalText.trim()}
                className="flex items-center gap-1.5 px-5 py-2 rounded-[10px] text-xs font-semibold text-white bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] shadow-md shadow-[#8B5CF6]/30 transition-all disabled:opacity-40 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Save to Daily Mood Log</span>
              </button>
            </div>
          </div>

          {/* Mood Log History */}
          {moodHistory.length > 0 && (
            <div className="p-5 rounded-[14px] border bg-[#14141C] border-[#2A2340]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C4B5FD] mb-3">
                Recent Mood Logs
              </h4>
              <div className="space-y-2.5">
                {moodHistory.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-[10px] bg-[#0A0A0F]/60 border border-[#2A2340] flex items-start gap-3"
                  >
                    <span className="text-2xl shrink-0 mt-0.5">{m.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-white">{m.label}</span>
                        <span className="text-[10px] text-[#C4B5FD] font-mono">{m.alignment}% AI Alignment</span>
                      </div>
                      <p className="text-xs text-[#A1A1B5] leading-relaxed break-words">
                        "{m.text}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: EMOJI EMOTION GUESSING GAME */}
      {activeSubTab === 'game' && (
        <div className="p-6 rounded-[14px] border bg-[#14141C] border-[#2A2340]">
          {!gameFinished ? (
            <div className="space-y-5">
              {/* Game Status Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#2A2340]">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#8B5CF6]/20 text-[#C4B5FD]">
                    Round {currentQIndex + 1} of {GAME_QUESTIONS.length}
                  </span>
                  <span className="text-xs text-[#A1A1B5]">{currentQ.context}</span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1 text-[#22C55E]">
                    <Trophy className="w-4 h-4" />
                    <span>{score} pts</span>
                  </div>
                  {streak > 1 && (
                    <div className="flex items-center gap-1 text-[#F97316]">
                      <Flame className="w-4 h-4" />
                      <span>{streak}x Streak!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="p-4 rounded-[12px] bg-[#0A0A0F] border border-[#2A2340]">
                <span className="text-[11px] text-[#A1A1B5] block mb-1">Can you detect the underlying emotion in this comment?</span>
                <p className="text-sm sm:text-base font-medium text-white leading-relaxed">
                  "{currentQ.text}"
                </p>
              </div>

              {/* Emoji Options to choose */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = selectedOptionIdx === oIdx;
                  let btnColor = 'bg-[#0A0A0F]/60 border-[#2A2340] hover:border-[#8B5CF6]';

                  if (showAnswer) {
                    if (opt.isCorrect) {
                      btnColor = 'bg-[#22C55E]/20 border-[#22C55E] text-white';
                    } else if (isSelected) {
                      btnColor = 'bg-[#EF4444]/20 border-[#EF4444] text-white';
                    } else {
                      btnColor = 'bg-[#0A0A0F]/30 border-[#2A2340]/40 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={showAnswer}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`p-3.5 rounded-[12px] border text-left flex items-center gap-3 transition-all cursor-pointer ${btnColor}`}
                    >
                      <span className="text-2xl shrink-0">{opt.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold block text-white">
                          {opt.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Answer Explanation & AI Breakdown */}
              {showAnswer && (
                <div className="p-4 rounded-[12px] bg-[#0A0A0F]/90 border border-[#8B5CF6]/40 space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2">
                    {currentQ.options[selectedOptionIdx!].isCorrect ? (
                      <span className="text-xs font-bold text-[#22C55E] flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Correct Intuition! (+100 pts)
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-[#EF4444] flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> Tricked by the phrasing!
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-white leading-relaxed">
                    {currentQ.explanation}
                  </p>

                  <div className="mt-2 pt-2 border-t border-[#2A2340] text-[11px] text-[#C4B5FD] flex items-start gap-1.5 font-mono">
                    <Brain className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#8B5CF6]" />
                    <span>AI Breakdown: {currentQ.aiBreakdown}</span>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      className="flex items-center gap-1 px-4 py-2 rounded-[8px] bg-[#8B5CF6] hover:bg-[#7C3AED] text-xs font-semibold text-white transition-colors cursor-pointer"
                    >
                      <span>{currentQIndex < GAME_QUESTIONS.length - 1 ? 'Next Challenge' : 'See Results'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Game Finished Summary */
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/50 flex items-center justify-center text-3xl mx-auto">
                🏆
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  Emotion Game Completed!
                </h3>
                <p className="text-xs text-[#A1A1B5] mt-1">
                  Final Score: <span className="font-mono text-white font-bold text-sm">{score} points</span>
                </p>
              </div>

              <p className="text-xs text-[#C4B5FD] max-w-md mx-auto">
                {score >= 400
                  ? "Outstanding! You have exceptional emotional IQ and can spot sarcasm that confuses rule-based engines."
                  : "Great effort! Sarcastic and concessive statements are notoriously tricky for both humans and AI models."}
              </p>

              <div className="pt-2">
                <button
                  onClick={handleRestartGame}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[10px] bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white text-xs font-semibold shadow-lg shadow-[#8B5CF6]/30 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
