-- Add Admin User to the Database
-- Run this in Supabase SQL Editor to grant admin access to your Google account

-- First, check if the users table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'users'
);

-- If the table doesn't exist, create it
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT NOW()
);

-- Add your admin email (replace with your actual email)
-- This will insert if not exists, or update if exists
INSERT INTO users (email, role, created_at)
VALUES ('ronaldmaslog13@gmail.com', 'admin', NOW())
ON CONFLICT (email) 
DO UPDATE SET role = 'admin';

-- Verify the admin was added
SELECT id, email, role, created_at 
FROM users 
WHERE email = 'ronaldmaslog13@gmail.com';

-- List all admin users
SELECT id, email, role, created_at 
FROM users 
WHERE role = 'admin'
ORDER BY created_at DESC;
