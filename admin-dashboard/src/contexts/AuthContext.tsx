'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api-client';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await authApi.getProfile();
        setUser(userData as User);
      }
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response: any = await authApi.login({ username, password });
      
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      
      router.push('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}