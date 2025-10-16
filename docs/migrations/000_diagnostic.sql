-- Diagnostic Script - Run this to check your database setup
-- Copy the output and share it to diagnose issues

-- 1. Check if plants table exists
SELECT 
  'Plants table exists: ' || 
  CASE WHEN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'plants'
  ) THEN 'YES ✅' ELSE 'NO ❌' END as status;

-- 2. Check plants table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'plants'
ORDER BY ordinal_position;

-- 3. Check RLS status
SELECT 
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '⚠️ RLS is ENABLED - may block inserts'
    ELSE '✅ RLS is DISABLED - inserts should work'
  END as status
FROM pg_tables
WHERE tablename = 'plants';

-- 4. Check RLS policies (if any)
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'plants';

-- 5. Check if users table exists
SELECT 
  'Users table exists: ' || 
  CASE WHEN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
  ) THEN 'YES ✅' ELSE 'NO ❌' END as status;

-- 6. Check admin users
SELECT 
  id, 
  email, 
  role, 
  created_at 
FROM users 
WHERE role = 'admin'
ORDER BY created_at DESC;

-- 7. Check storage bucket
SELECT 
  id,
  name,
  public,
  file_size_limit
FROM storage.buckets
WHERE id = 'plant-images';

-- 8. Check storage policies
SELECT 
  policyname,
  tablename,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'objects' 
  AND (qual LIKE '%plant-images%' OR with_check LIKE '%plant-images%');

-- 9. Try a test insert
DO $$
DECLARE
  test_id uuid;
BEGIN
  INSERT INTO plants (common_name, description)
  VALUES ('Diagnostic Test Plant', 'Testing database insert capability')
  RETURNING id INTO test_id;
  
  RAISE NOTICE '✅ Test insert successful! ID: %', test_id;
  
  -- Clean up test data
  DELETE FROM plants WHERE id = test_id;
  RAISE NOTICE '✅ Test data cleaned up';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Test insert failed: %', SQLERRM;
END $$;

-- 10. Summary
SELECT 
  (SELECT COUNT(*) FROM plants) as total_plants,
  (SELECT COUNT(*) FROM users WHERE role = 'admin') as total_admins,
  (SELECT COUNT(*) FROM storage.buckets WHERE id = 'plant-images') as storage_bucket_exists;
