import { useEffect, useState } from "react";

export type Role = "admin" | "reader";

interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem("devnotes_auth");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === "admin";

  const signIn = (email: string) => {
    setLoading(true);
    // Simulate auth logic
    const role: Role = (email.toLowerCase().includes("admin") || email === "farhanbasheerfarhan399@gmail.com") 
      ? "admin" 
      : "reader";
    const newUser: AuthUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      role
    };
    localStorage.setItem("devnotes_auth", JSON.stringify(newUser));
    setUser(newUser);
    setLoading(false);
  };

  const signOut = () => {
    localStorage.removeItem("devnotes_auth");
    setUser(null);
  };

  return { 
    session: user ? { user } : null, 
    user, 
    isAdmin, 
    loading,
    signIn,
    signOut
  };
}
