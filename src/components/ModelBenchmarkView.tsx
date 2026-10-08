import React, { useState } from 'react';
import { BookOpen, Sparkles, Zap, Cpu, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { analyzeVader } from '../utils/vaderEngine';
import { analyzeHuggingFace, compareModels } from '../utils/transformerEngine';
import { VaderVsHfComparison } from './VaderVsHfComparison';

interface BenchmarkCase {
  id: string;
  category: string;
  input: string;
  expectedWinner: 'Hugging Face' | 'VADER' | 'Both Agree';
  phenomenon: string;
}

const BENCHMARK_CASES: BenchmarkCase[] = [
  {
    id: 'b1',
    category: 'Sarcasm / Irony',
    input: 'Oh wonderful, another mandatory update that broke my audio drivers. Just what I wanted on a Monday morning!',
    expectedWinner: 'Hugging Face',
    phenomenon: 'Lexical positive tokens ("wonderful", "wanted") conflict with sarcastic syntactic framing.'
  },
  {
    id: 'b2',
    category: 'Social Slang / Emojis',
    input: 'The new camera update slaps so hard 🔥🔥 literally the goat 🐐 no cap!',
    expectedWinner: 'Both Agree',
    phenomenon: 'VADER social media lexicon handles emojis and slang words ("slaps", "goat", "🔥").'
  },
  {
    id: 'b3',
    category: 'Concessive Contrast',
    input: 'While the battery life is admittedly mediocre, the display fidelity, haptics, and build quality make this device an absolute joy to use.',
    expectedWinner: 'Hugging Face',
    phenomenon: 'Concession clause subordinated to dominant positive clause.'
  },
  {
    id: 'b4',
    category: 'Negation Look-Back',
    input: 'The customer service representative was not rude at all, and the problem was not left unresolved.',
    expectedWinner: 'Both Agree',
    phenomenon: 'Double negation and modified negative adjectives.'
  },
  {
    id: 'b5',
    category: 'Idiomatic Praise',
    input: 'The live performance killed it tonight! Completely out of this world.',
    expectedWinner: 'Hugging Face',
    phenomenon: 'Idiomatic praise where literal dictionary definitions have negative valence ("killed").'
  },
  {
    id: 'b6',
    category: 'Capitalization & Punctuation',
    input: 'WORST CUSTOMER SERVICE EVER!!!!! I AM NEVER RETURNING TO THIS STORE!!!!!',
    expectedWinner: 'VADER',
    phenomenon: 'VADER heuristics explicitly amplify exclamation marks (+0.87) and all-caps (+0.73).'
  },
  {
    id: 'b7',
    category: 'Contrastive "But"',
    input: 'The packaging was sleek and arrived quickly, but the actual gadget stopped charging on day three.',
    expectedWinner: 'Both Agree',
    phenomenon: 'Clause after "but" carries 1.5x weight in VADER, overriding the initial praise.'
  },
  {
    id: 'b8',
    category: 'Informational Neutrality',
    input: 'The product dimensions are 14.2 inches by 9.8 inches and it weighs 3.2 pounds in the retail carton.',
    expectedWinner: 'Both Agree',
    phenomenon: 'Zero emotional tokens correctly yielding neutral valence in both engines.'
  }
];

export const ModelBenchmarkView: React.FC = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(BENCHMARK_CASES[0].id);

  const selectedCase = BENCHMARK_CASES.find(b => b.id === selectedCaseId) || BENCHMARK_CASES[0];
  const vader = analyzeVader(selectedCase.input);
  const hf = analyzeHuggingFace(selectedCase.input);
  const comparison = compareModels(vader, hf, selectedCase.input);

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-[12px] border bg-[#14141C] border-[#2A2340] dark:bg-[#14141C] dark:border-[#2A2340] light:bg-[#F5F3FF] light:border-[#DDD6FE]">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-[#C4B5FD]" />
          <h3 className="text-base font-semibold text-white dark:text-white light:text-[#0A0A0F]">
            VADER vs Hugging Face Benchmark Testbed
          </h3>
        </div>
        <p className="text-xs text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B]">
          Explore classic NLP linguistic edge cases to observe where rule-based lexicons excel and where deep Transformer self-attention is essential.
        </p>

        {/* Test Case Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          {BENCHMARK_CASES.map((bc) => (
            <button
              key={bc.id}
              onClick={() => setSelectedCaseId(bc.id)}
              className={`p-2.5 rounded-[10px] text-left border transition-all ${
                selectedCaseId === bc.id
                  ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white shadow-sm'
                  : 'bg-[#0A0A0F]/50 border-[#2A2340] text-[#A1A1B5] hover:border-[#8B5CF6]/50 hover:text-white dark:bg-[#0A0A0F]/50 dark:border-[#2A2340] light:bg-[#FFFFFF] light:border-[#DDD6FE]'
              }`}
            >
              <span className="text-[10px] font-semibold tracking-wider uppercase text-[#C4B5FD] block truncate">
                {bc.category}
              </span>
              <span className="text-xs font-medium text-white dark:text-white light:text-[#0A0A0F] line-clamp-1 mt-0.5">
                {bc.input}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Benchmark Detail */}
      <div className="p-5 rounded-[12px] border bg-[#14141C] border-[#2A2340] dark:bg-[#14141C] dark:border-[#2A2340] light:bg-[#F5F3FF] light:border-[#DDD6FE] space-y-4">
        <div className="p-4 rounded-[10px] bg-[#0A0A0F]/60 dark:bg-[#0A0A0F]/60 light:bg-[#FFFFFF] border border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE]">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[#C4B5FD] font-semibold">Test Sentence:</span>
            <span className="px-2 py-0.5 rounded-[4px] bg-[#8B5CF6]/20 text-[#C4B5FD] font-mono text-[11px]">
              Phenomenon: {selectedCase.category}
            </span>
          </div>
          <p className="text-sm font-medium text-white dark:text-white light:text-[#0A0A0F] leading-relaxed">
            "{selectedCase.input}"
          </p>
          <p className="text-xs text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B] mt-2 pt-2 border-t border-[#2A2340]">
            💡 <strong className="text-white dark:text-white light:text-[#0A0A0F]">Linguistic Challenge:</strong> {selectedCase.phenomenon}
          </p>
        </div>

        {/* Side-by-Side Evaluation */}
        <VaderVsHfComparison
          vader={vader}
          huggingFace={hf}
          comparison={comparison}
        />
      </div>
    </div>
  );
};
