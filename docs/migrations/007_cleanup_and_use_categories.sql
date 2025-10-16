-- Cleanup: Remove redundant category text column and use category_id FK properly
-- Run this in Supabase SQL Editor

-- Step 1: Migrate any existing category text data to categories table (if needed)
DO $$
DECLARE
  plant_record RECORD;
  category_uuid uuid;
BEGIN
  -- For each plant that has a text category but no category_id
  FOR plant_record IN 
    SELECT id, category 
    FROM plants 
    WHERE category IS NOT NULL 
      AND category != '' 
      AND category_id IS NULL
  LOOP
    -- Check if this category exists in categories table
    SELECT id INTO category_uuid
    FROM categories
    WHERE LOWER(name) = LOWER(plant_record.category)
    LIMIT 1;
    
    -- If category doesn't exist, create it
    IF category_uuid IS NULL THEN
      INSERT INTO categories (name)
      VALUES (plant_record.category)
      RETURNING id INTO category_uuid;
      RAISE NOTICE 'Created category: %', plant_record.category;
    END IF;
    
    -- Update plant to use category_id
    UPDATE plants
    SET category_id = category_uuid
    WHERE id = plant_record.id;
    
    RAISE NOTICE 'Migrated plant % to use category_id', plant_record.id;
  END LOOP;
END $$;

-- Step 2: Drop the redundant category text column
ALTER TABLE plants DROP COLUMN IF EXISTS category;

-- Step 3: Ensure we have some default categories
INSERT INTO categories (name) VALUES
  ('Flowering Plants'),
  ('Succulents'),
  ('Ferns'),
  ('Tropical Plants'),
  ('Medicinal Plants'),
  ('Ornamental Plants'),
  ('Herbs'),
  ('Trees'),
  ('Shrubs'),
  ('Vines')
ON CONFLICT DO NOTHING;

-- Step 4: Create index on category_id for better join performance
CREATE INDEX IF NOT EXISTS idx_plants_category_id ON plants(category_id);

-- Verify the schema
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'plants'
ORDER BY ordinal_position;

-- Show all categories
SELECT 
  id,
  name,
  (SELECT COUNT(*) FROM plants WHERE category_id = categories.id) as plant_count
FROM categories
ORDER BY name;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '🎉 Schema cleanup complete!';
  RAISE NOTICE '✅ Removed redundant category text column';
  RAISE NOTICE '✅ Now using category_id FK to categories table';
  RAISE NOTICE '✅ Added default categories';
  RAISE NOTICE '✅ Migrated any existing text categories to categories table';
END $$;
