import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) {
      try {
        const payload = JSON.parse(atob(stored.split('.')[1]));
        setUser({ id: payload.userId, email: payload.email });
        setToken(stored);
      } catch {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  function login(userData, tkn) {
    localStorage.setItem('token', tkn);
    setUser(userData);
    setToken(tkn);
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
