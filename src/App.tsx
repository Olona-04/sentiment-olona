/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { TopNavbar } from './components/TopNavbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { HomeDashboardView } from './components/HomeDashboardView';
import { SingleTextView } from './components/SingleTextView';
import { BatchCommentsView } from './components/BatchCommentsView';
import { ChatView } from './components/ChatView';
import { EmojiEmotionGameView } from './components/EmojiEmotionGameView';
import { FloatingChatWidget } from './components/FloatingChatWidget';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { ModelInfoModal } from './components/ModelInfoModal';

function MainApp() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [analyzeSubTab, setAnalyzeSubTab] = useState<'batch' | 'single'>('batch');
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState<boolean>(false);
  const [isModelDocsOpen, setIsModelDocsOpen] = useState<boolean>(false);
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        theme === 'dark'
          ? 'bg-[#0A0A0F] text-[#FFFFFF]'
          : 'bg-[#FAF8FF] text-[#120D24]'
      } selection:bg-[#8B5CF6]/30`}
    >
      {/* Top Header with Dark/Light Toggle, Profile/Login, and Emoji Game shortcut */}
      <TopNavbar
        onOpenEmojiGame={() => setActiveTab('emoji_game')}
      />

      {/* Main Layout: Left Sidebar + Center/Right Viewport */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6 lg:gap-8 py-6">
        {/* Left Sidebar */}
        <div className="hidden md:block">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center justify-between p-1.5 rounded-[12px] bg-[#14141C] dark:bg-[#14141C] light:bg-[#FFFFFF] border border-[#2A2340] dark:border-[#2A2340] light:border-[#E5DEFF] overflow-x-auto text-xs gap-1 shadow-sm">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1.5 rounded-[8px] font-medium whitespace-nowrap transition-all ${
              activeTab === 'home'
                ? 'bg-[#8B5CF6] text-white shadow-sm'
                : 'text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#645A7E]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('analyze')}
            className={`px-3 py-1.5 rounded-[8px] font-medium whitespace-nowrap transition-all ${
              activeTab === 'analyze'
                ? 'bg-[#8B5CF6] text-white shadow-sm'
                : 'text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#645A7E]'
            }`}
          >
            Analyze
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-[8px] font-medium whitespace-nowrap transition-all ${
              activeTab === 'chat'
                ? 'bg-[#8B5CF6] text-white shadow-sm'
                : 'text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#645A7E]'
            }`}
          >
            Chat ✨
          </button>
          <button
            onClick={() => setActiveTab('emoji_game')}
            className={`px-3 py-1.5 rounded-[8px] font-medium whitespace-nowrap transition-all ${
              activeTab === 'emoji_game'
                ? 'bg-[#8B5CF6] text-white shadow-sm'
                : 'text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#645A7E]'
            }`}
          >
            Emoji Game 🎭
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-[8px] font-medium whitespace-nowrap transition-all ${
              activeTab === 'history'
                ? 'bg-[#8B5CF6] text-white shadow-sm'
                : 'text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#645A7E]'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-[8px] font-medium whitespace-nowrap transition-all ${
              activeTab === 'settings'
                ? 'bg-[#8B5CF6] text-white shadow-sm'
                : 'text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#645A7E]'
            }`}
          >
            Settings
          </button>
        </div>

        {/* Dynamic Main View */}
        <main className="flex-1 min-w-0">
          {/* 1. Home Dashboard: Empty by default, populates live on comment input */}
          {activeTab === 'home' && (
            <HomeDashboardView
              onNavigateToAnalyze={() => setActiveTab('analyze')}
              onNavigateToChat={() => setActiveTab('chat')}
              onOpenEmojiGame={() => setActiveTab('emoji_game')}
            />
          )}

          {/* 2. Full Analyze View with Batch & Single views */}
          {activeTab === 'analyze' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#2A2340] dark:border-[#2A2340] light:border-[#E5DEFF]">
                <div>
                  <h2 className="text-xl font-bold text-white dark:text-white light:text-[#120D24]">
                    Deep Sentiment Intelligence
                  </h2>
                  <p className="text-xs text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#645A7E]">
                    Compare VADER and Hugging Face with keyword bars, trend lines, and batch filters
                  </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-[10px] bg-[#14141C] dark:bg-[#14141C] light:bg-[#FFFFFF] border border-[#2A2340] dark:border-[#2A2340] light:border-[#E5DEFF]">
                  <button
                    onClick={() => setAnalyzeSubTab('batch')}
                    className={`px-3 py-1 text-xs font-semibold rounded-[6px] transition-all cursor-pointer ${
                      analyzeSubTab === 'batch'
                        ? 'bg-[#8B5CF6] text-white'
                        : 'text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#645A7E] hover:text-white dark:hover:text-white light:hover:text-[#120D24]'
                    }`}
                  >
                    Batch Comments
                  </button>
                  <button
                    onClick={() => setAnalyzeSubTab('single')}
                    className={`px-3 py-1 text-xs font-semibold rounded-[6px] transition-all cursor-pointer ${
                      analyzeSubTab === 'single'
                        ? 'bg-[#8B5CF6] text-white'
                        : 'text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#645A7E] hover:text-white dark:hover:text-white light:hover:text-[#120D24]'
                    }`}
                  >
                    Single Text
                  </button>
                </div>
              </div>

              {analyzeSubTab === 'batch' ? <BatchCommentsView /> : <SingleTextView />}
            </div>
          )}

          {/* 3. Dedicated Chat View */}
          {activeTab === 'chat' && <ChatView />}

          {/* 4. Emoji Mood & Emotion Game */}
          {activeTab === 'emoji_game' && <EmojiEmotionGameView />}

          {/* 5. History View */}
          {activeTab === 'history' && <HistoryView />}

          {/* 6. Settings View */}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Floating Chat Widget available across all pages */}
      {activeTab !== 'chat' && (
        <FloatingChatWidget
          isOpen={isFloatingChatOpen}
          onToggle={() => setIsFloatingChatOpen(!isFloatingChatOpen)}
        />
      )}

      {/* Model Docs Modal */}
      <ModelInfoModal
        isOpen={isModelDocsOpen}
        onClose={() => setIsModelDocsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
