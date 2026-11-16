"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile, UserRole } from "@/types/database";
import { MOCK_USERS } from "@/lib/data/mock-data";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isLoading: boolean;
  isSupabaseLive: boolean;
  signIn: (email: string, password?: string, asRole?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>("operator");
  const [isLoading, setIsLoading] = useState(true);
  const isSupabaseLive = isSupabaseConfigured();

  useEffect(() => {
    async function initAuth() {
      if (isSupabaseLive) {
        const supabase = createClient();
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Fetch profile
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (profile) {
              setUser({
                id: profile.id,
                email: profile.email,
                full_name: profile.full_name,
                role: profile.role as UserRole,
                created_at: profile.created_at,
              });
              setRole(profile.role as UserRole);
            } else {
              setUser({
                id: session.user.id,
                email: session.user.email || "user@contact-center.corp",
                full_name: session.user.user_metadata?.full_name || "Оператор КЦ",
                role: (session.user.user_metadata?.role as UserRole) || "operator",
              });
              setRole((session.user.user_metadata?.role as UserRole) || "operator");
            }
          }
        }
      } else {
        // Local Demo Mode
        const savedSession = localStorage.getItem("cc_auth_session");
        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession);
            setUser(parsed);
            setRole(parsed.role || "operator");
          } catch {
            localStorage.removeItem("cc_auth_session");
          }
        } else {
          // Default to operator in demo mode if on client
          const defaultUser = MOCK_USERS.operator;
          setUser(defaultUser);
          setRole("operator");
          localStorage.setItem("cc_auth_session", JSON.stringify(defaultUser));
          document.cookie = `cc_auth_session=1; path=/; max-age=86400; SameSite=Lax`;
        }
      }
      setIsLoading(false);
    }

    initAuth();
  }, [isSupabaseLive]);

  const signIn = async (
    email: string,
    password?: string,
    asRole?: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    if (isSupabaseLive) {
      const supabase = createClient();
      if (!supabase) return { success: false, error: "Supabase client unavailable" };

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || "Password123!",
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        const userRole = (profile?.role as UserRole) || "operator";
        const userObj: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          full_name: profile?.full_name || data.user.user_metadata?.full_name || email.split("@")[0],
          role: userRole,
        };
        setUser(userObj);
        setRole(userRole);
      }
    } else {
      // Demo authentication simulation
      const selectedRole = asRole || (email.toLowerCase().includes("admin") ? "admin" : "operator");
      const demoUser = MOCK_USERS[selectedRole];
      setUser(demoUser);
      setRole(selectedRole);
      localStorage.setItem("cc_auth_session", JSON.stringify(demoUser));
      document.cookie = `cc_auth_session=1; path=/; max-age=86400; SameSite=Lax`;
    }

    setIsLoading(false);
    return { success: true };
  };

  const signOut = async () => {
    if (isSupabaseLive) {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    setUser(null);
    localStorage.removeItem("cc_auth_session");
    document.cookie = `cc_auth_session=; path=/; max-age=0; SameSite=Lax`;
  };

  const switchRole = (newRole: UserRole) => {
    const targetUser = MOCK_USERS[newRole];
    setUser(targetUser);
    setRole(newRole);
    localStorage.setItem("cc_auth_session", JSON.stringify(targetUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        isSupabaseLive,
        signIn,
        signOut,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
