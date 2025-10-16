"use client";
import { supabase } from "./supabaseClient";

/**
 * Sign in with Google OAuth
 * Only pre-registered admins in the database can access admin features
 */
export async function signInWithGoogle() {
  console.log("🔐 Starting Google Sign In...");
  console.log("  Window origin:", window.location.origin);
  console.log("  Redirect URL:", `${window.location.origin}/admin/callback`);
  
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/admin/callback`,
      },
    });
    
    console.log("📡 OAuth Response:");
    console.log("  Data:", data);
    console.log("  Error:", error);
    
    if (error) {
      console.error("❌ Google sign-in error:", error);
      return { success: false, error: error.message };
    }
    
    console.log("✅ OAuth initiated successfully!");
    return { success: true, data };
  } catch (err: any) {
    console.error("❌ Sign-in exception:", err);
    return { success: false, error: err.message || "Failed to sign in" };
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign-out error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error("Sign-out exception:", err);
    return { success: false, error: err.message || "Failed to sign out" };
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Get session error:", error);
      return null;
    }
    
    return session?.user || null;
  } catch (err) {
    console.error("Get user exception:", err);
    return null;
  }
}

/**
 * Check if the current user is an admin by verifying their email in the users table
 */
export async function isAdmin() {
  console.log("🔍 Checking admin status...");
  
  try {
    const user = await getCurrentUser();
    console.log("  Current user:", user?.email || "None");
    
    if (!user || !user.email) {
      console.log("  ❌ No user or email found");
      return false;
    }
    
    // Check if user exists in the users table with role 'admin'
    console.log("  📊 Querying users table for:", user.email);
    const { data, error } = await supabase
      .from('users')
      .select('role, email')
      .eq('email', user.email)
      .eq('role', 'admin')
      .single();
    
    if (error) {
      console.error("  ❌ Admin check error:", error.message);
      console.error("  Error details:", error);
      
      // Check if it's a "no rows" error
      if (error.code === 'PGRST116') {
        console.warn(`  ⚠️ User ${user.email} not found in users table or not an admin`);
        return false;
      }
      
      return false;
    }
    
    console.log("  ✅ Admin check result:", data);
    return !!data;
  } catch (err) {
    console.error("  ❌ Admin check exception:", err);
    return false;
  }
}

/**
 * Check if user is signed in (has active session)
 */
export async function isSignedIn() {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription;
}
