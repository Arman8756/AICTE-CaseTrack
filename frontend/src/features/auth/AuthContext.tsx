import React, { createContext, useContext, useState, useCallback } from "react";
import type { AuthUser } from "../../types";
import { login as apiLogin, logout as apiLogout } from "../../api/auth";
import type { LoginPayload } from "../../api/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = sessionStorage.getItem("auth_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (payload: LoginPayload) => {
    const authUser = await apiLogin(payload);
    sessionStorage.setItem("access_token", authUser.access_token);
    sessionStorage.setItem("refresh_token", authUser.refresh_token);
    sessionStorage.setItem("auth_user", JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const logout = useCallback(() => {
    apiLogout().catch(() => {});
    sessionStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
