import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('findora_token') || null);
  const [loading, setLoading] = useState(true);

  // Restore session on load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('findora_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await authAPI.getMe();
        if (res.data?.success && res.data?.user) {
          setUser(res.data.user);
          setToken(storedToken);
        }
      } catch (error) {
        // Token invalid or expired
        localStorage.removeItem('findora_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      const { token: receivedToken, user: receivedUser } = res.data;

      localStorage.setItem('findora_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);

      toast.success(`Welcome back, ${receivedUser.name.split(' ')[0]}!`);
      return { success: true, user: receivedUser };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    try {
      const res = await authAPI.register({ name, email, password, confirmPassword });
      const { token: receivedToken, user: receivedUser } = res.data;

      localStorage.setItem('findora_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);

      toast.success('Account created! Welcome to Findora.');
      return { success: true, user: receivedUser };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Continue cleanup regardless of server response
    } finally {
      localStorage.removeItem('findora_token');
      setToken(null);
      setUser(null);
      toast.success('Signed out successfully.');
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    loading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
