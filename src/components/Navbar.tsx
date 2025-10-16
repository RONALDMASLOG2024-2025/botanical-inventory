"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isAdmin, signOut as authSignOut, onAuthStateChange } from "../lib/auth";
import Button from "./ui/button";
import ThemeToggle from "./ThemeToggle";
import { Leaf, Search, LogOut, LayoutDashboard, Menu, X } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Initial auth check
    async function checkAuth() {
      const adminStatus = await isAdmin();
      setSignedIn(adminStatus);
      setChecking(false);
    }
    checkAuth();

    // Subscribe to auth changes
    const subscription = onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const adminStatus = await isAdmin();
        setSignedIn(adminStatus);
        setUserEmail(session.user.email || null);
      } else if (event === 'SIGNED_OUT') {
        setSignedIn(false);
        setUserEmail(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await authSignOut();
    setSignedIn(false);
    setUserEmail(null);
    router.push("/");
  }

  function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const q = String(data.get("q") ?? "").trim();
    router.push(`/plants${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[hsl(var(--border))/0.4] bg-[hsl(var(--background))/0.95] backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))/0.6]">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
            <Leaf className="h-5 w-5" />
          </div>
          <div className="hidden flex-col md:flex">
            <span className="font-bold leading-tight">Botanical Garden</span>
            <span className="text-xs text-[hsl(var(--muted-foreground))] leading-tight">Inventory System</span>
          </div>
        </Link>

        {/* Search Bar - Center/Right Section */}
        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="hidden w-full max-w-sm md:block lg:max-w-md">
            <form onSubmit={onSearch} className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <input
                name="q"
                placeholder="Search plants..."
                className="h-9 w-full rounded-md border border-[hsl(var(--input))] bg-transparent px-10 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--ring))] disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 h-7 -translate-y-1/2"
              >
                Search
              </Button>
            </form>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden items-center gap-2 md:flex">
            <Link href="/plants">
              <Button variant="ghost" size="sm">
                Explore Plants
              </Button>
            </Link>

            {!checking && (
              <>
                {signedIn ? (
                  <>
                    <Link href="/admin/dashboard">
                      <Button variant="ghost" size="sm">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm">
                      Admin Access
                    </Button>
                  </Link>
                )}
              </>
            )}

            <ThemeToggle />

            {!checking && signedIn && (
              <>
                {userEmail && (
                  <div className="hidden rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-1.5 text-xs font-medium lg:block">
                    {userEmail}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive))]"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-[hsl(var(--border))] md:hidden">
          <div className="container mx-auto px-4 py-4 sm:px-6">
            <nav className="flex flex-col space-y-3">
              <Link href="/plants" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Explore Plants
                </Button>
              </Link>

            {!checking && (
              <>
                {signedIn ? (
                  <>
                    <Link href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Admin Access
                    </Button>
                  </Link>
                )}
              </>
            )}

              <div className="flex items-center justify-between border-y border-[hsl(var(--border))] py-3">
                <span className="text-sm font-medium">Theme</span>
                <ThemeToggle />
              </div>

            {!checking && signedIn && (
              <>
                {userEmail && (
                  <div className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-2 text-xs font-medium">
                    {userEmail}
                  </div>
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive))]"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            )}
          </nav>
          </div>
        </div>
      )}
    </nav>
  );
}
