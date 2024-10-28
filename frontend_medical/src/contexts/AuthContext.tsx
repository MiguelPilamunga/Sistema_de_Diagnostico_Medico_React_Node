import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../interfaces/auth';
import * as authService from '../services/authService';

interface AuthContextType extends Omit<AuthState, 'user'> {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: localStorage.getItem('accessToken'),
    isAuthenticated: false,
  });

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const { user } = await authService.getProfile(token);
          setState(prev => ({
            ...prev,
            user,
            isAuthenticated: true,
          }));
        } catch (error) {
          console.error('Error initializing auth:', error);
          await handleLogout();
        }
      }
    };

    initAuth();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await authService.login({ username, password });
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('userRoles', JSON.stringify(response.user.roles));
      setState({
        user: response.user,
        accessToken: response.accessToken,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    const token = state.accessToken;
    if (token) {
      try {
        await authService.logout(token);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
