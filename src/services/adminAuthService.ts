import { supabase } from "../integrations/supabase/client";

export const adminAuthService = {
  async signInAdmin(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Check if user is in admin_profiles
    const { data: profile, error: profileError } = await supabase
      .from("admin_profiles")
      .select("role")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (profileError || !profile || profile.role !== "admin") {
      await supabase.auth.signOut();
      throw new Error("Acesso negado. Usuário não é um administrador.");
    }

    return data;
  },

  async signOutAdmin() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async isCurrentUserAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from("admin_profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    return profile?.role === "admin";
  },
};
