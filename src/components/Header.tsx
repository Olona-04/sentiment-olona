import React from 'react';
import { Sun, Moon, Sparkles, Layers, BookOpen, MessageSquare } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  activeTab: 'single' | 'batch' | 'models';
  setActiveTab: (tab: 'single' | 'batch' | 'models') => void;
  onOpenModelDocs: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenModelDocs
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b transition-colors duration-200 border-[#2A2340] bg-[#0A0A0F]/90 dark:border-[#2A2340] dark:bg-[#0A0A0F]/90 light:border-[#DDD6FE] light:bg-[#FFFFFF]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Lockup with App Name and Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#8B5CF6] to-[#4C1D95] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/25 ring-1 ring-[#C4B5FD]/30">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12h3l3-7 4 14 3-7h5" />
              <circle cx="17" cy="5" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white dark:text-white light:text-[#0A0A0F]">
                Sentix
              </span>
              <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-[6px] bg-[#8B5CF6]/20 text-[#C4B5FD] border border-[#8B5CF6]/30">
                Studio
              </span>
            </div>
            <p className="text-xs text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B] hidden sm:block">
              VADER & Transformer Sentiment Intelligence
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 p-1 rounded-[12px] bg-[#14141C] dark:bg-[#14141C] dark:border dark:border-[#2A2340] light:bg-[#F5F3FF] light:border light:border-[#DDD6FE]">
          <button
            onClick={() => setActiveTab('single')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-[8px] transition-all duration-150 ${
              activeTab === 'single'
                ? 'bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/25'
                : 'text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B] hover:text-white dark:hover:text-white light:hover:text-[#0A0A0F]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Single Text</span>
          </button>

          <button
            onClick={() => setActiveTab('batch')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-[8px] transition-all duration-150 ${
              activeTab === 'batch'
                ? 'bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/25'
                : 'text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B] hover:text-white dark:hover:text-white light:hover:text-[#0A0A0F]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Batch & Comments</span>
          </button>

          <button
            onClick={() => setActiveTab('models')}
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-[8px] transition-all duration-150 ${
              activeTab === 'models'
                ? 'bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/25'
                : 'text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#64748B] hover:text-white dark:hover:text-white light:hover:text-[#0A0A0F]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>VADER vs HF</span>
          </button>
        </nav>

        {/* Zone 3: Actions (Theme Toggle & Model Docs Modal) */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenModelDocs}
            title="Model Architecture & Heuristics"
            className="p-2 rounded-[12px] border transition-colors border-[#2A2340] bg-[#14141C] text-[#A1A1B5] hover:text-white hover:border-[#8B5CF6]/50 dark:border-[#2A2340] dark:bg-[#14141C] dark:text-[#A1A1B5] dark:hover:text-white light:border-[#DDD6FE] light:bg-[#F5F3FF] light:text-[#4B5563] light:hover:text-[#0A0A0F]"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-[12px] border transition-all duration-150 border-[#2A2340] bg-[#14141C] text-[#A1A1B5] hover:text-[#C4B5FD] hover:border-[#8B5CF6] dark:border-[#2A2340] dark:bg-[#14141C] dark:text-[#A1A1B5] dark:hover:text-[#C4B5FD] light:border-[#DDD6FE] light:bg-[#F5F3FF] light:text-[#4B5563] light:hover:text-[#7C3AED]"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#C4B5FD]" />
            ) : (
              <Moon className="w-4 h-4 text-[#7C3AED]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
