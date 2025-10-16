-- Add image_url column to plants table
-- This migration adds support for plant images stored in Supabase Storage

-- Check if column exists and add if not
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'plants' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE plants ADD COLUMN image_url text;
  END IF;
END $$;

-- Add comment to document the column
COMMENT ON COLUMN plants.image_url IS 'Public URL of plant image stored in Supabase Storage (plant-images bucket)';

-- Optional: Add index if you'll be filtering by images
-- CREATE INDEX IF NOT EXISTS idx_plants_has_image ON plants ((image_url IS NOT NULL));

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'plants' AND column_name = 'image_url';
