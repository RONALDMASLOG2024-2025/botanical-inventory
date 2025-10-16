# 🔧 Storage Upload Fix - Quick Guide

## Problem
You have the `plant-images` bucket, but uploads are timing out or failing.

## Root Cause
**Missing or incorrect Storage Policies** - The bucket exists but your app doesn't have permission to:
- List files (SELECT)
- Upload files (INSERT)
- Update files (UPDATE)
- Delete files (DELETE)

---

## ✅ SOLUTION: Add Storage Policies

### Option 1: Quick Fix (Dashboard - 2 minutes)

1. **Open Supabase Dashboard**: https://app.supabase.com
2. **Select your project**
3. **Go to Storage** (left sidebar)
4. **Click on "plant-images" bucket**
5. **Click "Policies" tab**
6. **Click "New Policy" button**

**Add this policy:**

```
Policy Name: Public Access
Target roles: public
Allowed operations: SELECT, INSERT, UPDATE, DELETE
```

**OR click "Enable access to all users"** (easier, but less secure)

---

### Option 2: SQL Migration (Dashboard - 5 minutes)

1. **Go to SQL Editor** in Supabase Dashboard
2. **Copy this SQL** and paste it:

```sql
-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Public read access for plant images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload plant images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update plant images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete plant images" ON storage.objects;

-- Policy 1: Allow anyone to view images (SELECT)
CREATE POLICY "Public read access for plant images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'plant-images');

-- Policy 2: Allow authenticated users to upload (INSERT)
CREATE POLICY "Authenticated users can upload plant images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'plant-images' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Allow authenticated users to update (UPDATE)
CREATE POLICY "Authenticated users can update plant images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'plant-images' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'plant-images' AND auth.role() = 'authenticated');

-- Policy 4: Allow authenticated users to delete (DELETE)
CREATE POLICY "Authenticated users can delete plant images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'plant-images' AND auth.role() = 'authenticated');

-- Verify policies were created
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'objects' 
AND (qual LIKE '%plant-images%' OR with_check LIKE '%plant-images%');
```

3. **Click "Run"**
4. Should see: **"Success. 4 rows returned"** (showing the 4 policies)

---

## 🧪 Test the Fix

### Test 1: Browser Console Test (Immediate)

1. **Go to `/admin/create` page**
2. **Open browser console** (F12)
3. **Run this command**:

```javascript
// Test bucket access
const { data, error } = await supabase.storage
  .from('plant-images')
  .list('plants', { limit: 1 });

if (error) {
  console.error('❌ Still failing:', error.message);
  console.log('→ Policies may not be set correctly');
} else {
  console.log('✅ Success! Bucket is accessible');
  console.log('Files found:', data.length);
}
```

**Expected Result**: ✅ "Success! Bucket is accessible"

---

### Test 2: Upload Test (After policies added)

1. **Refresh the `/admin/create` page**
2. **Look for**: ✅ "Storage bucket is configured and ready!"
3. **Select a small test image** (< 1MB)
4. **Click "Upload"**
5. **Watch console** - should complete in 5-10 seconds

**Expected Console Output**:
```
🔍 Pre-flight check: Verifying bucket accessibility...
✅ Bucket "plant-images" is accessible
⬆️ Starting upload to Supabase Storage...
✅ Upload successful!
✅ Public URL generated: https://...
```

---

## 🔍 Diagnostic Commands

Run these in browser console on `/admin/create` page:

### Check if bucket is public:
```javascript
const { data } = supabase.storage.from('plant-images').getPublicUrl('test.jpg');
console.log('Public URL format:', data.publicUrl);
// Should show: https://[project].supabase.co/storage/v1/object/public/plant-images/test.jpg
```

### Check authentication:
```javascript
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user?.email || 'Not logged in');
// Should show your email if logged in
```

### Check current policies:
```javascript
// This requires service role key, so won't work from browser
// Instead, check in Supabase Dashboard > Storage > plant-images > Policies
```

---

## 📋 Common Issues & Fixes

### Issue: "row-level security policy"
**Cause**: No INSERT policy  
**Fix**: Add policy for INSERT operation (see Option 2 above)

### Issue: "Bucket not found"
**Cause**: Bucket name mismatch or doesn't exist  
**Fix**: Verify bucket name is exactly `plant-images` (lowercase, with hyphen)

### Issue: "Permission denied"
**Cause**: Missing SELECT policy  
**Fix**: Add policy for SELECT operation (see Option 2 above)

### Issue: "Timeout after 60 seconds"
**Cause**: Network issue or file too large  
**Fix**: 
- Use smaller image (< 1MB)
- Check internet connection
- Try different network

---

## ✅ Verification Checklist

After adding policies, verify:

- [ ] Can list files in bucket (SELECT works)
- [ ] Can upload test image (INSERT works)  
- [ ] Can see uploaded image in browser (bucket is public)
- [ ] Upload completes in < 10 seconds
- [ ] No errors in console

---

## 🆘 Still Not Working?

If policies are correct but uploads still fail:

1. **Check bucket is PUBLIC**:
   - Storage > plant-images > Settings
   - "Public bucket" toggle should be ON

2. **Check CORS settings**:
   - Storage > plant-images > Settings
   - CORS should allow your domain

3. **Check file size**:
   - Images should be < 5MB
   - After resize, typically < 500KB

4. **Check network**:
   - Disable VPN
   - Try different network
   - Check firewall

5. **Check Supabase project status**:
   - Dashboard > Project Settings
   - Ensure project is not paused

---

## 📝 What Changed?

If uploads **worked before** but **don't work now**, likely causes:

1. ❌ **Policies were deleted** - Re-add them (see above)
2. ❌ **Bucket made private** - Make it public again
3. ❌ **RLS enabled on storage.objects** - Check policies
4. ❌ **Supabase project paused** - Check project status
5. ❌ **Auth session expired** - Log out and log back in

---

## 🎯 TL;DR

**Quick fix (30 seconds)**:
1. Supabase Dashboard > Storage > plant-images > Policies
2. Click "Enable access to all users"
3. Refresh `/admin/create` page
4. Upload should work ✅

**Secure fix (2 minutes)**:
1. Supabase Dashboard > SQL Editor
2. Paste the SQL from "Option 2" above
3. Click Run
4. Refresh `/admin/create` page
5. Upload should work ✅
