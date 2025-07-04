import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types/auth';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 Initializing auth context...');
    
    const token = localStorage.getItem('upstox_token');
    const userData = localStorage.getItem('user_data');
    
    console.log('💾 Stored data:', {
      hasToken: !!token,
      hasUserData: !!userData,
      token: token?.substring(0, 10) + '...'
    });
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('✅ User restored from storage:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('❌ Error parsing stored user data:', error);
        localStorage.removeItem('upstox_token');
        localStorage.removeItem('user_data');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (role: 'parent' | 'child') => {
    try {
      console.log('🔐 Starting login process for role:', role);
      
      const authUrl = authService.getAuthUrl(role);
      console.log('🔗 Redirecting to auth URL...');
      
      window.location.href = authUrl;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const handleAuthCallback = async (code: string, state: string) => {
    try {
      console.log('🔄 Processing auth callback...');
      
      const response = await authService.handleCallback(code, state);
      const userData = response.data;
      
      console.log('✅ Auth callback processed, setting user:', userData);
      
      setUser(userData);
      localStorage.setItem('upstox_token', userData.access_token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      console.error('❌ Auth callback error:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('🚪 Logging out user...');
    
    setUser(null);
    localStorage.removeItem('upstox_token');
    localStorage.removeItem('user_data');
    
    console.log('✅ User logged out successfully');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
    handleAuthCallback
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};