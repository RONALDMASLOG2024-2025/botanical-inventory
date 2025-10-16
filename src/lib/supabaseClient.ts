"use client";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Debug logging
console.log("🔧 Supabase Client Initialization:");
console.log("  URL:", supabaseUrl ? "✅ Set" : "❌ Missing");
console.log("  Anon Key:", supabaseAnonKey ? "✅ Set" : "❌ Missing");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase configuration is incomplete!");
  console.error("  NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl || "NOT SET");
  console.error("  NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "SET (hidden)" : "NOT SET");
  throw new Error("Supabase environment variables are not configured. Check your .env.local file.");
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

console.log("✅ Supabase client created successfully");
console.log("  Auth available:", !!supabase.auth);
console.log("  Storage available:", !!supabase.storage);
