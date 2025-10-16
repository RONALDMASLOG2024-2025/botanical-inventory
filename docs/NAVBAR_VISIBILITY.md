# Navbar Visibility Logic

## Overview
The application has two different navbar systems:
1. **Landing Page Navbar** (`Navbar.tsx`) - Public-facing navigation
2. **Admin Panel Navbar** (`AdminLayout.tsx`) - Admin-specific navigation

## Visibility Rules

### Landing Page Navbar Shows On:
✅ **Public routes**: `/`, `/plants`, `/plants/[id]`, etc.
✅ **Admin login page**: `/admin` (not authenticated)
✅ **Auth callback page**: `/admin/callback` (during authentication)

### Admin Panel Navbar Shows On:
✅ **Dashboard**: `/admin/dashboard` (authenticated)
✅ **Create page**: `/admin/create` (authenticated)
✅ **Edit pages**: `/admin/plants/[id]/edit` (authenticated)

## Implementation

### 1. ConditionalNavbar Component
**File**: `src/components/ConditionalNavbar.tsx`

```typescript
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
```

**Logic Breakdown:**
1. Check if current path is `/admin` (login page)
2. Check if current path is `/admin/callback` (auth redirect)
3. Check if path starts with `/admin` (any admin route)
4. **Show landing navbar** if NOT admin route OR is login/callback
5. **Hide landing navbar** if authenticated admin route

### 2. Admin Layout Component
**File**: `src/app/admin/layout.tsx`

```typescript
// Check authentication status
const [isAuthenticated, setIsAuthenticated] = useState(false);

useEffect(() => {
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };
  
  checkAuth();
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setIsAuthenticated(!!session);
  });
  
  return () => subscription.unsubscribe();
}, []);

// Don't show admin navbar on login/callback pages or if not authenticated
const showAdminNavbar = isAuthenticated && pathname !== "/admin" && pathname !== "/admin/callback";

return (
  <div>
    {/* Admin navbar only renders when authenticated */}
    {showAdminNavbar && (
      <header>...</header>
    )}
    
    <main>{children}</main>
  </div>
);
```

**Logic Breakdown:**
1. Monitor authentication state via Supabase
2. Check current pathname
3. **Show admin navbar** only if:
   - User is authenticated AND
   - Path is NOT `/admin` (login) AND
   - Path is NOT `/admin/callback` (auth flow)

## Flow Diagram

```
User Navigation Flow:

┌─────────────────────────────────────────────────────────────┐
│                    Landing Page (/)                          │
│              Shows: Landing Page Navbar                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Admin Login (/admin)                            │
│              Shows: Landing Page Navbar                      │
│              (User not authenticated yet)                    │
└─────────────────────────────────────────────────────────────┘
                            │
                    Click "Sign in with Google"
                            ▼
┌─────────────────────────────────────────────────────────────┐
│          Auth Callback (/admin/callback)                     │
│              Shows: Landing Page Navbar                      │
│              (Authentication in progress)                    │
└─────────────────────────────────────────────────────────────┘
                            │
                    Authentication Complete
                            ▼
┌─────────────────────────────────────────────────────────────┐
│            Dashboard (/admin/dashboard)                      │
│              Shows: Admin Panel Navbar                       │
│              Hides: Landing Page Navbar                      │
│              (User is authenticated)                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│          Create Plant (/admin/create)                        │
│              Shows: Admin Panel Navbar                       │
│              Hides: Landing Page Navbar                      │
│              (User is authenticated)                         │
└─────────────────────────────────────────────────────────────┘
```

## Navbar Comparison

### Landing Page Navbar Features:
- 🌿 Botanical Garden logo
- 🔍 Search bar
- 🏠 "Explore Plants" link
- 🔐 "Admin Access" link (when not logged in)
- 📊 "Dashboard" link (when logged in as admin)
- 🌓 Theme toggle
- 👤 User email display (when logged in)
- 🚪 Logout button (when logged in)
- 📱 Mobile menu

### Admin Panel Navbar Features:
- ✨ Gradient logo with 3D effect
- 🎨 "Admin Panel" gradient text
- 🔗 Pill navigation (Dashboard, New Plant, View Site)
- 🌓 Theme toggle with gradient hover
- 🚪 Sign out button with gradient hover
- 📱 Mobile horizontal scroll navigation
- 🎯 Active page highlighting with gradient

## User Experience

### Public User:
1. Visits landing page → Sees landing navbar
2. Browses plants → Sees landing navbar
3. Clicks "Admin Access" → Sees landing navbar (login page)
4. **Cannot proceed** (not pre-registered admin)

### Admin User:
1. Visits landing page → Sees landing navbar
2. Clicks "Admin Access" → Sees landing navbar (login page)
3. Signs in with Google → Sees landing navbar (callback page)
4. Redirected to dashboard → **Sees admin navbar** (landing navbar hidden)
5. Creates plants → Sees admin navbar
6. Clicks "View Site" → Sees landing navbar (back to public)
7. Clicks "Dashboard" → Sees admin navbar (back to admin)

## Benefits

✅ **No Duplicate Navbars**: Only one navbar shows at a time
✅ **Seamless Transitions**: Navbar switches automatically based on auth state
✅ **Clear Context**: Users know if they're in public or admin area
✅ **Consistent Branding**: Landing navbar for public, admin navbar for management
✅ **Mobile Friendly**: Both navbars have responsive designs

## Testing Checklist

- [ ] Landing page shows landing navbar
- [ ] Plants page shows landing navbar
- [ ] Admin login page shows landing navbar
- [ ] Callback page shows landing navbar
- [ ] Dashboard shows admin navbar (no landing navbar)
- [ ] Create page shows admin navbar (no landing navbar)
- [ ] "View Site" from admin shows landing navbar
- [ ] "Dashboard" from landing shows admin navbar (if logged in)
- [ ] Theme toggle works on both navbars
- [ ] Mobile menus work on both navbars
- [ ] No visual flashing during navbar switches

## Files Modified

1. ✅ `src/components/ConditionalNavbar.tsx` - Updated visibility logic
2. ✅ `src/app/admin/layout.tsx` - Authentication-aware navbar rendering
3. ✅ `src/app/layout.tsx` - Uses ConditionalNavbar in root layout

## Result

The navbar system now provides a **seamless, context-aware navigation experience** with:
- Landing navbar for public/login pages
- Admin navbar for authenticated admin pages
- Smooth transitions between contexts
- No duplicate navbars
- Perfect theme mode support in both
