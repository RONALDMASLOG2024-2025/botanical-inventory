"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { signInWithGoogle } from "../../lib/auth";
import Button from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Leaf, Shield, CheckCircle2 } from "lucide-react";

// Google icon SVG
function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug: Check if we're running in browser
  useEffect(() => {
    console.log("📄 Admin Login Page mounted");
    console.log("  Environment:", typeof window !== 'undefined' ? 'Browser' : 'Server');
    console.log("  Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing");
  }, []);

  async function handleGoogleSignIn() {
    console.log("🖱️ Google Sign In button clicked");
    setLoading(true);
    setError(null);
    
    console.log("⏳ Calling signInWithGoogle()...");
    const result = await signInWithGoogle();
    console.log("📨 Sign in result:", result);
    
    if (!result.success) {
      console.error("❌ Sign in failed:", result.error);
      setError(result.error || "Failed to sign in");
      setLoading(false);
    } else {
      console.log("✅ Sign in successful, redirecting...");
      // If successful, user will be redirected by OAuth flow
    }
  }

  return (
    <section className="flex items-center justify-center min-h-[80vh] py-12">
      <div className="w-full max-w-md mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3 text-[hsl(var(--foreground))]">Admin Access</h1>
          <p className="text-lg text-[hsl(var(--muted-foreground))]">
            Sign in with your authorized Google account
          </p>
        </div>

        <Card className="border-[hsl(var(--border))] shadow-lg bg-[hsl(var(--card))]">
          <CardHeader>
            <CardTitle>Secure Authentication</CardTitle>
            <CardDescription>
              Access the botanical garden management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Sign In Button */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              variant="outline"
              size="lg"
              className="w-full gap-3 h-12 text-base"
            >
              <GoogleIcon />
              {loading ? "Signing in..." : "Sign in with Google"}
            </Button>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-[hsl(var(--destructive))/0.1] border border-[hsl(var(--destructive))/0.3]">
                <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>
              </div>
            )}

            {/* Info Box */}
            <div className="p-4 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
              <div className="flex gap-2">
                <Leaf className="h-5 w-5 text-[hsl(var(--primary))] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium mb-1">Admin Access Only</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Only pre-registered admin accounts can access the dashboard. Contact the garden administrator if you need access.
                  </p>
                </div>
              </div>
            </div>

            {/* How it Works */}
            <div className="pt-4 border-t border-[hsl(var(--border))]">
              <h3 className="text-sm font-semibold mb-3">How it works:</h3>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-[hsl(var(--primary))] flex-shrink-0 mt-0.5" />
                  <span className="text-[hsl(var(--foreground))]">Sign in with your registered Google account</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-[hsl(var(--primary))] flex-shrink-0 mt-0.5" />
                  <span className="text-[hsl(var(--foreground))]">System verifies you&apos;re a pre-registered admin</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-[hsl(var(--primary))] flex-shrink-0 mt-0.5" />
                  <span className="text-[hsl(var(--foreground))]">Access granted to admin dashboard</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Public Access Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Just browsing?{" "}
            <Link href="/plants" className="text-[hsl(var(--primary))] hover:underline font-medium">
              Explore our plant collection
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
