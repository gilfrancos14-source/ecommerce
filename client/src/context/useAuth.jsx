import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);

export default function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
