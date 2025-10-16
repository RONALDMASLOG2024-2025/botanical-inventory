# Storage Quick Reference

Quick guide for working with plant images in the Botanical Inventory system.

## Setup Checklist

### 1. Database Setup
- [ ] Run `docs/migrations/002_add_image_url.sql` to add image_url column
- [ ] Run `docs/migrations/003_storage_setup.sql` to create bucket and policies

### 2. Supabase Dashboard Setup (Alternative to SQL)
- [ ] Go to Storage → Create bucket `plant-images` (public)
- [ ] Set file size limit: 5MB
- [ ] Set allowed MIME types: `image/jpeg, image/jpg, image/png, image/webp`
- [ ] Enable all 4 storage policies (see docs/STORAGE_SETUP.md)

### 3. Verify Setup
- [ ] Bucket `plant-images` exists and is public
- [ ] 4 storage policies are active
- [ ] `plants` table has `image_url` column

## Usage Examples

### Upload Image in Create/Edit Plant Form

```typescript
import ImageUpload from '@/components/ImageUpload';

// In your component
const [imageUrl, setImageUrl] = useState<string | null>(plant?.image_url || null);

// In JSX
<ImageUpload
  currentImageUrl={imageUrl}
  onImageUploaded={(url) => setImageUrl(url)}
  onImageRemoved={() => setImageUrl(null)}
  label="Plant Image"
  required={false}
/>

// When saving plant
const plantData = {
  common_name: commonName,
  scientific_name: scientificName,
  image_url: imageUrl,
  // ... other fields
};
```

### Display Image in Plant Card

```typescript
{plant.image_url ? (
  <img 
    src={plant.image_url} 
    alt={plant.common_name}
    className="w-full h-48 object-cover rounded-lg"
  />
) : (
  <div className="w-full h-48 bg-slate-200 rounded-lg flex items-center justify-center">
    <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </div>
)}
```

### Manual Upload (without component)

```typescript
import { uploadPlantImage, deletePlantImage, resizeImage, validateImageFile } from '@/lib/uploadImage';

// Validate file
const validation = validateImageFile(file);
if (!validation.isValid) {
  alert(validation.error);
  return;
}

// Resize and upload
const resized = await resizeImage(file, 1200, 0.85);
const imageUrl = await uploadPlantImage(resized);

if (imageUrl) {
  console.log('Uploaded:', imageUrl);
  // Save imageUrl to database
}

// Delete image
const success = await deletePlantImage(oldImageUrl);
```

## API Reference

### `uploadPlantImage(file: File): Promise<string | null>`
Uploads an image to Supabase Storage.
- **Parameters:** File object (max 5MB, JPEG/PNG/WebP)
- **Returns:** Public URL or null if failed
- **Auto-validates:** File type and size

### `deletePlantImage(imageUrl: string): Promise<boolean>`
Deletes an image from Supabase Storage.
- **Parameters:** Public URL of the image
- **Returns:** True if successful, false otherwise

### `resizeImage(file: File, maxWidth?: number, quality?: number): Promise<File>`
Resizes an image before upload.
- **Parameters:** 
  - `file`: Original image
  - `maxWidth`: Max width in pixels (default: 1200)
  - `quality`: JPEG quality 0-1 (default: 0.85)
- **Returns:** Resized File object

### `validateImageFile(file: File): { isValid: boolean; error?: string }`
Validates an image file.
- **Checks:** File type and size
- **Returns:** Validation result with error message if invalid

### `formatFileSize(bytes: number): string`
Formats bytes to human-readable size.
- **Example:** `formatFileSize(1048576)` → `"1 MB"`

## Component Props

### `<ImageUpload />`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `currentImageUrl` | `string \| null` | No | `null` | Existing image URL |
| `onImageUploaded` | `(url: string) => void` | Yes | - | Called when upload succeeds |
| `onImageRemoved` | `() => void` | No | - | Called when image is removed |
| `label` | `string` | No | `"Plant Image"` | Label text |
| `required` | `boolean` | No | `false` | Show required asterisk |

## Storage Structure

```
plant-images/
└── plants/
    ├── 1697461234567-a1b2c3d4.jpg
    ├── 1697461245678-e5f6g7h8.png
    └── ...
```

Files are named: `{timestamp}-{random}.{ext}`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "new row violates row-level security policy" | Check that storage policies are enabled |
| Images don't display (404) | Verify bucket is set to **public** |
| Upload fails silently | Check file size (< 5MB) and type (JPEG/PNG/WebP) |
| Can't delete images | Ensure user is authenticated and delete policy exists |
| CORS errors | Check Supabase project URL in `.env.local` |

## Common Patterns

### Delete old image when updating

```typescript
async function updatePlant(plantId: string, newImageUrl: string | null) {
  // Get current plant
  const { data: plant } = await supabase
    .from('plants')
    .select('image_url')
    .eq('id', plantId)
    .single();

  // Delete old image if exists and different
  if (plant?.image_url && plant.image_url !== newImageUrl) {
    await deletePlantImage(plant.image_url);
  }

  // Update plant with new image
  await supabase
    .from('plants')
    .update({ image_url: newImageUrl })
    .eq('id', plantId);
}
```

### Batch upload multiple images

```typescript
async function uploadMultiple(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  
  for (const file of files) {
    const resized = await resizeImage(file);
    const url = await uploadPlantImage(resized);
    if (url) urls.push(url);
  }
  
  return urls;
}
```

### Progress tracking

```typescript
const [progress, setProgress] = useState(0);

async function uploadWithProgress(file: File) {
  setProgress(25);
  const resized = await resizeImage(file);
  
  setProgress(50);
  const url = await uploadPlantImage(resized);
  
  setProgress(100);
  return url;
}
```

## Security Notes

✅ **Safe:**
- Public read access (anyone can view)
- Authenticated write (only logged-in users can upload)
- File type validation
- File size limits
- Auto-generated filenames

⚠️ **Important:**
- Images are publicly accessible via URL
- Don't store sensitive data in images
- Monitor storage usage in Supabase
- Consider implementing rate limiting

## Performance Tips

1. **Always resize before upload**
   ```typescript
   const resized = await resizeImage(file, 1200, 0.85);
   const url = await uploadPlantImage(resized);
   ```

2. **Use optimized formats**
   - WebP for smallest size
   - JPEG for photos (85% quality)
   - PNG only if transparency needed

3. **Lazy load images**
   ```typescript
   <img loading="lazy" src={plant.image_url} alt={plant.common_name} />
   ```

4. **Use CDN caching**
   - Supabase Storage includes CDN
   - Images cached for 1 hour (configurable)

## Next Steps

1. Run database migrations
2. Set up storage bucket in Supabase
3. Add `<ImageUpload />` to create/edit forms
4. Update plant cards to display images
5. Test upload/delete workflow
6. Consider implementing image thumbnails
