export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Recruiter' | 'Hiring Manager' | 'Talent Partner' | 'Executive Lead' | 'Professional Evaluator';
  organization?: string;
  avatarUrl?: string;
  isGuest?: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
}
