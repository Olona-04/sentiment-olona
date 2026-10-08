import React, { useState } from 'react';
import { MessageSquare, X, Sparkles, Send } from 'lucide-react';
import { ChatView } from './ChatView';

interface FloatingChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({ isOpen, onToggle }) => {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white shadow-xl shadow-[#8B5CF6]/35 border border-[#C4B5FD]/30 transition-all duration-200 active:scale-95 cursor-pointer group"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#22C55E] ring-2 ring-[#7C3AED]" />
          </div>
          <span className="text-xs font-semibold tracking-wide">
            Chat with SentimentAI
          </span>
        </button>
      )}

      {/* Expanded Floating Drawer Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[92vw] sm:w-[440px] md:w-[480px] h-[580px] max-h-[85vh] rounded-[16px] border border-[#8B5CF6]/50 shadow-2xl bg-[#14141C] flex flex-col overflow-hidden z-50 animate-fade-in">
          {/* Header Bar */}
          <div className="px-4 py-3 bg-[#0A0A0F] border-b border-[#2A2340] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-[6px] bg-[#8B5CF6]/20 text-[#C4B5FD] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-white">SentimentAI Live Chat</span>
            </div>
            <button
              onClick={onToggle}
              className="p-1 rounded-[6px] text-[#A1A1B5] hover:text-white hover:bg-[#2A2340] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            <ChatView />
          </div>
        </div>
      )}
    </div>
  );
};
