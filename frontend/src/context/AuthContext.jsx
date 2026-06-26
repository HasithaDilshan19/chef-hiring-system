import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('chef_hiring_token') || null);
  const [loading, setLoading] = useState(true);
  const [systemName, setSystemName] = useState('ChefHire');
  const [systemLogo, setSystemLogo] = useState(null);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data?.settings?.system_name) {
        setSystemName(res.data.settings.system_name);
      }
      if (res.data?.settings?.system_logo) {
        setSystemLogo(res.data.settings.system_logo);
      }
    } catch (err) {
      console.error('Failed to load system settings');
    }
  };

  // Fetch public settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  // Update document title and favicon dynamically when system settings change
  useEffect(() => {
    document.title = systemName;
    
    if (systemLogo) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = systemLogo;
    }
  }, [systemName, systemLogo]);

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
      
      if (authToken) {
        localStorage.setItem('chef_hiring_token', authToken);
        setToken(authToken);
        setUser(registeredUser);
      }
      // If no authToken, it means the account is pending approval (e.g. chef)
      return { success: true, user: registeredUser, isPending: !authToken, message: response.data.message };
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
    systemName,
    systemLogo,
    fetchSettings,
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
