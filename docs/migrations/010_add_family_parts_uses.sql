-- Migration: Add family, plant_parts_used, and uses columns to plants table
-- Date: 2025-11-04
-- Description: Adds botanical family classification, plant parts used, and medicinal/practical uses
-- Also updates to support multiple categories per plant

-- Add new columns to plants table
ALTER TABLE plants
ADD COLUMN IF NOT EXISTS family VARCHAR(200),
ADD COLUMN IF NOT EXISTS plant_parts_used TEXT,
ADD COLUMN IF NOT EXISTS uses TEXT;

-- Add comments for documentation
COMMENT ON COLUMN plants.family IS 'Botanical family classification (e.g., MYRTACEAE, ROSACEAE)';
COMMENT ON COLUMN plants.plant_parts_used IS 'Parts of the plant used (e.g., ROOTS, BARK, FRUIT, FLOWER, LEAVES)';
COMMENT ON COLUMN plants.uses IS 'Medicinal, culinary, or practical uses of the plant';

-- Create index on family for faster filtering
CREATE INDEX IF NOT EXISTS idx_plants_family ON plants(family);

-- =====================================================
-- Multiple Categories Support
-- =====================================================

-- Create junction table for plant-category many-to-many relationship
CREATE TABLE IF NOT EXISTS plant_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plant_id, category_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_plant_categories_plant_id ON plant_categories(plant_id);
CREATE INDEX IF NOT EXISTS idx_plant_categories_category_id ON plant_categories(category_id);

-- Migrate existing category_id data to plant_categories junction table
INSERT INTO plant_categories (plant_id, category_id)
SELECT id, category_id 
FROM plants 
WHERE category_id IS NOT NULL
ON CONFLICT (plant_id, category_id) DO NOTHING;

-- Note: We'll keep the category_id column for now for backward compatibility
-- but it will be deprecated in favor of the plant_categories junction table
COMMENT ON COLUMN plants.category_id IS 'DEPRECATED: Use plant_categories junction table instead. Kept for backward compatibility.';

