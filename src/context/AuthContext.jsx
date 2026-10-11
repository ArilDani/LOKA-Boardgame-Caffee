import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

// ============================================================
// LOKA BOARDGAME CAFE — Auth Context (Supabase)
// ============================================================

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  // ── Fetch profile — read-only path, NEVER overwrites existing rows
  const fetchProfile = useCallback(async (userId) => {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      // Profile found — return it (respects role from DB, including admin)
      if (data) return data;

      // PGRST116 = no row → insert a DEFAULT profile for brand-new users
      // ignoreDuplicates: true = NEVER overwrite an existing row (safe for admins)
      if (error?.code === "PGRST116") {
        await supabase
          .from("profiles")
          .upsert(
            { id: userId, role: "user", points: 0, total_spent: 0, membership: "Bronze" },
            { onConflict: "id", ignoreDuplicates: true }
          );
        const { data: fresh } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        return fresh || null;
      }

      console.error("fetchProfile error:", error);
      setProfileError(JSON.stringify(error));
      return null;
    } catch (err) {
      console.error("fetchProfile exception:", err);
      setProfileError(err.message);
      return null;
    }
  }, []);

  // ── Listen to Supabase auth state changes
  useEffect(() => {
    setLoading(true);

    // On every page load: always re-fetch fresh profile from DB
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        const prof = await fetchProfile(session.user.id);
        setProfile(prof);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    // Subscribe to auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
          const prof = await fetchProfile(session.user.id);
          setProfile(prof);
          setLoading(false);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
        // INITIAL_SESSION handled by getSession() above
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // ── Login
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data.user;
  };

  // ── Register (sends confirmation email)
  const register = async (name, email, password, phone) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw new Error(error.message);
    return data.user;
  };

  // ── Logout
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // ── Force refresh profile from DB
  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;
    const prof = await fetchProfile(user.id);
    setProfile(prof);
  }, [user, fetchProfile]);

  // ── Update profile
  const updateProfile = async (updates) => {
    if (!user?.id) return;
    const { error } = await supabase
      .from("profiles")
      .update({ ...updates })
      .eq("id", user.id);
    if (error) throw new Error(error.message);
    await refreshProfile();
  };

  const isAdmin         = profile?.role === "admin";
  const isEmailVerified = !!user?.email_confirmed_at;

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      login,
      register,
      logout,
      refreshProfile,
      updateProfile,
      isAdmin,
      isEmailVerified,
    }}>
      {profileError && (
        <div style={{ background: "red", color: "white", padding: "10px", zIndex: 9999, position: "fixed", top: 0, left: 0, right: 0 }}>
          PROFILE FETCH ERROR: {profileError}
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
