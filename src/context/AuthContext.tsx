import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured, isTableMissingError } from "../lib/supabase";

export interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_path: string | null;
  avatar_url?: string | null;
  onboarding_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUpWithPassword: (email: string, password: string, displayName?: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch or safely auto-provision application profile
  const fetchProfile = useCallback(async (userId: string, authUser?: User): Promise<UserProfile | null> => {
    const rawMeta = authUser?.user_metadata || {};
    const fallbackName =
      rawMeta.full_name ||
      rawMeta.name ||
      authUser?.email?.split("@")[0] ||
      `user_${userId.slice(0, 6)}`;

    const initialUsername =
      (rawMeta.user_name || rawMeta.username || authUser?.email?.split("@")[0] || `user_${userId.slice(0, 6)}`)
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 20) || `user_${userId.slice(0, 6)}`;

    const localProfile: UserProfile = {
      id: userId,
      username: initialUsername,
      display_name: fallbackName,
      bio: "",
      avatar_path: rawMeta.avatar_url || rawMeta.picture || null,
      onboarding_completed: false,
    };

    if (!isSupabaseConfigured) {
      return localProfile;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        if (isTableMissingError(error)) {
          return localProfile;
        }
        console.error("Profile fetch error:", error);
      }

      if (data) {
        return data as UserProfile;
      }

      // If profile does not exist yet in database, upsert initial record
      const newProfilePayload = {
        id: userId,
        username: initialUsername,
        display_name: fallbackName,
        bio: "",
        avatar_path: rawMeta.avatar_url || rawMeta.picture || null,
        onboarding_completed: false,
      };

      const { data: inserted, error: insertError } = await supabase
        .from("profiles")
        .upsert(newProfilePayload)
        .select()
        .single();

      if (insertError) {
        if (isTableMissingError(insertError)) {
          return localProfile;
        }
        console.error("Profile auto-creation error:", insertError);
        return localProfile;
      }

      return inserted as UserProfile;
    } catch (err) {
      console.error("Profile resolution error:", err);
      return localProfile;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    const p = await fetchProfile(user.id, user);
    setProfile(p);
  }, [user, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Centralized session hydration
    supabase.auth
      .getSession()
      .then(async ({ data: { session: initialSession } }) => {
        if (!mounted) return;
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          const p = await fetchProfile(initialSession.user.id, initialSession.user);
          if (mounted) setProfile(p);
        }
      })
      .catch((err) => {
        console.error("Session restoration error:", err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    // Single auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const p = await fetchProfile(currentSession.user.id, currentSession.user);
        if (mounted) setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Google OAuth Sign In
  const signInWithGoogle = async (): Promise<{ error: AuthError | null }> => {
    if (!isSupabaseConfigured) {
      return {
        error: {
          name: "ConfigurationError",
          message: "Supabase credentials are not configured in environment.",
        } as AuthError,
      };
    }

    try {
      const redirectUrl = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      return { error };
    } catch (err: any) {
      return { error: err as AuthError };
    }
  };

  // Password Sign In
  const signInWithPassword = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
    if (!isSupabaseConfigured) {
      return {
        error: {
          name: "ConfigurationError",
          message: "Supabase credentials are not configured in environment.",
        } as AuthError,
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };
      if (data.user) {
        setUser(data.user);
        const p = await fetchProfile(data.user.id, data.user);
        setProfile(p);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err as AuthError };
    }
  };

  // Password Sign Up
  const signUpWithPassword = async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<{ error: AuthError | null }> => {
    if (!isSupabaseConfigured) {
      return {
        error: {
          name: "ConfigurationError",
          message: "Supabase credentials are not configured in environment.",
        } as AuthError,
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: displayName || email.split("@")[0],
          },
        },
      });

      if (error) return { error };
      if (data.user) {
        setUser(data.user);
        const p = await fetchProfile(data.user.id, data.user);
        setProfile(p);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err as AuthError };
    }
  };

  // Sign Out
  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  // Update Profile
  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ error: Error | null }> => {
    if (!user) {
      return { error: new Error("User must be authenticated to update profile") };
    }

    const updateState = (updatedData: Partial<UserProfile>) => {
      setProfile((prev) => {
        const updated = prev
          ? { ...prev, ...updatedData }
          : ({
              id: user.id,
              username: updates.username || "user",
              display_name: updates.display_name || "User",
              bio: updates.bio || "",
              avatar_path: null,
              onboarding_completed: updates.onboarding_completed ?? true,
            } as UserProfile);
        return updated;
      });
    };

    if (!isSupabaseConfigured) {
      updateState(updates);
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        if (isTableMissingError(error)) {
          updateState(updates);
          return { error: null };
        }
        return { error };
      }

      updateState(updates);
      return { error: null };
    } catch (err: any) {
      updateState(updates);
      return { error: null };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isAuthenticated: Boolean(user),
        isConfigured: isSupabaseConfigured,
        signInWithGoogle,
        signInWithPassword,
        signUpWithPassword,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
