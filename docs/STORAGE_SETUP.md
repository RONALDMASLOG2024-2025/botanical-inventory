# Supabase Storage Setup Guide

This guide will walk you through setting up a storage bucket for plant images in your Botanical Inventory system.

## Overview

The system uses Supabase Storage to store plant images securely. Images are organized in a dedicated bucket with proper access policies.

## Step 1: Create Storage Bucket in Supabase

1. **Go to Supabase Dashboard**
   - Navigate to: https://app.supabase.com
   - Select your botanical inventory project

2. **Navigate to Storage**
   - Click on **Storage** in the left sidebar
   - Click **Create a new bucket**

3. **Configure Bucket Settings**
   - **Bucket Name:** `plant-images`
   - **Public bucket:** ✅ **Checked** (Enable public access)
   - **File size limit:** 5 MB (recommended for images)
   - **Allowed MIME types:** `image/jpeg, image/jpg, image/png, image/webp`
   - Click **Create bucket**

## Step 2: Set Storage Policies

By default, buckets require authentication. We need to configure policies to allow:
- ✅ **Public READ access** - Anyone can view plant images
- ✅ **Authenticated WRITE access** - Only admins can upload/delete

### Policy 1: Public Read Access

```sql
-- Allow anyone to view images
CREATE POLICY "Public read access for plant images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'plant-images');
```

**To add this policy in Supabase:**
1. Go to **Storage** → **Policies** → `plant-images` bucket
2. Click **New Policy**
3. Select **Custom Policy**
4. **Policy name:** `Public read access for plant images`
5. **Allowed operation:** `SELECT`
6. **Target roles:** `public`
7. **USING expression:**
   ```sql
   bucket_id = 'plant-images'
   ```
8. Click **Review** → **Save policy**

### Policy 2: Authenticated Insert (Upload)

```sql
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload plant images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'plant-images' 
  AND auth.role() = 'authenticated'
);
```

**To add this policy:**
1. Click **New Policy** again
2. **Policy name:** `Authenticated users can upload plant images`
3. **Allowed operation:** `INSERT`
4. **Target roles:** `authenticated`
5. **WITH CHECK expression:**
   ```sql
   bucket_id = 'plant-images' AND auth.role() = 'authenticated'
   ```
6. Click **Review** → **Save policy**

### Policy 3: Authenticated Update

```sql
-- Allow authenticated users to update images
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
```

### Policy 4: Authenticated Delete

```sql
-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete plant images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'plant-images' 
  AND auth.role() = 'authenticated'
);
```

## Step 3: Alternative - SQL Script Setup

If you prefer to set everything up via SQL, use the **SQL Editor** in Supabase:

```sql
-- Create bucket (if not created via UI)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'plant-images',
  'plant-images',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Policy 1: Public read access
CREATE POLICY "Public read access for plant images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'plant-images');

-- Policy 2: Authenticated insert
CREATE POLICY "Authenticated users can upload plant images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'plant-images' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Authenticated update
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

-- Policy 4: Authenticated delete
CREATE POLICY "Authenticated users can delete plant images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'plant-images' 
  AND auth.role() = 'authenticated'
);
```

## Step 4: Verify Bucket Configuration

1. **Check Bucket exists**
   - Go to **Storage** in Supabase
   - Verify `plant-images` bucket is listed
   - Check that it shows as **Public**

2. **Check Policies**
   - Click on `plant-images` bucket
   - Go to **Policies** tab
   - Verify all 4 policies are active

3. **Test Upload (via Supabase UI)**
   - Click **Upload file** in the bucket
   - Upload a test image
   - Verify it appears in the bucket

## Step 5: Update Application Code

The application code is already configured to use the `plant-images` bucket. Verify these files are correct:

### Image Upload Helper (`src/lib/uploadImage.ts`)

This helper should handle image uploads to Supabase Storage:

```typescript
import { supabase } from './supabaseClient';

export async function uploadPlantImage(file: File): Promise<string | null> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `plants/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('plant-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('plant-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
}

export async function deletePlantImage(imageUrl: string): Promise<boolean> {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split('/plant-images/');
    if (urlParts.length < 2) return false;
    
    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from('plant-images')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}
```

### Plants Database Schema

Verify your `plants` table has an `image_url` column:

```sql
-- Check if column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'plants' AND column_name = 'image_url';

