import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setOnUnauthorized } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => setUser(null));
    return () => setOnUnauthorized(null);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    setUser(data.user);
    return data.user;
  };

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch { /* best-effort */ }
    setUser(null);
  }, []);

  const updateProfile = async (formData) => {
    const { data } = await api.put('/auth/profile', formData);
    setUser(data.user);
    return data.user;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export default function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
