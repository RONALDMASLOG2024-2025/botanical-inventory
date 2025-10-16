-- Supabase Storage Setup for Plant Images
-- Run this script in the Supabase SQL Editor to set up storage bucket and policies

-- ============================================================================
-- STEP 1: Create Storage Bucket
-- ============================================================================

-- Create the plant-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'plant-images',
  'plant-images',
  true, -- Public bucket (anyone can read)
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Verify bucket was created
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'plant-images';

-- ============================================================================
-- STEP 2: Drop Existing Policies (if re-running script)
-- ============================================================================

DROP POLICY IF EXISTS "Public read access for plant images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload plant images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update plant images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete plant images" ON storage.objects;

-- ============================================================================
-- STEP 3: Create Storage Policies
-- ============================================================================

-- Policy 1: Allow public read access (anyone can view images)
CREATE POLICY "Public read access for plant images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'plant-images');

-- Policy 2: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload plant images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'plant-images' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Allow authenticated users to update images
CREATE POLICY "Authenticated users can update plant images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'plant-images' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'plant-images' 
  AND auth.role() = 'authenticated'
);

-- Policy 4: Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete plant images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'plant-images' 
  AND auth.role() = 'authenticated'
);

-- ============================================================================
-- STEP 4: Verify Policies
-- ============================================================================

-- Check all policies for the plant-images bucket
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects' 
  AND (qual LIKE '%plant-images%' OR with_check LIKE '%plant-images%')
ORDER BY policyname;

-- ============================================================================
-- OPTIONAL: Enhanced Admin-Only Upload Policy
-- ============================================================================

-- Uncomment the following if you want ONLY admins to upload images
-- (This requires the 'users' table with 'email' and 'role' columns)

/*
DROP POLICY IF EXISTS "Authenticated users can upload plant images" ON storage.objects;

CREATE POLICY "Only admins can upload plant images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'plant-images' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.email = (auth.jwt()->>'email')::text
    AND users.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Authenticated users can update plant images" ON storage.objects;

CREATE POLICY "Only admins can update plant images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'plant-images' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.email = (auth.jwt()->>'email')::text
    AND users.role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'plant-images' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.email = (auth.jwt()->>'email')::text
    AND users.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Authenticated users can delete plant images" ON storage.objects;

CREATE POLICY "Only admins can delete plant images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'plant-images' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.email = (auth.jwt()->>'email')::text
    AND users.role = 'admin'
  )
);
*/

-- ============================================================================
-- STEP 5: Test Queries (Optional)
-- ============================================================================

-- Test 1: Check bucket configuration
SELECT * FROM storage.buckets WHERE id = 'plant-images';

-- Test 2: List all files in bucket (should be empty initially)
SELECT * FROM storage.objects WHERE bucket_id = 'plant-images';

-- Test 3: Check bucket size
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  pg_size_pretty(SUM((metadata->>'size')::bigint)) as total_size
FROM storage.objects
WHERE bucket_id = 'plant-images'
GROUP BY bucket_id;

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================

-- To completely remove the bucket and all policies:
/*
DROP POLICY IF EXISTS "Public read access for plant images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload plant images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update plant images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete plant images" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can upload plant images" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can update plant images" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can delete plant images" ON storage.objects;

DELETE FROM storage.objects WHERE bucket_id = 'plant-images';
DELETE FROM storage.buckets WHERE id = 'plant-images';
*/
