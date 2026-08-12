import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

interface User {
  userId: number;
  email: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string,
    phoneNumber?: string,
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("findback_token");
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }
    const storedToken = localStorage.getItem("findback_token");
    const storedUser = localStorage.getItem("findback_user");
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("findback_token");
        localStorage.removeItem("findback_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Login failed: ${response.status}`);
    }
    const data = await response.json();

    const userData = {
      userId: data.userId,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("findback_token", data.token);
      localStorage.setItem("findback_user", JSON.stringify(userData));
    }
    setToken(data.token);
    setUser(userData);
  }, []);

  const register = useCallback(
    async (email: string, password: string, fullName: string, phoneNumber?: string) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, phoneNumber }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Registration failed: ${response.status}`);
      }
      const data = await response.json();

      const userData = {
        userId: data.userId,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("findback_token", data.token);
        localStorage.setItem("findback_user", JSON.stringify(userData));
      }
      setToken(data.token);
      setUser(userData);
    },
    [],
  );

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("findback_token");
      localStorage.removeItem("findback_user");
    }
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, isAuthenticated: !!token, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
