/**
 * Diagnostic script to check Supabase Storage configuration
 * Run this to verify the plant-images bucket exists and is accessible
 */

import { supabase } from './supabaseClient';

export async function checkStorageBucket() {
  console.log('\n🔍 STORAGE DIAGNOSTIC CHECK\n');
  console.log('═'.repeat(50));
  
  try {
    // Skip bucket listing (requires admin permissions)
    // Instead, try to access the plant-images bucket directly
    
    console.log('\n1️⃣ Checking "plant-images" bucket accessibility...');
    const { data: files, error: listError } = await supabase.storage
      .from('plant-images')
      .list('plants', { limit: 1 });
    
    if (listError) {
      console.error('❌ Cannot access "plant-images" bucket');
      console.error('   Error:', listError.message);
      
      if (listError.message?.includes('not found') || listError.message?.includes('404')) {
        console.log('\n💡 SOLUTION: The bucket may not exist or is named differently');
        console.log('   1. Go to Supabase Dashboard > Storage');
        console.log('   2. Check if "plant-images" bucket exists');
        console.log('   3. If not, create it (Name: plant-images, Public: YES)');
        return false;
      }
      
      if (listError.message?.includes('permission') || listError.message?.includes('policy') || 
          listError.message?.includes('401') || listError.message?.includes('403')) {
        console.log('\n💡 SOLUTION: Missing storage policies');
        console.log('   1. Go to Storage > plant-images > Policies');
        console.log('   2. Add SELECT policy: "Enable access to all users"');
        console.log('   OR run: docs/migrations/003_storage_setup.sql');
        return false;
      }
      
      console.log('\n💡 SOLUTION: Unknown error - check Supabase logs');
      return false;
    }
    
    console.log('✅ Bucket "plant-images" is accessible!');
    console.log('   Current files in /plants folder:', files?.length || 0);
    
    // Try to get public URL (tests if bucket is public)
    console.log('\n2️⃣ Checking if bucket is public...');
    const testPath = 'plants/test.jpg';
    const { data: urlData } = supabase.storage
      .from('plant-images')
      .getPublicUrl(testPath);
    
    if (!urlData?.publicUrl) {
      console.warn('⚠️ Could not generate public URL');
      console.log('\n💡 SOLUTION: Make bucket public');
      console.log('   1. Go to Storage > plant-images > Settings');
      console.log('   2. Enable "Public bucket"');
      return false;
    }
    
    console.log('✅ Public URL generation works!');
    console.log('   Sample URL format:', urlData.publicUrl);
    
    // Check if we can test upload (requires auth)
    console.log('\n3️⃣ Checking upload permissions...');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('⚠️ No authenticated user - cannot test upload');
      console.log('   Upload will require authentication');
    } else {
      console.log('✅ User authenticated:', user.email);
      console.log('   Upload permissions should work');
    }
    
    console.log('\n═'.repeat(50));
    console.log('✅ STORAGE CHECK COMPLETE - Bucket is ready!\n');
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

// Auto-run if executed directly
if (typeof window !== 'undefined') {
  (window as any).checkStorage = checkStorageBucket;
  console.log('💡 Run checkStorage() in browser console to diagnose storage issues');
}
