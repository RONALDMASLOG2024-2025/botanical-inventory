-- Migration: Update character length constraints to account for HTML formatting
-- 
-- Context: RichTextEditor adds HTML tags (e.g., <b>, <i>, <ul>, <li>, <h3>) which 
-- increases the stored character count. We need to allow for this HTML overhead
-- while maintaining the TEXT-ONLY character limits for user input.
--
-- Formula: Database limit = Text-only limit × 1.5 (to allow 50% HTML overhead)
--
-- Text-only limits (shown to users):
-- - description: 5,000 characters
-- - habitat: 2,000 characters  
-- - care_instructions (careTips): 3,000 characters
-- - plant_parts_used: 500 characters
-- - uses: 2,000 characters
-- - inventory_notes: 1,000 characters
--
-- Database limits (including HTML):
-- - description: 7,500 characters (5000 × 1.5)
-- - habitat: 3,000 characters (2000 × 1.5)
-- - care_instructions: 4,500 characters (3000 × 1.5)
-- - plant_parts_used: 750 characters (500 × 1.5)
-- - uses: 3,000 characters (2000 × 1.5)
-- - inventory_notes: 1,500 characters (1000 × 1.5)

-- Drop existing constraints
ALTER TABLE plants DROP CONSTRAINT IF EXISTS chk_description_length;
ALTER TABLE plants DROP CONSTRAINT IF EXISTS chk_habitat_length;
ALTER TABLE plants DROP CONSTRAINT IF EXISTS chk_care_instructions_length;
ALTER TABLE plants DROP CONSTRAINT IF EXISTS chk_plant_parts_used_length;
ALTER TABLE plants DROP CONSTRAINT IF EXISTS chk_uses_length;
ALTER TABLE plants DROP CONSTRAINT IF EXISTS chk_inventory_notes_length;

-- Add new constraints with HTML overhead
ALTER TABLE plants ADD CONSTRAINT chk_description_length 
  CHECK (char_length(description) <= 7500);

ALTER TABLE plants ADD CONSTRAINT chk_habitat_length 
  CHECK (char_length(habitat) <= 3000);

ALTER TABLE plants ADD CONSTRAINT chk_care_instructions_length 
  CHECK (char_length(care_instructions) <= 4500);

ALTER TABLE plants ADD CONSTRAINT chk_plant_parts_used_length 
  CHECK (char_length(plant_parts_used) <= 750);

ALTER TABLE plants ADD CONSTRAINT chk_uses_length 
  CHECK (char_length(uses) <= 3000);

ALTER TABLE plants ADD CONSTRAINT chk_inventory_notes_length 
  CHECK (char_length(inventory_notes) <= 1500);

-- Verify constraints
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'plants'::regclass 
  AND conname LIKE 'chk_%_length'
ORDER BY conname;