-- Add column if it doesn't exist
ALTER TABLE plants 
ADD COLUMN IF NOT EXISTS image_url text;
```

## Usage in Application

### Creating/Editing Plants with Images

The admin create/edit forms should include file upload:

```typescript
// In form component
const [imageFile, setImageFile] = useState<File | null>(null);

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  
  let imageUrl = existingImageUrl; // For edit mode
  
  // Upload new image if selected
  if (imageFile) {
    imageUrl = await uploadPlantImage(imageFile);
    if (!imageUrl) {
      alert('Failed to upload image');
      return;
    }
  }
  
  // Save plant with image_url
  const plantData = {
    common_name: commonName,
    scientific_name: scientificName,
    image_url: imageUrl,
    // ... other fields
  };
  
  // Insert/update in database
}
```

### Displaying Plant Images

```typescript
// In plant card or detail component
{plant.image_url ? (
  <img 
    src={plant.image_url} 
    alt={plant.common_name}
    className="w-full h-48 object-cover rounded-lg"
  />
) : (
  <div className="w-full h-48 bg-slate-200 rounded-lg flex items-center justify-center">
    <span className="text-slate-500">No image</span>
  </div>
)}
```

## Image Optimization Best Practices

### 1. Client-Side Resize Before Upload

```typescript
async function resizeImage(file: File, maxWidth: number = 1200): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(new File([blob!], file.name, { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.85);
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}
```

### 2. File Type Validation

```typescript
function validateImageFile(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    alert('Only JPEG, PNG, and WebP images are allowed');
    return false;
  }

  if (file.size > maxSize) {
    alert('Image must be less than 5MB');
    return false;
  }

  return true;
}
```

## Folder Structure in Bucket

Recommended organization:

```
plant-images/
├── plants/
│   ├── 1234567890-abc123.jpg
│   ├── 1234567891-def456.png
│   └── ...
└── thumbnails/ (optional - for future optimization)
    ├── 1234567890-abc123-thumb.jpg
    └── ...
```

## Security Considerations

### ✅ What's Protected
- Only authenticated admins can upload/delete images
- Public can only view images (read-only)
- File size limits prevent abuse
- MIME type restrictions prevent non-image uploads

### ⚠️ Important Notes
- Images are **publicly accessible** via URL
- Don't store sensitive information in image metadata
- Consider implementing rate limiting for uploads
- Monitor storage usage in Supabase dashboard

### 🔒 Enhanced Security (Optional)

For additional security, you can restrict uploads to specific admin users:

```sql
-- More restrictive upload policy
DROP POLICY IF EXISTS "Authenticated users can upload plant images" ON storage.objects;

CREATE POLICY "Only admins can upload plant images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'plant-images' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE users.email = auth.jwt()->>'email' 
    AND users.role = 'admin'
  )
);
```

## Troubleshooting

### Issue: "new row violates row-level security policy"

**Solution:**
- Verify storage policies are created and enabled
- Check that user is authenticated when uploading
- Review policy SQL expressions for typos

### Issue: Images not appearing (404)

**Solution:**
- Verify bucket is set to **Public**
- Check that `publicUrl` is correctly generated
- Ensure image was successfully uploaded to bucket
- Check browser console for CORS errors

### Issue: Upload fails silently

**Solution:**
- Check file size (must be < 5MB)
- Verify file type is allowed (JPEG, PNG, WebP)
- Check browser console for errors
- Verify Supabase client is authenticated

### Issue: Can't delete images

**Solution:**
- Ensure delete policy exists
- Verify user is authenticated
- Check that file path is correctly extracted from URL
- Confirm image exists in bucket

## Testing Checklist

- [ ] Bucket `plant-images` is created and public
- [ ] All 4 storage policies are active
- [ ] Can upload image via Supabase UI
- [ ] Can view uploaded image via public URL
- [ ] Admin can upload image from app
- [ ] Public users can view images
- [ ] Admin can delete images
- [ ] File size validation works
- [ ] File type validation works
- [ ] Old images are deleted when plant is updated

## Monitoring

### Check Storage Usage
1. Go to Supabase Dashboard → **Settings** → **Billing**
2. View storage usage under **Usage**
3. Set up alerts for storage limits

### View Upload Logs
1. Go to **Storage** → `plant-images` bucket
2. Click on **Logs** tab
3. Review upload/delete operations

## Next Steps

1. Create the storage bucket in Supabase
2. Set up the 4 storage policies
3. Test image upload via Supabase UI
4. Implement image upload in create/edit plant forms
5. Add image display in plant cards and detail pages
6. Test complete workflow (upload → display → delete)
7. Consider implementing image compression
8. Set up automated backups (Supabase handles this)

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage Policies Guide](https://supabase.com/docs/guides/storage/security/access-control)
- [Image Upload Best Practices](https://supabase.com/docs/guides/storage/uploads)
