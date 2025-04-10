import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: number;
  email: string;
  username: string;
  profile_image: string | null;
  kakaoid?: string;
  naverid?: string;
  googleid?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  loading: boolean;
  login: (provider: string) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const userData = await authAPI.checkAuth();
      setIsAuthenticated(true);
      setUser(userData);
      
      try {
        const adminResponse = await authAPI.checkAdmin();
        setIsAdmin(adminResponse.isAdmin);
      } catch (error) {
        console.error('관리자 권한 확인 실패:', error);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('인증 확인 실패:', error);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (provider: string) => {
    authAPI.login(provider);
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUser(null);
      localStorage.removeItem('token');
    } catch (error) {
      console.error('로그아웃 에러:', error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAdmin,
        user,
        loading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 