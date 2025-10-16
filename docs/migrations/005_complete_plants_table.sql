-- Complete Plants Table Schema with RLS Disabled
-- Run this in Supabase SQL Editor to set up the plants table

-- Drop existing table if you want a fresh start (WARNING: deletes all data!)
-- DROP TABLE IF EXISTS plants CASCADE;

-- Create plants table
CREATE TABLE IF NOT EXISTS plants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  common_name text NOT NULL,
  scientific_name text,
  description text,
  habitat text,
  care_instructions text,
  category text,
  image_url text,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Disable RLS for easy development
ALTER TABLE plants DISABLE ROW LEVEL SECURITY;

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_plants_common_name ON plants(common_name);
CREATE INDEX IF NOT EXISTS idx_plants_category ON plants(category);
CREATE INDEX IF NOT EXISTS idx_plants_featured ON plants(is_featured);
CREATE INDEX IF NOT EXISTS idx_plants_created_at ON plants(created_at DESC);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_plants_updated_at ON plants;
CREATE TRIGGER update_plants_updated_at
  BEFORE UPDATE ON plants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verify table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'plants'
ORDER BY ordinal_position;

-- Show RLS status
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'plants';

-- Test insert (will be deleted)
INSERT INTO plants (common_name, scientific_name, description)
VALUES ('Test Plant', 'Testus plantus', 'This is a test plant to verify the table works')
RETURNING *;

-- Delete test plant
DELETE FROM plants WHERE common_name = 'Test Plant';

-- Show final count
SELECT COUNT(*) as plant_count FROM plants;
