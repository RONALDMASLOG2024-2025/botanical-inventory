-- Add category and care_instructions columns to existing plants table
-- Run this in Supabase SQL Editor

-- Add category column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'plants' AND column_name = 'category'
  ) THEN
    ALTER TABLE plants ADD COLUMN category text;
    RAISE NOTICE '✅ Added category column';
  ELSE
    RAISE NOTICE 'ℹ️  category column already exists';
  END IF;
END $$;

-- Add care_instructions column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'plants' AND column_name = 'care_instructions'
  ) THEN
    ALTER TABLE plants ADD COLUMN care_instructions text;
    RAISE NOTICE '✅ Added care_instructions column';
  ELSE
    RAISE NOTICE 'ℹ️  care_instructions column already exists';
  END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'plants' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE plants ADD COLUMN updated_at timestamptz DEFAULT NOW();
    RAISE NOTICE '✅ Added updated_at column';
  ELSE
    RAISE NOTICE 'ℹ️  updated_at column already exists';
  END IF;
END $$;

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS update_plants_updated_at ON plants;
CREATE TRIGGER update_plants_updated_at
  BEFORE UPDATE ON plants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_plants_category ON plants(category);
CREATE INDEX IF NOT EXISTS idx_plants_common_name ON plants(common_name);
CREATE INDEX IF NOT EXISTS idx_plants_featured ON plants(is_featured);
CREATE INDEX IF NOT EXISTS idx_plants_created_at ON plants(created_at DESC);

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'plants'
ORDER BY ordinal_position;

-- Show success message
DO $$
BEGIN
  RAISE NOTICE '🎉 Migration complete! The plants table now has:';
  RAISE NOTICE '   - category (text)';
  RAISE NOTICE '   - care_instructions (text)';
  RAISE NOTICE '   - updated_at (timestamptz with auto-trigger)';
  RAISE NOTICE '   - Performance indexes created';
END $$;
