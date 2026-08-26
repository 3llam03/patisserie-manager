import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

let memoryToken = null;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('user');
      memoryToken = localStorage.getItem('token');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  const loginUser = (token, userData) => {
    memoryToken = token;
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch {}
    setUser(userData);
  };

  const logoutUser = () => {
    memoryToken = null;
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export const getToken = () => memoryToken;
