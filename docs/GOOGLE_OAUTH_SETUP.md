# Google OAuth Setup Guide

This guide will walk you through setting up Google OAuth authentication for your Botanical Inventory admin panel.

## Prerequisites

- Supabase project created
- Admin user already added to `users` table with `role='admin'`
- Admin email: `ronaldmaslog13@gmail.com`

## Step 1: Configure Google OAuth in Supabase

1. **Go to your Supabase Dashboard**
   - Navigate to: https://app.supabase.com
   - Select your project

2. **Enable Google Provider**
   - Go to **Authentication** → **Providers**
   - Find **Google** in the list
   - Toggle it to **Enabled**

3. **Configure OAuth Credentials**
   
   You have two options:

   **Option A: Use Supabase's default credentials (Quick Setup)**
   - Simply enable Google and use Supabase's built-in OAuth app
   - This is the fastest way to get started
   - Skip to Step 2

   **Option B: Create your own Google OAuth app (Recommended for production)**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable **Google+ API**
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Configure OAuth consent screen:
     - User Type: External
     - App name: Botanical Inventory Admin
     - Support email: Your email
     - Authorized domains: Add your domain
   - Create OAuth Client ID:
     - Application type: Web application
     - Authorized redirect URIs: `https://<your-project-ref>.supabase.co/auth/v1/callback`
     - Copy the **Client ID** and **Client Secret**
   - Back in Supabase, paste Client ID and Secret in the Google provider settings

4. **Save Configuration**
   - Click **Save** in Supabase

## Step 2: Configure Authorized Redirect URLs

1. **In Supabase Dashboard**
   - Go to **Authentication** → **URL Configuration**
   - Add these to **Redirect URLs**:
     ```
     http://localhost:3000/admin/callback
     https://your-production-domain.com/admin/callback
     ```

2. **Site URL** (optional but recommended)
   - Set Site URL to: `http://localhost:3000` (development)
   - For production, use your actual domain

## Step 3: Verify Database Schema

Make sure your `users` table has the correct structure:

```sql
-- Check if users table exists
SELECT * FROM users WHERE email = 'ronaldmaslog13@gmail.com';

-- If the user doesn't exist, add them:
INSERT INTO users (id, email, role, created_at)
VALUES (
  gen_random_uuid(),
  'ronaldmaslog13@gmail.com',
  'admin',
  NOW()
);
```

Required columns:
- `id` (uuid, primary key)
- `email` (text, unique)
- `role` (text) - must be 'admin' for admin access
- `created_at` (timestamp, optional)

## Step 4: Test the OAuth Flow

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Navigate to admin login**
   - Go to: http://localhost:3000/admin

3. **Click "Sign in with Google"**
   - You'll be redirected to Google's OAuth consent screen
   - Sign in with: `ronaldmaslog13@gmail.com`
   - Grant permissions

4. **Verify redirect**
   - You should be redirected to `/admin/callback`
   - The callback page will verify you're an admin
   - If successful, you'll be redirected to `/admin/dashboard`

## Troubleshooting

### Error: "Access denied. You are not a registered admin."

**Solution:**
- Verify the email in `users` table matches exactly (including case)
- Check that `role` column is set to `'admin'` (lowercase)
- Run this query:
  ```sql
  UPDATE users 
  SET role = 'admin' 
  WHERE email = 'ronaldmaslog13@gmail.com';
  ```

### Error: "Invalid redirect URI"

**Solution:**
- Make sure you added the callback URL to Supabase's Redirect URLs
- Format must be: `http://localhost:3000/admin/callback` (no trailing slash)
- If using custom Google OAuth app, add the same URL to Google Cloud Console

### Error: "Authentication failed"

**Solution:**
- Check browser console for detailed error messages
- Verify Supabase environment variables in `.env.local`:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=your-project-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```
- Restart your development server after adding env variables

### Google Sign In button doesn't work

**Solution:**
- Open browser console and check for errors
- Verify Supabase client is initialized correctly
- Check that `@supabase/supabase-js` is installed:
  ```bash
  npm install @supabase/supabase-js
  ```

## Adding More Admins

To add additional admin users:

1. **Option A: Direct Database Insert**
   ```sql
   INSERT INTO users (id, email, role, created_at)
   VALUES (
     gen_random_uuid(),
     'newadmin@example.com',
     'admin',
     NOW()
   );
   ```

2. **Option B: Create Admin Management UI** (Future enhancement)
   - Build an admin page to invite/manage other admins
   - Require super-admin role for this functionality

## Security Notes

- ✅ **Only pre-registered users** (in `users` table with `role='admin'`) can access admin dashboard
- ✅ **Google OAuth** provides secure authentication without storing passwords
- ✅ **Database verification** happens on every request via `isAdmin()` function
- ⚠️ **Never expose** Supabase service role key in client-side code
- ⚠️ **Use RLS policies** to protect sensitive data at database level

## Next Steps

1. Enable Google OAuth in Supabase (Step 1)
2. Add callback URL to redirect URLs (Step 2)
3. Verify admin user exists in database (Step 3)
4. Test the authentication flow (Step 4)
5. Deploy to production and update OAuth redirect URLs for your domain

## Support

If you encounter issues:
- Check Supabase logs: **Authentication** → **Logs**
- Review browser console for client-side errors
- Verify all environment variables are set correctly
- Ensure Supabase SDK is properly installed
