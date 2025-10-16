import { supabase } from './supabaseClient';

/**
 * Upload a plant image to Supabase Storage
 * @param file - The image file to upload
 * @returns Public URL of the uploaded image, or null if upload failed
 */
export async function uploadPlantImage(file: File): Promise<string | null> {
  try {
    console.log('🔍 Upload validation starting...');
    console.log('  File name:', file.name);
    console.log('  File type:', file.type);
    console.log('  File size:', formatFileSize(file.size));
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      const error = 'Invalid file type. Only JPEG, PNG, and WebP are allowed.';
      console.error('❌', error);
      throw new Error(error);
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const error = 'File too large. Maximum size is 5MB.';
      console.error('❌', error);
      throw new Error(error);
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const fileName = `${timestamp}-${randomStr}.${fileExt}`;
    const filePath = `plants/${fileName}`;
    
    console.log('✅ Validation passed');
    console.log('📝 Generated filename:', fileName);
    console.log('📂 Upload path:', filePath);

    // PRE-FLIGHT CHECK: Verify bucket is accessible
    console.log('🔍 Pre-flight check: Verifying bucket accessibility...');
    try {
      // Try to list files in the bucket (simpler than listing all buckets)
      const { error: testError } = await supabase.storage
        .from('plant-images')
        .list('plants', { limit: 1 });
      
      if (testError) {
        console.error('❌ Bucket access failed:', testError.message);
        
        if (testError.message?.includes('not found')) {
          throw new Error('Storage bucket "plant-images" not found. Please create it in Supabase Dashboard > Storage.');
        }
        
        if (testError.message?.includes('permission') || testError.message?.includes('policy')) {
          throw new Error('Permission denied. Please add storage policies in Supabase Dashboard > Storage > plant-images > Policies.');
        }
        
        throw new Error(`Storage access error: ${testError.message}`);
      }
      
      console.log('✅ Bucket "plant-images" is accessible');
    } catch (preFlightError) {
      console.error('❌ Pre-flight check failed:', preFlightError);
      throw preFlightError;
    }

    // Upload to Supabase Storage with timeout
    console.log('⬆️ Starting upload to Supabase Storage...');
    console.log('  Bucket: plant-images');
    console.log('  Path:', filePath);
    console.log('  File size:', formatFileSize(file.size));
    
    const uploadPromise = supabase.storage
      .from('plant-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    // Add 60 second timeout (increased from 30)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Upload timeout after 60 seconds. The file may be too large or your connection is slow. Try a smaller image.')), 60000)
    );
    
    const { data, error } = await Promise.race([uploadPromise, timeoutPromise]) as any;

    if (error) {
      console.error('❌ Upload error details:');
      console.error('  Message:', error.message);
      console.error('  Status:', error.statusCode);
      console.error('  Full error:', error);
      
      // User-friendly error messages
      if (error.message?.includes('not found')) {
        throw new Error('Storage bucket "plant-images" not found. Please create it in Supabase Dashboard.');
      } else if (error.message?.includes('permission')) {
        throw new Error('Permission denied. Check storage bucket policies in Supabase.');
      } else if (error.message?.includes('timeout')) {
        throw new Error('Upload timeout. Please try a smaller image or check your connection.');
      }
      
      throw new Error(error.message || 'Upload failed');
    }

    if (!data) {
      console.error('❌ No data returned from upload');
      throw new Error('Upload completed but no data returned');
    }

    console.log('✅ Upload successful!');
    console.log('  Data:', data);

    // Get public URL
    console.log('🔗 Getting public URL...');
    const { data: urlData } = supabase.storage
      .from('plant-images')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      console.error('❌ Failed to get public URL');
      throw new Error('Failed to get public URL');
    }

    console.log('✅ Public URL generated:', urlData.publicUrl);
    return urlData.publicUrl;
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
    
    // Re-throw with user-friendly message
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unexpected error during upload');
  }
}

/**
 * Delete a plant image from Supabase Storage
 * @param imageUrl - The public URL of the image to delete
 * @returns True if deletion was successful, false otherwise
 */
export async function deletePlantImage(imageUrl: string): Promise<boolean> {
  try {
    if (!imageUrl) return false;

    // Extract file path from URL
    // URL format: https://<project>.supabase.co/storage/v1/object/public/plant-images/plants/filename.jpg
    const urlParts = imageUrl.split('/plant-images/');
    if (urlParts.length < 2) {
      console.error('Invalid image URL format');
      return false;
    }
    
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
    console.error('Unexpected delete error:', error);
    return false;
  }
}

/**
 * Resize an image file before uploading
 * @param file - The original image file
 * @param maxWidth - Maximum width in pixels (default: 1200)
 * @param quality - JPEG quality 0-1 (default: 0.85)
 * @returns Resized image as a File object
 */
export async function resizeImage(
  file: File, 
  maxWidth: number = 1200,
  quality: number = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob and create File
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas to Blob conversion failed'));
              return;
            }
            resolve(new File([blob], file.name, { 
              type: 'image/jpeg',
              lastModified: Date.now()
            }));
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate an image file
 * @param file - The file to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only JPEG, PNG, and WebP images are allowed'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Image must be less than 5MB'
    };
  }

  return { isValid: true };
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
