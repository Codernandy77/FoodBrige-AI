import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'DONOR' | 'NGO' | 'VOLUNTEER' | 'ADMIN';
  isVerified: boolean;
  phone: string;
  address: string;
  donorProfile?: {
    orgName: string;
    donorType: string;
    points: number;
    badge: 'Bronze' | 'Silver' | 'Gold' | 'Food Hero';
  };
  ngoProfile?: {
    capacity: number;
    regNumber: string;
    documentUrl?: string;
  };
  volunteerProfile?: {
    availability: boolean;
    vehicleType?: string;
    distanceTravelled: number;
    mealsTransported: number;
  };
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('foodbridge_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.get('/auth/me');
      setUser(data);
    } catch {
      localStorage.removeItem('foodbridge_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('foodbridge_token', res.token);
      setUser(res.user);
      return res.user;
    } catch (err) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any): Promise<User> => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', data);
      localStorage.setItem('foodbridge_token', res.token);
      setUser(res.user);
      return res.user;
    } catch (err) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('foodbridge_token');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const data = await api.get('/auth/me');
      setUser(data);
    } catch (err) {
      console.error('Failed to refresh user', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
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
