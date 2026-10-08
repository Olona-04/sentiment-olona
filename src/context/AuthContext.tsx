import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  avatarInitials: string;
  role: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: (name: string, email: string) => void;
  logout: () => void;
  greetingText: string;
}

const DEFAULT_USER: UserProfile = {
  name: 'Olona Williams',
  email: 'olonawilliams04@gmail.com',
  avatarInitials: 'OW',
  role: 'Workspace Owner'
};

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_USER,
  isLoggedIn: true,
  login: () => {},
  logout: () => {},
  greetingText: 'Good morning, Olona 👋'
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('sentimentai_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_USER;
  });

  const [greetingText, setGreetingText] = useState<string>('Good morning, Olona 👋');

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('sentimentai_user', JSON.stringify(user));
      } catch {
        // Ignore
      }
    } else {
      localStorage.removeItem('sentimentai_user');
    }

    // Dynamic greeting calculation
    const hour = new Date().getHours();
    let timeGreeting = 'Good morning';
    if (hour >= 12 && hour < 17) {
      timeGreeting = 'Good afternoon';
    } else if (hour >= 17) {
      timeGreeting = 'Good evening';
    }

    const firstName = user ? user.name.split(' ')[0] : 'Guest';
    setGreetingText(`${timeGreeting}, ${firstName} 👋`);
  }, [user]);

  const login = (name: string, email: string) => {
    const cleanName = name.trim() || 'Olona Williams';
    const initials = cleanName
      .split(' ')
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    setUser({
      name: cleanName,
      email: email.trim() || 'olonawilliams04@gmail.com',
      avatarInitials: initials || 'OW',
      role: 'Workspace Analyst'
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        logout,
        greetingText
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
