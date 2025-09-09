import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import type { AuthState, LoginCredentials, RegisterData, User } from '../types/auth';

const API_URL = 'http://localhost:8000/api';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    isAuthenticated: false,
  });

  useEffect(() => {
    if (state.accessToken) {
      fetchUserData();
    }
  }, [state.accessToken]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get<User>(`${API_URL}/auth/me/`, {
        headers: { Authorization: `Bearer ${state.accessToken}` },
      });
      setState(prev => ({ ...prev, user: response.data, isAuthenticated: true }));
    } catch (error) {
      logout();
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login/`, credentials);
      const { access, refresh } = response.data;
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      setState(prev => ({
        ...prev,
        accessToken: access,
        refreshToken: refresh,
        isAuthenticated: true,
      }));
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await axios.post(`${API_URL}/auth/register/`, data);
      await login({ username: data.username, password: data.password });
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};