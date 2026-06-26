import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('chef_hiring_token') || null);
  const [loading, setLoading] = useState(true);

  // Check if token exists on mount and fetch user details
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await api.get('/me');
          setUser(response.data.data.user);
        } catch (error) {
          console.error('Failed to restore session:', error);
          // Token is invalid or expired
          logoutLocal();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/login', { email, password });
      const { user: loggedUser, token: authToken } = response.data.data;
      
      localStorage.setItem('chef_hiring_token', authToken);
      setToken(authToken);
      setUser(loggedUser);
      return { success: true, user: loggedUser };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      const response = await api.post('/register', data);
      const { user: registeredUser, token: authToken } = response.data.data;
      
      localStorage.setItem('chef_hiring_token', authToken);
      setToken(authToken);
      setUser(registeredUser);
      return { success: true, user: registeredUser };
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed.';
      const errors = error.response?.data?.errors || null;
      return { success: false, message, errors };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      logoutLocal();
    }
  };

  const logoutLocal = () => {
    localStorage.removeItem('chef_hiring_token');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const isAdmin = () => user?.role === 'admin';
  const isChef = () => user?.role === 'chef';
  const isUser = () => user?.role === 'user';

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isChef,
    isUser,
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
