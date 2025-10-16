"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Show landing page Navbar on login and callback pages
  // Hide on authenticated admin routes (dashboard, create, edit)
  const isLoginPage = pathname === "/admin";
  const isCallbackPage = pathname === "/admin/callback";
  const isAdminRoute = pathname?.startsWith("/admin");
  
  // Show Navbar on:
  // 1. Non-admin routes (/, /plants, etc.)
  // 2. Admin login page (/admin)
  // 3. Admin callback page (/admin/callback)
  if (!isAdminRoute || isLoginPage || isCallbackPage) {
    return <Navbar />;
  }
  
  // Hide on authenticated admin routes (they have their own navbar)
  return null;
}
