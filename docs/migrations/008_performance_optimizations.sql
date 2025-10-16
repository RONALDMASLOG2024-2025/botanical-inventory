-- =====================================================
-- Migration 008: Performance Optimizations
-- =====================================================
-- Purpose: Add indexes and optimize database for better performance
-- Reason: Slow uploads and concurrent admin operations
-- Date: 2025-10-16

-- 1. Add indexes for faster queries
-- =====================================================

-- Index on common_name for search performance
CREATE INDEX IF NOT EXISTS idx_plants_common_name ON plants(common_name);

-- Index on scientific_name for search
CREATE INDEX IF NOT EXISTS idx_plants_scientific_name ON plants(scientific_name);

-- Index on category_id for filtering
CREATE INDEX IF NOT EXISTS idx_plants_category_id ON plants(category_id);

-- Index on is_featured for featured plants query
CREATE INDEX IF NOT EXISTS idx_plants_is_featured ON plants(is_featured) WHERE is_featured = true;

-- Index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_plants_created_at ON plants(created_at DESC);

-- Composite index for common search patterns
CREATE INDEX IF NOT EXISTS idx_plants_category_created ON plants(category_id, created_at DESC);

-- 2. Add text search index for full-text search
-- =====================================================

-- Create a tsvector column for full-text search
ALTER TABLE plants ADD COLUMN IF NOT EXISTS search_vector tsvector 
GENERATED ALWAYS AS (
  to_tsvector('english', 
    coalesce(common_name, '') || ' ' || 
    coalesce(scientific_name, '') || ' ' || 
    coalesce(description, '')
  )
) STORED;

-- Index the tsvector for fast full-text search
CREATE INDEX IF NOT EXISTS idx_plants_search_vector ON plants USING GIN(search_vector);

-- 3. Optimize text columns for long descriptions
-- =====================================================

-- Add constraint to prevent extremely long descriptions (prevent DOS)
ALTER TABLE plants DROP CONSTRAINT IF EXISTS chk_description_length;
ALTER TABLE plants ADD CONSTRAINT chk_description_length 
  CHECK (char_length(description) <= 5000);

ALTER TABLE plants DROP CONSTRAINT IF EXISTS chk_habitat_length;
ALTER TABLE plants ADD CONSTRAINT chk_habitat_length 
  CHECK (char_length(habitat) <= 2000);

ALTER TABLE plants DROP CONSTRAINT IF EXISTS chk_care_instructions_length;
ALTER TABLE plants ADD CONSTRAINT chk_care_instructions_length 
  CHECK (char_length(care_instructions) <= 3000);

-- 4. Add updated_at trigger for tracking changes
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on plants table
DROP TRIGGER IF EXISTS update_plants_updated_at ON plants;
CREATE TRIGGER update_plants_updated_at
  BEFORE UPDATE ON plants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Add concurrency support with optimistic locking
-- =====================================================

-- Add version column for optimistic locking
ALTER TABLE plants ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Function to increment version on update
CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment version
DROP TRIGGER IF EXISTS increment_plants_version ON plants;
CREATE TRIGGER increment_plants_version
  BEFORE UPDATE ON plants
  FOR EACH ROW
  EXECUTE FUNCTION increment_version();

-- 6. Storage optimizations
-- =====================================================

-- Analyze tables to update statistics for query planner
ANALYZE plants;
ANALYZE categories;

-- 7. Add helpful comments
-- =====================================================

COMMENT ON INDEX idx_plants_common_name IS 'Speeds up searches by plant common name';
COMMENT ON INDEX idx_plants_search_vector IS 'Enables full-text search across name and description';
COMMENT ON COLUMN plants.version IS 'Used for optimistic locking in concurrent updates';
COMMENT ON COLUMN plants.search_vector IS 'Auto-generated full-text search index';

-- 8. Verify indexes
-- =====================================================

SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'plants'
ORDER BY indexname;

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '✅ Performance optimizations applied successfully!';
  RAISE NOTICE '📊 Added indexes: 7';
  RAISE NOTICE '🔍 Full-text search enabled';
  RAISE NOTICE '🔒 Optimistic locking added';
  RAISE NOTICE '📏 Text length constraints added';
END $$;
