"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdmin, getCurrentUser } from "../../../lib/auth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your credentials...");

  useEffect(() => {
    async function handleCallback() {
      console.log("🔄 Auth callback started");
      
      try {
        // Wait a moment for the session to be established
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if user is authenticated
        console.log("👤 Checking user authentication...");
        const user = await getCurrentUser();
        console.log("User data:", user);
        
        if (!user) {
          console.error("❌ No user found");
          setStatus("error");
          setMessage("Authentication failed. Please try again.");
          setTimeout(() => router.push("/admin"), 2000);
          return;
        }

        console.log("✅ User authenticated:", user.email);

        // Check if user is an admin
        console.log("🔐 Checking admin status...");
        const userIsAdmin = await isAdmin();
        console.log("Admin status:", userIsAdmin);
        
        if (!userIsAdmin) {
          console.warn("⚠️ User is not an admin");
          setStatus("error");
          setMessage(`Access denied. ${user.email} is not a registered admin. Please contact the administrator to grant access.`);
          setTimeout(() => router.push("/"), 3000);
          return;
        }

        // Success - redirect to dashboard
        console.log("✅ Admin access granted!");
        setStatus("success");
        setMessage(`Welcome back, ${user.email}! Redirecting to dashboard...`);
        setTimeout(() => router.push("/admin/dashboard"), 1000);

      } catch (error) {
        console.error("❌ Auth callback error:", error);
        setStatus("error");
        setMessage(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setTimeout(() => router.push("/admin"), 2000);
      }
    }

    handleCallback();
  }, [router]);

  return (
    <section className="relative min-h-screen flex items-center justify-center">
      {/* Floating Bubbles Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Bubbles */}
        <div className="absolute -left-4 top-20 h-64 w-64 animate-float rounded-full bg-emerald-400/30 blur-3xl"></div>
        <div className="absolute -right-8 top-40 h-56 w-56 animate-float-delay-2 rounded-full bg-green-400/25 blur-3xl"></div>
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 animate-float-delay-5 rounded-full bg-teal-400/20 blur-3xl"></div>
        <div className="absolute left-1/4 bottom-1/4 h-40 w-40 animate-float-delay-3 rounded-full bg-emerald-500/25 blur-2xl"></div>
        <div className="absolute right-1/4 bottom-1/3 h-48 w-48 animate-float-delay-7 rounded-full bg-green-300/20 blur-2xl"></div>
      </div>

      {/* Grid Background */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[hsl(var(--background))] bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:14px_24px] opacity-50 dark:opacity-30"></div>

      {/* Content */}
      <div className="relative z-10 max-w-md w-full mx-4">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-xl">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {status === "loading" && (
              <div className="w-16 h-16 rounded-full bg-[hsl(var(--primary))/0.1] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {status === "success" && (
              <div className="w-16 h-16 rounded-full bg-[hsl(var(--primary))/0.1] flex items-center justify-center">
                <svg className="w-10 h-10 text-[hsl(var(--primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            
            {status === "error" && (
              <div className="w-16 h-16 rounded-full bg-[hsl(var(--destructive))/0.1] flex items-center justify-center">
                <svg className="w-10 h-10 text-[hsl(var(--destructive))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>

          {/* Status Message */}
          <div className="text-center">
            <h1 className={`text-2xl font-bold mb-3 ${
              status === "loading" ? "text-[hsl(var(--foreground))]" :
              status === "success" ? "text-[hsl(var(--primary))]" :
              "text-[hsl(var(--destructive))]"
            }`}>
              {status === "loading" && "Authenticating..."}
              {status === "success" && "Authentication Successful"}
              {status === "error" && "Authentication Failed"}
            </h1>
            
            <p className="text-[hsl(var(--muted-foreground))] text-lg">
              {message}
            </p>
          </div>

          {/* Loading Animation */}
          {status === "loading" && (
            <div className="mt-6 flex justify-center gap-1.5">
              <div className="w-2 h-2 bg-[hsl(var(--primary))] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-2 h-2 bg-[hsl(var(--primary))] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-2 h-2 bg-[hsl(var(--primary))] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          )}

          {/* Error Actions */}
          {status === "error" && (
            <div className="mt-6 space-y-3">
              <button
                onClick={() => router.push("/admin")}
                className="w-full px-4 py-3 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))/0.9] text-[hsl(var(--primary-foreground))] rounded-lg font-semibold transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full px-4 py-3 bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted))/0.8] text-[hsl(var(--foreground))] rounded-lg font-semibold transition-colors"
              >
                Return to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
