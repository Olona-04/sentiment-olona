import React, { useState } from 'react';
import { Settings, Moon, Sun, Shield, Cpu, Database, Save, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const SettingsView: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [vaderThreshold, setVaderThreshold] = useState<number>(0.05);
  const [enableSarcasmDetection, setEnableSarcasmDetection] = useState<boolean>(true);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="p-6 rounded-[14px] border bg-[#14141C] border-[#2A2340] dark:bg-[#14141C] dark:border-[#2A2340] light:bg-[#FFFFFF] light:border-[#E5DEFF]">
        <div className="flex items-center gap-2 pb-4 border-b border-[#2A2340] dark:border-[#2A2340] light:border-[#E5DEFF]">
          <Settings className="w-5 h-5 text-[#8B5CF6]" />
          <div>
            <h2 className="text-lg font-bold text-white dark:text-white light:text-[#120D24]">
              SentimentAI Preferences & Parameters
            </h2>
            <p className="text-xs text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#645A7E]">
              Configure model tuning thresholds, theme appearance, and export options
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-6">
          {/* Appearance Section */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C4B5FD] dark:text-[#C4B5FD] light:text-[#7C3AED] mb-3">
              Theme & Visual Appearance
            </h4>
            <div className="p-4 rounded-[12px] bg-[#0A0A0F] dark:bg-[#0A0A0F] light:bg-[#FAF8FF] border border-[#2A2340] dark:border-[#2A2340] light:border-[#E5DEFF] flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-white dark:text-white light:text-[#120D24] block">
                  Active Display Mode
                </span>
                <span className="text-xs text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#645A7E]">
                  Currently using {theme === 'dark' ? 'Black & Purple Dark Theme' : 'Light Lavender Mist Theme'}
                </span>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-xs font-semibold text-[#C4B5FD] dark:text-[#C4B5FD] light:text-[#7C3AED] hover:bg-[#8B5CF6]/30 transition-colors cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>Switch to {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          </div>

          {/* Model Heuristics Thresholds */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C4B5FD] dark:text-[#C4B5FD] light:text-[#7C3AED] mb-3">
              NLP Engine Tuning
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-[12px] bg-[#0A0A0F] dark:bg-[#0A0A0F] light:bg-[#FAF8FF] border border-[#2A2340] dark:border-[#2A2340] light:border-[#E5DEFF]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-white dark:text-white light:text-[#120D24]">
                    VADER Neutral Threshold Boundary (±)
                  </span>
                  <span className="font-mono text-[#C4B5FD] dark:text-[#C4B5FD] light:text-[#7C3AED] font-bold">
                    {vaderThreshold}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.25"
                  step="0.01"
                  value={vaderThreshold}
                  onChange={(e) => setVaderThreshold(parseFloat(e.target.value))}
                  className="w-full accent-[#8B5CF6] cursor-pointer"
                />
                <span className="text-[11px] text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#645A7E] block mt-1">
                  Compound scores within [-{vaderThreshold}, +{vaderThreshold}] are classified as Neutral.
                </span>
              </div>

              <div className="p-4 rounded-[12px] bg-[#0A0A0F] dark:bg-[#0A0A0F] light:bg-[#FAF8FF] border border-[#2A2340] dark:border-[#2A2340] light:border-[#E5DEFF] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white dark:text-white light:text-[#120D24] block">
                    Transformer Sarcasm Resolution
                  </span>
                  <span className="text-[11px] text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#645A7E]">
                    Enable deep contextual syntax checking to detect irony and concessive clauses
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={enableSarcasmDetection}
                  onChange={(e) => setEnableSarcasmDetection(e.target.checked)}
                  className="w-4 h-4 accent-[#8B5CF6] rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Export Settings */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C4B5FD] dark:text-[#C4B5FD] light:text-[#7C3AED] mb-3">
              Data & Exporting
            </h4>
            <div className="p-4 rounded-[12px] bg-[#0A0A0F] dark:bg-[#0A0A0F] light:bg-[#FAF8FF] border border-[#2A2340] dark:border-[#2A2340] light:border-[#E5DEFF] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white dark:text-white light:text-[#120D24] block">
                  Default Export Format
                </span>
                <span className="text-[11px] text-[#A1A1B5] dark:text-[#A1A1B5] light:text-[#645A7E]">
                  Select preferred export format when downloading batch comments
                </span>
              </div>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as any)}
                className="bg-[#14141C] dark:bg-[#14141C] light:bg-[#FFFFFF] border border-[#2A2340] dark:border-[#2A2340] light:border-[#DDD6FE] text-xs text-white dark:text-white light:text-[#120D24] rounded-[6px] px-3 py-1 font-mono cursor-pointer"
              >
                <option value="csv">CSV Spreadsheet</option>
                <option value="json">JSON Structure</option>
              </select>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-[10px] bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white text-xs font-semibold shadow-md shadow-[#8B5CF6]/30 transition-all cursor-pointer"
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? 'Settings Saved' : 'Save Preferences'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
