"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api/client";

interface User {
  id: number;
  email: string;
  role: "patient" | "practitioner";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        try {
          const res = await api.get("/auth/me");
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem("token");
          delete api.defaults.headers.common["Authorization"];
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!user && (pathname.startsWith("/patient") || pathname.startsWith("/practitioner") || pathname === "/dashboard")) {
        router.push("/login");
      } else if (user) {
        if (pathname === "/login" || pathname === "/register") {
          router.push(`/${user.role}/dashboard`);
        } else if (pathname === "/dashboard") {
          router.push(`/${user.role}/dashboard`);
        } else if (pathname.startsWith("/patient") && user.role !== "patient") {
          router.push("/practitioner/dashboard");
        } else if (pathname.startsWith("/practitioner") && user.role !== "practitioner") {
          router.push("/patient/dashboard");
        }
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    api.get("/auth/me").then((res: any) => {
      setUser(res.data);
      router.push(`/${res.data.role}/dashboard`);
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
