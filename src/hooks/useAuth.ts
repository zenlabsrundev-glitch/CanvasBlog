import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

export type Role = "admin" | "user" | "reader"; // Adjusted to match user response "user"

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "admin";

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("devnotes_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/auth/me");
      // The /me endpoint returns user info. We might need to fetch the full user object if needed.
      // Based on the user's provided response for /me:
      // { "id": "...", "email": "...", "role": "...", "iat": ..., "exp": ... }
      setUser(response.data);
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("devnotes_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem("devnotes_token", token);
      setUser(userData);
      return { success: true };
    } catch (error: any) {
      console.error("Login failed:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Login failed. Please check your credentials." 
      };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: Role = "user") => {
    setLoading(true);
    try {
      await api.post("/auth/register", { name, email, password, role });
      // After registration, we usually login automatically or redirect to login.
      // Let's try to login automatically.
      return await signIn(email, password);
    } catch (error: any) {
      console.error("Signup failed:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Registration failed. Email might already be in use." 
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem("devnotes_token");
    setUser(null);
  };

  return { 
    session: user ? { user } : null, 
    user, 
    isAdmin, 
    loading,
    signIn,
    signUp,
    signOut,
    checkAuth
  };
}
