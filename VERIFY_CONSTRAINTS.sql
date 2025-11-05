-- Run this in Supabase SQL Editor to verify the constraints were updated
-- You should see limits of 7500, 3000, 4500, 750, 3000, 1500

SELECT 
  conname AS constraint_name,
  SUBSTRING(pg_get_constraintdef(oid) FROM 'char_length\([^)]+\) <= (\d+)') AS character_limit
FROM pg_constraint 
WHERE conrelid = 'plants'::regclass 
  AND conname LIKE 'chk_%_length'
ORDER BY conname;

-- Expected results:
-- chk_care_instructions_length  | 4500
-- chk_description_length         | 7500
-- chk_habitat_length             | 3000
-- chk_inventory_notes_length     | 1500
-- chk_plant_parts_used_length    | 750
-- chk_uses_length                | 3000

-- If you see different values (like 3000 for care_instructions), 
-- the migration didn't work. Try running it again.
