# 🔧 Image Upload Troubleshooting Guide

## Problem: Images Take Too Long to Upload or Fail

### Quick Diagnostic Steps:

1. **Open the Create Plant page** (`/admin/create`)
2. **Open browser console** (Press F12)
3. **Click "Check Storage Bucket" button** in the debug section
4. **Look for error messages** in the console

---

## Common Issues & Solutions

### ❌ Issue 1: Storage Bucket Not Found
**Error**: `Storage bucket "plant-images" not found`

**Solution**:
1. Go to your **Supabase Dashboard**
2. Navigate to **Storage** in the left sidebar
3. Click **"Create a new bucket"**
4. Settings:
   - **Name**: `plant-images`
   - **Public bucket**: ✅ **ENABLED** (important!)
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`
5. Click **Create bucket**

---

### ❌ Issue 2: Permission Denied
**Error**: `Permission denied` or `new row violates row-level security policy`

**Solution - Add Storage Policies**:

1. Go to **Storage** > **plant-images** > **Policies**
2. Click **"New Policy"**

**Policy 1: Public Read Access** (Anyone can view images)
```sql
Policy Name: Public read access
Allowed operation: SELECT
Policy definition: true
```

**Policy 2: Authenticated Upload** (Logged-in users can upload)
```sql
Policy Name: Authenticated users can upload
Allowed operation: INSERT
Policy definition: auth.role() = 'authenticated'
```

**Policy 3: Authenticated Update** (For replacing images)
```sql
Policy Name: Authenticated users can update
Allowed operation: UPDATE
Policy definition: auth.role() = 'authenticated'
```

**Policy 4: Authenticated Delete** (For removing images)
```sql
Policy Name: Authenticated users can delete
Allowed operation: DELETE
Policy definition: auth.role() = 'authenticated'
```

---

### ❌ Issue 3: Upload Timeout (Takes > 30 seconds)
**Error**: `Upload timeout after 30 seconds`

**Causes**:
- Image is too large (> 5MB)
- Slow internet connection
- Supabase project is far from your location

**Solutions**:
1. **Compress image before upload**:
   - Use online tools: TinyPNG, Squoosh, etc.
   - Resize to max 2000x2000 pixels before uploading
   
2. **Check file size**:
   - Images should be < 5MB
   - After resize, typically 50-500KB
   
3. **Check network**:
   - Run `ping supabase.co` in terminal
   - Test with smaller image first (< 500KB)

---

### ❌ Issue 4: Bucket is Private
**Warning**: `Bucket is PRIVATE - images won't be accessible`

**Solution**:
1. Go to **Storage** > **plant-images** > **Settings**
2. Find **"Public bucket"** toggle
3. **Enable it** ✅
4. Click **Save**

---

### ❌ Issue 5: No Images Showing After Upload
**Symptom**: Upload succeeds but image doesn't display

**Solutions**:

1. **Check Public URL Format**:
   - Should be: `https://[project].supabase.co/storage/v1/object/public/plant-images/plants/[filename].jpg`
   - If it says `/private/` instead of `/public/`, bucket is not public

2. **Check CORS Settings**:
   - Go to **Storage** > **plant-images** > **Settings**
   - Ensure CORS is enabled for your domain

3. **Check Browser Console**:
   - Look for 403 Forbidden errors
   - Look for CORS errors

---

## Testing the Upload Function

### Test 1: Small Image Upload
1. Find a small image (< 500KB)
2. Go to `/admin/create`
3. Upload the image
4. Watch console logs
5. Should complete in < 5 seconds

### Test 2: Storage Diagnostic
1. Go to `/admin/create`
2. Open console (F12)
3. Click "Check Storage Bucket" button
4. Review the diagnostic output
5. Fix any issues it identifies

### Test 3: Manual Storage Test
Run in browser console:
```javascript
// Test bucket access
const { data, error } = await supabase.storage
  .from('plant-images')
  .list('plants', { limit: 1 });

if (error) {
  console.error('Bucket access failed:', error);
} else {
  console.log('✅ Bucket accessible, files:', data);
}
```

---

## Performance Optimization

### Current Optimizations:
✅ Client-side image resize (max 1200px width)
✅ JPEG compression (85% quality)
✅ 30-second timeout protection
✅ Progress bar feedback
✅ File validation (type, size)

### Recommended Settings:
- **Max image dimensions**: 2000x2000 pixels
- **Max file size**: 5MB
- **Recommended size**: < 1MB before upload
- **Format**: JPEG for photos, PNG for graphics with transparency

---

## Database Performance

If uploads work but **saving plant data is slow**, run this migration:

**File**: `docs/migrations/008_performance_optimizations.sql`

**What it does**:
- Adds database indexes for faster queries
- Adds text length limits (prevent huge descriptions)
- Adds optimistic locking (safe multi-admin editing)
- Adds full-text search capabilities

**How to run**:
1. Open **Supabase Dashboard** > **SQL Editor**
2. Paste the contents of `008_performance_optimizations.sql`
3. Click **Run**
4. Verify: "Success. No rows returned"

---

## Still Having Issues?

### Check These:

1. **Supabase Project Status**
   - Is your project active/paused?
   - Check Supabase dashboard for notifications

2. **Environment Variables** (`.env.local`)
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
   ```

3. **Network Issues**
   - Try from different network
   - Disable VPN
   - Check firewall settings

4. **Browser Issues**
   - Clear cache and cookies
   - Try different browser
   - Disable browser extensions

---

## Console Log Interpretation

### ✅ Successful Upload Logs:
```
📁 File selected: image.png 207.75 KB
🚀 Starting upload process...
📐 Resizing image...
✅ Image resized: 26.3 KB
☁️ Uploading to Supabase...
🔍 Upload validation starting...
✅ Validation passed
⬆️ Starting upload to Supabase Storage...
✅ Upload successful!
🔗 Getting public URL...
✅ Public URL generated: https://...
```

### ❌ Failed Upload Logs:
```
❌ Upload error: Storage bucket "plant-images" not found
```
→ **Solution**: Create the bucket (see Issue 1 above)

```
❌ Upload error: Permission denied
```
→ **Solution**: Add storage policies (see Issue 2 above)

```
❌ Upload timeout after 30 seconds
```
→ **Solution**: Use smaller image or check connection (see Issue 3 above)

---

## Quick Fix Checklist

- [ ] Storage bucket "plant-images" exists
- [ ] Bucket is PUBLIC
- [ ] Storage policies are configured (SELECT, INSERT, UPDATE, DELETE)
- [ ] Image is < 5MB
- [ ] Network connection is stable
- [ ] Supabase project is active
- [ ] Environment variables are correct
- [ ] Browser console shows no CORS errors

---

## Need More Help?

Run the diagnostic script:
```javascript
// In browser console on /admin/create page
checkStorage()
```

Or check full logs:
1. Open console (F12)
2. Upload an image
3. Copy all console output
4. Share for debugging
