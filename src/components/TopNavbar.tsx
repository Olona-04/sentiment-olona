import React, { useState } from 'react';
import { User, Sparkles, LogIn, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LoginModal } from './LoginModal';

interface TopNavbarProps {
  onOpenEmojiGame?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onOpenEmojiGame }) => {
  const { user, isLoggedIn } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b transition-colors duration-200 border-[#2A2340] bg-[#0A0A0F]/95 dark:border-[#2A2340] dark:bg-[#0A0A0F]/95 light:border-[#E5DEFF] light:bg-[#FFFFFF]/95 backdrop-blur-md">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Lockup: Purple Brain Icon + SentimentAI */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/30 text-white">
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-4.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z" />
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white dark:text-white light:text-[#120D24]">
                  SentimentAI
                </span>
              </div>
              <p className="text-[11px] text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#645A7E]">
                Turn words into insights
              </p>
            </div>
          </div>

          {/* Right Controls: Dark/Light Pill Switch + Emoji Game + User Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Dark & Light Pill Toggle matching screenshot */}
            <div
              onClick={toggleTheme}
              title={`Currently in ${theme === 'dark' ? 'Dark' : 'Light'} Mode. Click to switch.`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#2A2340] bg-[#14141C] dark:bg-[#14141C] dark:border-[#2A2340] light:bg-[#F5F3FF] light:border-[#DDD6FE] cursor-pointer transition-all hover:border-[#8B5CF6]/60 shadow-sm"
            >
              <Moon className="w-3.5 h-3.5 text-[#C4B5FD] dark:text-[#C4B5FD] light:text-[#7C3AED]" />
              <span className="text-[11px] font-medium text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#4B5563] hidden xs:inline">
                Dark
              </span>

              {/* Slider track */}
              <div className="relative w-7 h-3.5 rounded-full bg-[#2A2340] dark:bg-[#2A2340] light:bg-[#DDD6FE] p-0.5">
                <div
                  className={`w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    theme === 'light' ? 'translate-x-3.5' : 'translate-x-0'
                  }`}
                />
              </div>

              <span className="text-[11px] font-medium text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#4B5563] hidden xs:inline">
                Light
              </span>
              <Sun className="w-3.5 h-3.5 text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#7C3AED]" />
            </div>

            {/* Quick Emotion Game Shortcut */}
            {onOpenEmojiGame && (
              <button
                onClick={onOpenEmojiGame}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#8B5CF6]/40 bg-[#14141C] dark:bg-[#14141C] light:bg-[#F5F3FF] text-xs font-medium text-[#C4B5FD] dark:text-[#C4B5FD] light:text-[#7C3AED] hover:bg-[#8B5CF6]/20 transition-all cursor-pointer shadow-sm"
              >
                <span>🎭 Emoji Mood</span>
              </button>
            )}

            {/* Profile & Login Button */}
            {isLoggedIn ? (
              <div
                onClick={() => setIsLoginModalOpen(true)}
                title={`Signed in as ${user?.name} (${user?.email}). Click to switch account.`}
                className="flex items-center gap-2 p-1 pl-2.5 rounded-full border border-[#2A2340] bg-[#14141C] dark:bg-[#14141C] dark:border-[#2A2340] light:bg-[#F5F3FF] light:border-[#DDD6FE] hover:border-[#8B5CF6]/60 cursor-pointer transition-all"
              >
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-semibold text-white dark:text-white light:text-[#120D24] block leading-tight">
                    {user?.name}
                  </span>
                  <span className="text-[10px] text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#645A7E] block leading-tight">
                    {user?.role}
                  </span>
                </div>

                <div className="w-8 h-8 rounded-full bg-[#7C3AED] text-white flex items-center justify-center font-semibold text-xs tracking-wider ring-2 ring-[#8B5CF6]/30 shadow-md">
                  {user?.avatarInitials}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white text-xs font-semibold shadow-md shadow-[#8B5CF6]/30 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Login / Profile Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};
