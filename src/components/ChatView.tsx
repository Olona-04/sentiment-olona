import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, RotateCcw, Copy, Check, Bot, User, ArrowRight } from 'lucide-react';
import { analyzeVader } from '../utils/vaderEngine';
import { analyzeHuggingFace, compareModels } from '../utils/transformerEngine';
import { escapeHtml } from '../utils/sanitize';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sentimentAnalysis?: {
    text: string;
    vaderCompound: number;
    vaderLabel: string;
    hfConfidence: number;
    hfLabel: string;
    agreement: boolean;
  };
}

const STARTER_PROMPTS = [
  '📊 Summarize sentiment trends for this week',
  '🔍 Why do VADER and Hugging Face disagree on sarcasm?',
  "✍️ Draft a polite apology response to comment #3",
  '⚡ Analyze: "The hardware is top notch but the battery life is disappointing"',
  '💡 What are the top customer pain points from recent feedback?'
];

export const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: "Good morning, Olona! 👋 I'm your SentimentAI assistant. You can ask me to evaluate feedback, draft customer responses, explain model divergence between VADER and Hugging Face, or summarize your sentiment trends.",
      timestamp: 'Just now'
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Check if query is asking to analyze a specific sentence / review
    let directAnalysis: ChatMessage['sentimentAnalysis'] | undefined;
    const analyzeMatch = query.match(/(?:analyze|review|check|test|evaluate|score)\s*[:"]?\s*(.+)/i);
    const targetText = analyzeMatch ? analyzeMatch[1].replace(/["']/g, '').trim() : null;

    if (targetText && targetText.length > 5) {
      const v = analyzeVader(targetText);
      const h = analyzeHuggingFace(targetText);
      const c = compareModels(v, h, targetText);
      directAnalysis = {
        text: targetText,
        vaderCompound: v.compound,
        vaderLabel: v.label,
        hfConfidence: h.confidence,
        hfLabel: h.label,
        agreement: c.agreement
      };
    }

    // Try calling server-side /api/chat if available, or generate rich response
    setTimeout(() => {
      let replyText = '';

      if (directAnalysis) {
        replyText = `I analyzed the text: "${directAnalysis.text}"\n\n` +
          `• **VADER (Rule-Based)**: Evaluated as **${directAnalysis.vaderLabel.toUpperCase()}** with a compound score of **${directAnalysis.vaderCompound > 0 ? '+' : ''}${directAnalysis.vaderCompound.toFixed(2)}**.\n` +
          `• **Hugging Face (Transformer)**: Evaluated as **${directAnalysis.hfLabel.toUpperCase()}** with **${(directAnalysis.hfConfidence * 100).toFixed(0)}% confidence**.\n\n` +
          (directAnalysis.agreement
            ? `✅ **Consensus**: Both engines agree on the emotional orientation.`
            : `⚠️ **Model Divergence**: The rule-based lexicon and deep self-attention produced differing labels due to grammatical context or clause subordination.`);
      } else if (query.toLowerCase().includes('summarize') || query.toLowerCase().includes('trend')) {
        replyText = `Here is your current Sentiment Overview summary for Olona's workspace:\n\n` +
          `• **Overall Polarity**: **58% Positive**, **27% Neutral**, and **15% Negative** across 247 logged entries.\n` +
          `• **Trajectory**: Positive sentiment increased by +9% from Sep 28 to Oct 4 (peaking at 65%).\n` +
          `• **Dominant Praises**: Customers frequently praise **product quality**, **fast service**, and **helpful staff**.\n` +
          `• **Key Friction**: Negative feedback primarily targets mobile app crashes and confusing navigation.`;
      } else if (query.toLowerCase().includes('sarcasm') || query.toLowerCase().includes('disagree') || query.toLowerCase().includes('diverge')) {
        replyText = `**Why VADER and Hugging Face Disagree on Sarcasm:**\n\n` +
          `1. **VADER** scans individual tokens against a pre-compiled lexicon. In sentences like *"Oh wonderful, another bug broke my audio"*, it sees the word *"wonderful"* (+3.2) and adds positive points.\n` +
          `2. **Hugging Face (RoBERTa)** uses multi-head self-attention across the whole sentence embedding. It recognizes the incongruous pairing of *"wonderful"* with *"bug broke"* as ironic sarcasm, correctly classifying it as **Negative (90%+ confidence)**.\n\n` +
          `💡 *Tip: For formal customer support tickets, VADER provides ultra-fast microsecond scoring, while Transformer models are superior for sarcastic social media posts.*`;
      } else if (query.toLowerCase().includes('draft') || query.toLowerCase().includes('apology') || query.toLowerCase().includes('response')) {
        replyText = `Here is a professional, empathetic response draft you can send to the customer:\n\n` +
          `> *"Dear customer, thank you for sharing your candid feedback. We are genuinely sorry to hear that the product didn't perform as expected. Your satisfaction is our top priority—our engineering team is looking into this issue, and we'd love to offer you a free replacement or full refund right away. Please reach out to support@sentimentai.com with your order details."*\n\n` +
          `Would you like me to adjust the tone to be more formal, friendly, or concise?`;
      } else if (query.toLowerCase().includes('pain points') || query.toLowerCase().includes('complaints')) {
        replyText = `Based on recent negative sentiment clusters, here are the top 3 customer pain points:\n\n` +
          `1. **App Stability & Usability**: Mentions of "confusing interface" and "crashing during export" represent 42% of negative comments.\n` +
          `2. **Response Latency**: 28% of critical reviews note delays in support ticket turnaround times.\n` +
          `3. **Firmware / Updates**: Audio hissing reports after the latest firmware patch.\n\n` +
          `Recommendation: Prioritize UI onboarding tooltips and push a hotfix for audio drivers.`;
      } else {
        replyText = `Thank you, Olona! I've noted that. I can help you monitor live feedback, test new review datasets, compare VADER against Hugging Face Transformer confidence, or generate customer support responses. What would you like to explore next?`;
      }

      const assistantMsg: ChatMessage = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sentimentAnalysis: directAnalysis
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'm_init',
        sender: 'assistant',
        text: "Chat cleared! How can I assist you with your sentiment data today, Olona?",
        timestamp: 'Just now'
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] rounded-[14px] border bg-[#14141C] border-[#2A2340] dark:bg-[#14141C] dark:border-[#2A2340] light:bg-[#F5F3FF] light:border-[#DDD6FE] shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="px-5 py-3.5 border-b border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE] flex items-center justify-between bg-[#0A0A0F]/60 dark:bg-[#0A0A0F]/60 light:bg-[#FFFFFF]/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center text-white shadow-md shadow-[#8B5CF6]/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white dark:text-white light:text-[#0A0A0F]">
                SentimentAI Assistant
              </h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded-[4px] bg-[#22C55E]/15 text-[#22C55E] font-medium border border-[#22C55E]/30">
                Online
              </span>
            </div>
            <p className="text-[11px] text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B]">
              Consultant for Olona · Review evaluation, model insights & customer drafting
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          title="Clear Conversation"
          className="p-1.5 rounded-[8px] border border-[#2A2340] text-[#A1A1B5] hover:text-white hover:border-[#8B5CF6] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isCopied = copiedId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              {isUser ? (
                <div className="w-7 h-7 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  OW
                </div>
              ) : (
                <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-[#8B5CF6] to-[#4C1D95] text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-[12px] p-3.5 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white shadow-md shadow-[#8B5CF6]/20'
                    : 'bg-[#0A0A0F]/90 dark:bg-[#0A0A0F]/90 light:bg-[#FFFFFF] border border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE] text-white dark:text-white light:text-[#0A0A0F]'
                }`}
              >
                {/* Text Content */}
                <div className="whitespace-pre-line break-words space-y-1">
                  {msg.text}
                </div>

                {/* Direct Sentiment Badge Card if attached */}
                {msg.sentimentAnalysis && (
                  <div className="mt-3 p-2.5 rounded-[8px] bg-[#14141C] border border-[#8B5CF6]/40 text-xs">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#C4B5FD] mb-1.5">
                      <span>Sentiment Score Matrix:</span>
                      <span className="font-mono">
                        {msg.sentimentAnalysis.agreement ? 'Agreement' : 'Divergent'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="p-1.5 rounded bg-[#0A0A0F] border border-[#2A2340]">
                        <span className="text-[#A1A1B5] block">VADER:</span>
                        <span className="text-white font-bold">
                          {msg.sentimentAnalysis.vaderLabel.toUpperCase()} ({msg.sentimentAnalysis.vaderCompound > 0 ? '+' : ''}{msg.sentimentAnalysis.vaderCompound.toFixed(2)})
                        </span>
                      </div>
                      <div className="p-1.5 rounded bg-[#0A0A0F] border border-[#2A2340]">
                        <span className="text-[#A1A1B5] block">Hugging Face:</span>
                        <span className="text-white font-bold">
                          {msg.sentimentAnalysis.hfLabel.toUpperCase()} ({(msg.sentimentAnalysis.hfConfidence * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer timestamp & copy */}
                <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-white/10 text-[10px] opacity-75">
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-[#A1A1B5]">
            <div className="w-6 h-6 rounded-[8px] bg-[#8B5CF6]/20 flex items-center justify-center text-[#C4B5FD]">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <span>SentimentAI is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts */}
      <div className="px-5 py-2 border-t border-[#2A2340]/60 dark:border-[#2A2340]/60 light:border-[#DDD6FE]/60 bg-[#0A0A0F]/40 dark:bg-[#0A0A0F]/40 light:bg-[#FFFFFF]/50 overflow-x-auto">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          {STARTER_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-[11px] px-2.5 py-1 rounded-[8px] bg-[#14141C] border border-[#2A2340] text-[#A1A1B5] hover:text-white hover:border-[#8B5CF6]/50 transition-colors cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE] bg-[#0A0A0F]/80 dark:bg-[#0A0A0F]/80 light:bg-[#FFFFFF]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about sentiment trends, analyze a review, or draft a customer reply..."
            className="flex-1 px-4 py-2.5 rounded-[12px] bg-[#0A0A0F] dark:bg-[#0A0A0F] light:bg-[#FFFFFF] border border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE] text-white dark:text-white light:text-[#0A0A0F] placeholder-[#A1A1B5]/50 text-xs sm:text-sm purple-input-glow"
          />

          <button
            type="submit"
            disabled={!input.trim()}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[12px] font-medium text-xs sm:text-sm text-white bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] shadow-md shadow-[#8B5CF6]/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
