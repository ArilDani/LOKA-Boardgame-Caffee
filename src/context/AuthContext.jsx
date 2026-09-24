import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);
const API = import.meta.env.VITE_API_URL || "/api";

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem("loka_token"));
  const [loading, setLoading] = useState(true);

  // Fetch current user from token
  const fetchMe = useCallback(async (tkn) => {
    if (!tkn) { setLoading(false); return; }
    try {
      const res = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${tkn}` } });
      if (res.ok) { setUser(await res.json()); }
      else { localStorage.removeItem("loka_token"); setToken(null); }
    } catch { localStorage.removeItem("loka_token"); setToken(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMe(token); }, [token, fetchMe]);

  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login gagal");
    localStorage.setItem("loka_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password, phone) => {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registrasi gagal");
    localStorage.setItem("loka_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("loka_token");
    setToken(null);
    setUser(null);
  };

  const refreshUser = () => fetchMe(token);

  const authFetch = useCallback((url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}), Authorization: `Bearer ${token}` },
    });
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser, authFetch, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
