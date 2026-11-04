import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check current session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await api.auth.me();
        setUser(data.user);
      } catch (err) {
        setUser(null);
        setAuthToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const data = await api.auth.login({ email, password });
    if (data.token) {
      setAuthToken(data.token);
    }
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await api.auth.register({ name, email, password });
    if (data.token) {
      setAuthToken(data.token);
    }
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      // Ignore logout errors
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  };

  const deleteAccount = async (password) => {
    const res = await api.account.deleteAccount(password);
    setAuthToken(null);
    setUser(null);
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, deleteAccount }}>
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
