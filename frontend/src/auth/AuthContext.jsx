import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// API URL should match your backend port
const API_URL = 'http://localhost:5001/api/auth'; 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Initialize user state from localStorage
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('gameUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to save user data and token to state and localStorage
  const saveUser = (userData) => {
    setUser(userData);
    localStorage.setItem('gameUser', JSON.stringify(userData));
    setError(null);
  };

  const register = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/register`, { username, password });
      saveUser(response.data);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
      setLoading(false);
      return false;
    }
  };

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/login`, { username, password });
      saveUser(response.data);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gameUser');
  };

  // Provide the user and functions through the context
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};