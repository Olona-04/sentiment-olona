import React, { useState } from 'react';
import { X, User, Lock, Mail, Check, LogIn, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { user, isLoggedIn, login, logout } = useAuth();
  const [name, setName] = useState<string>(user?.name || 'Olona Williams');
  const [email, setEmail] = useState<string>(user?.email || 'olonawilliams04@gmail.com');
  const [password, setPassword] = useState<string>('••••••••');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(name, email);
    onClose();
  };

  const handleQuickLoginOlona = () => {
    setName('Olona Williams');
    setEmail('olonawilliams04@gmail.com');
    login('Olona Williams', 'olonawilliams04@gmail.com');
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-[16px] border border-[#2A2340] bg-[#14141C] p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-[8px] text-[#A1A1B5] hover:text-white hover:bg-[#2A2340] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center text-white shadow-lg shadow-[#8B5CF6]/30">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {isLoggedIn ? 'Account Profile' : 'Sign in to SentimentAI'}
            </h3>
            <p className="text-xs text-[#A1A1B5]">
              {isLoggedIn ? `Logged in as ${user?.name}` : 'Personalize your workspace and sentiment metrics'}
            </p>
          </div>
        </div>

        {/* Current User Status Card */}
        {isLoggedIn && (
          <div className="p-3.5 rounded-[12px] bg-[#0A0A0F] border border-[#2A2340] mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#7C3AED] text-white flex items-center justify-center font-bold text-sm ring-2 ring-[#8B5CF6]/30">
                {user?.avatarInitials}
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">
                  {user?.name}
                </span>
                <span className="text-[11px] text-[#A1A1B5] font-mono block">
                  {user?.email}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] text-xs font-medium border border-[#EF4444]/30 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        )}

        {/* Form to login or change name */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#A1A1B5] mb-1.5">
              Full Name (Greeting Display)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#A1A1B5] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Olona Williams"
                className="w-full pl-9 pr-3 py-2 rounded-[10px] bg-[#0A0A0F] border border-[#2A2340] text-xs text-white placeholder-[#A1A1B5]/50 purple-input-glow"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A1A1B5] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A1A1B5] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="olonawilliams04@gmail.com"
                className="w-full pl-9 pr-3 py-2 rounded-[10px] bg-[#0A0A0F] border border-[#2A2340] text-xs text-white placeholder-[#A1A1B5]/50 purple-input-glow"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A1A1B5] mb-1.5">
              Password / Access Key
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A1A1B5] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-[10px] bg-[#0A0A0F] border border-[#2A2340] text-xs text-white placeholder-[#A1A1B5]/50 purple-input-glow"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] font-semibold text-xs text-white bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] shadow-md shadow-[#8B5CF6]/30 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoggedIn ? 'Save Profile Details' : 'Sign In Now'}</span>
            </button>

            <button
              type="button"
              onClick={handleQuickLoginOlona}
              className="w-full py-2 rounded-[10px] border border-[#8B5CF6]/40 text-xs font-medium text-[#C4B5FD] hover:bg-[#8B5CF6]/15 transition-colors cursor-pointer"
            >
              Sign In as Olona Williams (Quick Login)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
