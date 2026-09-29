/**
 * Community Health Report System (CHRS) - Authentication Context
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { HealthOfficial, User, UserRole } from '../types';
import { api, getAuthToken, setAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  official: HealthOfficial | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  quickDemoLogin: (role: UserRole) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [official, setOfficial] = useState<HealthOfficial | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    const currentToken = getAuthToken();
    if (!currentToken) {
      setUser(null);
      setOfficial(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);
      setOfficial(data.official || null);
    } catch (err) {
      console.warn('Session expired or invalid token:', err);
      setAuthToken(null);
      setToken(null);
      setUser(null);
      setOfficial(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = async (email: string, password: string, role?: UserRole) => {
    let res: any;
    if (role === 'official') {
      res = await api.officialLogin({ email, password });
    } else if (role === 'admin') {
      res = await api.adminLogin({ email, password });
    } else {
      res = await api.login({ email, password });
    }

    setAuthToken(res.token);
    setToken(res.token);
    setUser(res.user);
    setOfficial(res.official || null);
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    const res = await api.register({ name, email, phone, password });
    setAuthToken(res.token);
    setToken(res.token);
    setUser(res.user);
    setOfficial(null);
  };

  const logout = () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setOfficial(null);
  };

  // Helper for one-click demo login during academic defense
  const quickDemoLogin = async (role: UserRole) => {
    const credentials = {
      citizen: { email: 'citizen@chrs.gov.ng', password: 'password123' },
      official: { email: 'official@chrs.gov.ng', password: 'password123' },
      admin: { email: 'eseoghenedestiny05@gmail.com', password: 'Aharhibaba123.' },
    }[role];

    await login(credentials.email, credentials.password, role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        official,
        token,
        isLoading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        quickDemoLogin,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
