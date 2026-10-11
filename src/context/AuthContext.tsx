import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types/auth.ts';

interface AuthContextType extends AuthState {
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    name: string,
    email: string,
    password?: string,
    role?: User['role'],
    organization?: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  loginAsGuest: (role?: User['role']) => void;
  quickLoginAsDemo: (demoIndex: number) => void;
  logout: () => void;
  demoAccounts: User[];
}

export const DEMO_USERS: User[] = [
  {
    id: 'demo-recruiter',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@talentedge.ai',
    role: 'Recruiter',
    organization: 'TalentEdge AI',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-15T09:00:00Z',
    isGuest: false,
  },
  {
    id: 'demo-manager',
    name: 'Devon Vance',
    email: 'devon.vance@apexengineering.io',
    role: 'Hiring Manager',
    organization: 'Apex Engineering Labs',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-02-01T10:30:00Z',
    isGuest: false,
  },
  {
    id: 'demo-evaluator',
    name: 'Alex Rivera',
    email: 'alex.rivera@talentlabs.io',
    role: 'Professional Evaluator',
    organization: 'Talent Strategy Labs',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-03-01T12:00:00Z',
    isGuest: false,
  },
];

const STORAGE_KEY = 'humanlyai_auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Restore session from localStorage on initial render
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email) {
          setUser(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to restore user auth session:', e);
    }
  }, []);

  const saveUserSession = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const login = async (email: string, password?: string) => {
    // Artificial small delay for realistic smooth UI
    await new Promise((res) => setTimeout(res, 400));

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please provide a valid work email address.' };
    }

    // Check if matching any demo profile
    const matched = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      saveUserSession(matched);
      return { success: true };
    }

    // Generate user from email username
    const namePart = email.split('@')[0];
    const formattedName = namePart
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const customUser: User = {
      id: 'usr_' + Date.now().toString(36),
      name: formattedName || 'Workplace Professional',
      email: email.trim(),
      role: 'Recruiter',
      organization: email.split('@')[1] || 'Enterprise',
      createdAt: new Date().toISOString(),
      isGuest: false,
    };

    saveUserSession(customUser);
    return { success: true };
  };

  const signup = async (
    name: string,
    email: string,
    _password?: string,
    role: User['role'] = 'Recruiter',
    organization?: string
  ) => {
    await new Promise((res) => setTimeout(res, 400));

    if (!name || name.trim().length < 2) {
      return { success: false, error: 'Please enter your full name.' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid work email address.' };
    }

    const newUser: User = {
      id: 'usr_' + Date.now().toString(36),
      name: name.trim(),
      email: email.trim(),
      role: role || 'Recruiter',
      organization: organization?.trim() || email.split('@')[1] || 'Independent',
      createdAt: new Date().toISOString(),
      isGuest: false,
    };

    saveUserSession(newUser);
    return { success: true };
  };

  const loginWithGoogle = async () => {
    await new Promise((res) => setTimeout(res, 350));
    const googleUser: User = {
      id: 'g_' + Date.now().toString(36),
      name: 'Google Workspace User',
      email: 'user@workspace.google.com',
      role: 'Recruiter',
      organization: 'Google Workspace Org',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      isGuest: false,
    };
    saveUserSession(googleUser);
  };

  const loginWithGithub = async () => {
    await new Promise((res) => setTimeout(res, 350));
    const githubUser: User = {
      id: 'gh_' + Date.now().toString(36),
      name: 'Tech Talent Leader',
      email: 'dev@github.com',
      role: 'Hiring Manager',
      organization: 'Open Source Talent',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      isGuest: false,
    };
    saveUserSession(githubUser);
  };

  const loginAsGuest = (role: User['role'] = 'Professional Evaluator') => {
    const guestUser: User = {
      id: 'guest_' + Math.floor(Math.random() * 10000),
      name: 'Guest Evaluator',
      email: 'guest@humanlyai.app',
      role,
      organization: 'Enterprise Workspace',
      createdAt: new Date().toISOString(),
      isGuest: true,
    };
    saveUserSession(guestUser);
  };

  const quickLoginAsDemo = (demoIndex: number) => {
    const target = DEMO_USERS[demoIndex] || DEMO_USERS[0];
    saveUserSession(target);
  };

  const logout = () => {
    saveUserSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !user.isGuest,
        isGuest: !!user?.isGuest,
        login,
        signup,
        loginWithGoogle,
        loginWithGithub,
        loginAsGuest,
        quickLoginAsDemo,
        logout,
        demoAccounts: DEMO_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
