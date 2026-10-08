import React from 'react';
import { Home, BarChart2, MessageSquare, Clock, Settings, Sparkles, Smile } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export type NavTab = 'home' | 'analyze' | 'chat' | 'emoji_game' | 'history' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { theme } = useTheme();

  const navItems = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'analyze' as NavTab, label: 'Analyze', icon: BarChart2 },
    { id: 'chat' as NavTab, label: 'Chat', icon: MessageSquare, badge: 'AI' },
    { id: 'emoji_game' as NavTab, label: 'Emoji Game & Mood', icon: Smile, badge: 'Fun' },
    { id: 'history' as NavTab, label: 'History', icon: Clock },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-56 shrink-0 flex flex-col justify-between py-6">
      {/* Navigation list */}
      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[12px] text-sm font-semibold transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white shadow-md shadow-[#8B5CF6]/30'
                  : theme === 'dark'
                  ? 'text-[#A1A1B5] hover:text-white hover:bg-[#14141C]'
                  : 'text-[#120D24] hover:text-[#000000] hover:bg-[#FFFFFF]/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${
                  isActive
                    ? 'text-white'
                    : theme === 'dark'
                    ? 'text-[#8B5CF6]/80'
                    : 'text-[#7C3AED]'
                }`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && !isActive && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                  theme === 'dark'
                    ? 'bg-[#8B5CF6]/20 text-[#C4B5FD] border-[#8B5CF6]/30'
                    : 'bg-[#FFFFFF] text-[#7C3AED] border-[#8B5CF6]/40 shadow-xs'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Inspiration Card with Brain Icon and Purple Waves */}
      <div className={`relative overflow-hidden rounded-[14px] border p-4 text-left shadow-sm ${
        theme === 'dark'
          ? 'border-[#2A2340] bg-[#14141C]'
          : 'border-[#8B5CF6]/30 bg-[#FFFFFF]'
      }`}>
        <div className="w-8 h-8 rounded-[8px] bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#8B5CF6] mb-3">
          <svg
            className="w-4 h-4 text-[#8B5CF6]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z" />
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z" />
          </svg>
        </div>

        <p className={`text-xs font-semibold leading-snug relative z-10 ${
          theme === 'dark' ? 'text-white' : 'text-[#000000]'
        }`}>
          Better understanding builds better decisions.
        </p>

        <div className="absolute -bottom-1 -right-2 left-0 h-16 pointer-events-none opacity-40">
          <svg viewBox="0 0 200 60" fill="none" className="w-full h-full">
            <path
              d="M0 30 C 40 10, 80 50, 120 25 C 160 5, 180 35, 200 20 L 200 60 L 0 60 Z"
              fill="url(#sidebarWaveGrad)"
            />
            <defs>
              <linearGradient id="sidebarWaveGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#4C1D95" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </aside>
  );
};
