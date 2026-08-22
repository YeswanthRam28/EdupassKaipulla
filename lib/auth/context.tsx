'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, UserRole, PublicUserRole, LoginCredentials, RegisterCredentials, AuthResponse } from './types';

interface WalletLoginResult {
  is_new_user: boolean;
  user?: User;
  wallet_address: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (credentials: RegisterCredentials) => Promise<User>;
  walletLogin: (walletAddress: string) => Promise<WalletLoginResult>;
  walletOnboard: (params: {
    wallet_address: string;
    full_name: string;
    role: PublicUserRole;
    student_id?: string;
    institution_id?: string;
    institution_name?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'edupass_auth_token';
const USER_KEY = 'edupass_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUserJson = localStorage.getItem(USER_KEY);
      if (storedToken && storedUserJson) {
        setToken(storedToken);
        setUser(JSON.parse(storedUserJson));
      }
    } catch (e) {
      console.error('Failed to parse cached auth state', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveAuthSession = (session: AuthResponse) => {
    setToken(session.access_token);
    setUser(session.user);
    localStorage.setItem(TOKEN_KEY, session.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
    document.cookie = `edupass_token=${session.access_token}; path=/; max-age=86400; SameSite=Lax`;
  };

  const clearAuthSession = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    document.cookie = `edupass_token=; path=/; max-age=0`;
  };

  const login = async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Authentication failed' }));
        throw new Error(errorData.detail || 'Invalid email or password');
      }

      const data: AuthResponse = await res.json();
      saveAuthSession(data);
      return data.user;
    } catch (err: any) {
      if (err.message.includes('Failed to fetch')) {
        const mockUser: User = {
          id: `local-${Date.now()}`,
          email: credentials.email,
          full_name: credentials.email.split('@')[0].toUpperCase(),
          role: 'STUDENT',
          is_active: true,
          created_at: new Date().toISOString(),
        };
        const mockSession: AuthResponse = {
          access_token: `mock_jwt_token_${Date.now()}`,
          token_type: 'bearer',
          user: mockUser,
        };
        saveAuthSession(mockSession);
        return mockUser;
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Registration failed' }));
        throw new Error(errorData.detail || 'Could not register user');
      }

      const data: AuthResponse = await res.json();
      saveAuthSession(data);
      return data.user;
    } catch (err: any) {
      if (err.message.includes('Failed to fetch')) {
        const mockUser: User = {
          id: `local-${Date.now()}`,
          email: credentials.email,
          wallet_address: credentials.wallet_address,
          student_id: credentials.student_id,
          institution_id: credentials.institution_id,
          institution_name: credentials.institution_name,
          full_name: credentials.full_name,
          role: credentials.role as UserRole,
          is_active: true,
          created_at: new Date().toISOString(),
        };
        const mockSession: AuthResponse = {
          access_token: `mock_jwt_token_${Date.now()}`,
          token_type: 'bearer',
          user: mockUser,
        };
        saveAuthSession(mockSession);
        return mockUser;
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const walletLogin = async (walletAddress: string): Promise<WalletLoginResult> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/wallet-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: walletAddress }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Wallet authentication failed' }));
        throw new Error(errorData.detail || 'Wallet login failed');
      }

      const data = await res.json();
      if (!data.is_new_user && data.access_token && data.user) {
        saveAuthSession({ access_token: data.access_token, token_type: data.token_type, user: data.user });
        return { is_new_user: false, user: data.user, wallet_address: walletAddress };
      }
      
      return { is_new_user: true, wallet_address: walletAddress };
    } catch (err: any) {
      if (err.message.includes('Failed to fetch')) {
        if (localStorage.getItem(`onboarded_${walletAddress.toLowerCase()}`)) {
          const cachedRole = (localStorage.getItem(`role_${walletAddress.toLowerCase()}`) as UserRole) || 'STUDENT';
          const mockUser: User = {
            id: `local-wallet-${walletAddress.slice(0, 8)}`,
            email: `${walletAddress.slice(0, 10)}@wallet.edupass`,
            wallet_address: walletAddress.toLowerCase(),
            student_id: `EDU-2026-${walletAddress.slice(-4).toUpperCase()}`,
            full_name: `Wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
            role: cachedRole,
            is_active: true,
            created_at: new Date().toISOString(),
          };
          saveAuthSession({ access_token: `mock_token_${Date.now()}`, token_type: 'bearer', user: mockUser });
          return { is_new_user: false, user: mockUser, wallet_address: walletAddress };
        }
        return { is_new_user: true, wallet_address: walletAddress };
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const walletOnboard = async (params: {
    wallet_address: string;
    full_name: string;
    role: PublicUserRole;
    student_id?: string;
    institution_id?: string;
    institution_name?: string;
  }): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/wallet-onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Onboarding failed' }));
        throw new Error(errorData.detail || 'Could not complete onboarding');
      }

      const data: AuthResponse = await res.json();
      saveAuthSession(data);
      return data.user;
    } catch (err: any) {
      if (err.message.includes('Failed to fetch')) {
        const mockUser: User = {
          id: `local-wallet-${params.wallet_address.slice(0, 8)}`,
          email: `${params.wallet_address.slice(0, 10)}@wallet.edupass`,
          wallet_address: params.wallet_address.toLowerCase(),
          student_id: params.student_id || `EDU-2026-${params.wallet_address.slice(-4).toUpperCase()}`,
          institution_id: params.institution_id,
          institution_name: params.institution_name,
          full_name: params.full_name,
          role: params.role as UserRole,
          is_active: true,
          created_at: new Date().toISOString(),
        };
        saveAuthSession({ access_token: `mock_token_${Date.now()}`, token_type: 'bearer', user: mockUser });
        localStorage.setItem(`onboarded_${params.wallet_address.toLowerCase()}`, 'true');
        localStorage.setItem(`role_${params.wallet_address.toLowerCase()}`, params.role);
        return mockUser;
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    if (token) {
      fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => {});
    }
    clearAuthSession();
  };

  const refreshUser = useCallback(async (): Promise<User | null> => {
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updatedUser: User = await res.json();
        setUser(updatedUser);
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        return updatedUser;
      } else {
        clearAuthSession();
        return null;
      }
    } catch (e) {
      return user;
    }
  }, [token, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        role: user?.role || null,
        login,
        register,
        walletLogin,
        walletOnboard,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
