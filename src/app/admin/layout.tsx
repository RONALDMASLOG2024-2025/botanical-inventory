"use client";
import { useEffect, useState } from "react";
import { Moon, Sun, LogOut, LayoutDashboard, Home, Plus, Leaf } from "lucide-react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // Sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/admin");
  };

  // Check if current path is active
  const isActive = (path: string) => pathname === path;

  // Don't show admin navbar on login/callback pages or if not authenticated
  const showAdminNavbar = isAuthenticated && pathname !== "/admin" && pathname !== "/admin/callback";

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Floating Bubbles Background - Same as landing page */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-4 top-20 h-64 w-64 animate-float rounded-full bg-emerald-400/30 blur-3xl dark:bg-emerald-400/20"></div>
        <div className="absolute -right-8 top-40 h-56 w-56 animate-float-delay-2 rounded-full bg-green-400/25 blur-3xl dark:bg-green-400/15"></div>
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 animate-float-delay-5 rounded-full bg-teal-400/20 blur-3xl dark:bg-teal-400/10"></div>
        <div className="absolute left-1/4 bottom-1/4 h-40 w-40 animate-float-delay-3 rounded-full bg-emerald-500/25 blur-2xl dark:bg-emerald-500/15"></div>
        <div className="absolute right-1/4 bottom-1/3 h-48 w-48 animate-float-delay-7 rounded-full bg-green-300/20 blur-2xl dark:bg-green-300/10"></div>
        <div className="absolute bottom-20 left-1/3 h-36 w-36 animate-float-delay-4 rounded-full bg-cyan-400/25 blur-2xl dark:bg-cyan-400/15"></div>
      </div>

      {/* Grid Background - Same as landing page */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:14px_24px] opacity-50 dark:opacity-30"></div>

      {/* Beautiful Admin Header with Gradient - Only show when authenticated */}
      {showAdminNavbar && (
      <header className="sticky top-0 z-50 w-full border-b border-[hsl(var(--border))/0.4] bg-[hsl(var(--background))/0.95] backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))/0.6]">
        <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo with Gradient */}
            <Link href="/admin/dashboard" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 opacity-75 blur-sm group-hover:opacity-100 transition-opacity"></div>
                <div className="relative h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                  <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="hidden flex-col md:flex">
                <span className="font-bold leading-tight">Admin Panel</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))] leading-tight flex items-center gap-1">
                  <Leaf className="h-3 w-3" />
                  Botanical Inventory
                </span>
              </div>
            </Link>

            {/* Navigation Pills */}
            <nav className="hidden md:flex items-center gap-2">
              <Link
                href="/admin/dashboard"
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all ${
                  isActive("/admin/dashboard")
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                    : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] hover:shadow-md"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/admin/create"
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all ${
                  isActive("/admin/create")
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                    : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] hover:shadow-md"
                }`}
              >
                <Plus className="h-4 w-4" />
                New Plant
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] hover:shadow-md"
              >
                <Home className="h-4 w-4" />
                View Site
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle with Gradient */}
              <button
                onClick={toggleTheme}
                className="inline-flex items-center justify-center rounded-full p-2 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-all"
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </button>

              {/* Sign Out with Gradient Hover */}
              <button
                onClick={handleSignOut}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full text-[hsl(var(--destructive))] hover:bg-[hsl(var(--muted))] transition-all border border-[hsl(var(--border))]"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
              
              {/* Mobile Sign Out (Icon Only) */}
              <button
                onClick={handleSignOut}
                className="sm:hidden inline-flex items-center justify-center p-2 rounded-full text-[hsl(var(--destructive))] hover:bg-[hsl(var(--muted))] transition-all"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>
      )}

      {/* Main Content with proper z-index and spacing */}
      <main className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
