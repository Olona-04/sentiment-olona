import React from 'react';
import { X, Zap, Cpu, BookOpen, Layers, CheckCircle2, ArrowRight } from 'lucide-react';

interface ModelInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelInfoModal: React.FC<ModelInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[12px] border bg-[#14141C] border-[#2A2340] dark:bg-[#14141C] dark:border-[#2A2340] light:bg-[#F5F3FF] light:border-[#DDD6FE] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#C4B5FD]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white dark:text-white light:text-[#0A0A0F]">
                Model Architecture: VADER vs Hugging Face
              </h3>
              <p className="text-xs text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B]">
                Algorithmic foundations, heuristics, and self-attention dynamics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[8px] text-[#A1A1B5] hover:text-white hover:bg-[#2A2340] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-6 text-xs text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#4B5563]">
          {/* Side by side comparison cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* VADER */}
            <div className="p-4 rounded-[10px] bg-[#0A0A0F]/60 dark:bg-[#0A0A0F]/60 light:bg-[#FFFFFF] border border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE]">
              <div className="flex items-center gap-2 mb-2 text-[#C4B5FD] font-semibold text-sm">
                <Zap className="w-4 h-4 text-[#8B5CF6]" />
                <span>VADER (Rule-Based Lexicon)</span>
              </div>
              <p className="leading-relaxed mb-3">
                Created by C.J. Hutto & Eric Gilbert (Georgia Tech, ICWSM 2014). Built specifically for social media, product reviews, and short informal microtexts.
              </p>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                  <span>Lexicon size: 7,500+ curated valences (-4 to +4)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                  <span>Compound formula: C = x / √(x² + 15)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                  <span>Speed: ~0.05ms per sentence (CPU instant)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                  <span>Rule heuristics: 5 grammatical modifiers</span>
                </div>
              </div>
            </div>

            {/* Hugging Face */}
            <div className="p-4 rounded-[10px] bg-[#0A0A0F]/60 dark:bg-[#0A0A0F]/60 light:bg-[#FFFFFF] border border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE]">
              <div className="flex items-center gap-2 mb-2 text-[#C4B5FD] font-semibold text-sm">
                <Cpu className="w-4 h-4 text-[#8B5CF6]" />
                <span>Hugging Face (Transformer)</span>
              </div>
              <p className="leading-relaxed mb-3">
                Based on CardiffNLP Twitter-RoBERTa-Base-Sentiment and DistilBERT fine-tuned on 124M+ tweets and SST-2 benchmark sentences.
              </p>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                  <span>Architecture: 12-layer Transformer encoder</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                  <span>Mechanism: Multi-head bidirectional self-attention</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                  <span>Output: Softmax probabilities [Pos, Neu, Neg]</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                  <span>Context: Sarcasm, irony, and concessive clauses</span>
                </div>
              </div>
            </div>
          </div>

          {/* VADER Heuristic Deep Dive */}
          <div>
            <h4 className="font-semibold text-white dark:text-white light:text-[#0A0A0F] mb-2 text-sm">
              The 5 VADER Linguistic Heuristics
            </h4>
            <div className="space-y-2">
              <div className="p-2.5 rounded-[8px] bg-[#0A0A0F]/40 border border-[#2A2340]">
                <strong className="text-white">1. Punctuation Booster:</strong> Exclamation marks amplify the valence intensity (e.g. "Great!" vs "Great!!!"). Each exclamation adds +0.291.
              </div>
              <div className="p-2.5 rounded-[8px] bg-[#0A0A0F]/40 border border-[#2A2340]">
                <strong className="text-white">2. Capitalization Booster:</strong> All-caps words ("AWESOME" vs "awesome") increase valence intensity by +0.733.
              </div>
              <div className="p-2.5 rounded-[8px] bg-[#0A0A0F]/40 border border-[#2A2340]">
                <strong className="text-white">3. Degree Modifiers:</strong> Booster words ("really", "extremely", "insanely") heighten sentiment; dampeners ("barely", "kinda") decrease it.
              </div>
              <div className="p-2.5 rounded-[8px] bg-[#0A0A0F]/40 border border-[#2A2340]">
                <strong className="text-white">4. 3-Token Look-Back Negation:</strong> Inverting words ("not good", "never recommended") flip and attenuate the base valence.
              </div>
              <div className="p-2.5 rounded-[8px] bg-[#0A0A0F]/40 border border-[#2A2340]">
                <strong className="text-white">5. Contrastive Conjunction ('but'):</strong> Text before "but" receives 0.5x weight, while text following "but" receives 1.5x weight.
              </div>
            </div>
          </div>

          {/* Why Models Diverge */}
          <div className="p-4 rounded-[10px] bg-[#8B5CF6]/10 border border-[#8B5CF6]/30">
            <h4 className="font-semibold text-[#C4B5FD] mb-2 text-sm">
              Why Do VADER and Hugging Face Diverge?
            </h4>
            <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
              <li>
                <strong className="text-white">Sarcastic & Ironic Tone:</strong> "Oh great, another bug!" contains the positive word "great". VADER scores this positive, while the Transformer self-attention spots the ironic context and classifies it as negative.
              </li>
              <li>
                <strong className="text-white">Idiomatic Expressions:</strong> Phrases like "killed it" or "dead on arrival" have literal words that confuse lexicon lookups, but transformer contextual embeddings interpret correctly.
              </li>
              <li>
                <strong className="text-white">Subtle Concession:</strong> "While the battery is mediocre, the screen is divine" — transformers balance overall semantic weight across the whole sentence vector.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-[8px] bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium text-xs transition-colors"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
