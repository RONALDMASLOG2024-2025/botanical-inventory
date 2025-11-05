# Fix: Character Limit Database Error

## The Problem

You're seeing this error:
```
✗ Error: new row for relation "plants" violates check constraint "chk_care_instructions_length"
```

**Why it happens:**
- Your app uses a **RichTextEditor** that adds HTML tags like `<b>`, `<i>`, `<ul>`, `<li>`, etc.
- The app counts **text-only** characters (strips HTML before counting)
- The database counts **all** characters (including HTML tags)
- So the database sees more characters than the app thinks there are!

**Example:**
- User types: "This is **bold** text" (18 characters without formatting)
- Database receives: "This is <b>bold</b> text" (24 characters with HTML)
- Database rejects it if limit is 20!

## The Solution

Update the database constraints to allow for HTML overhead (50% extra space).

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Migration

Copy and paste this SQL:

```sql
-- Update character length constraints to account for HTML formatting

-- Drop existing constraints
ALTER TABLE plants DROP CONSTRAINT IF EXISTS chk_description_length;
ALTER TABLE plants DROP CONSTRAINT IF EXISTS chk_habitat_length;
ALTER TABLE plants DROP CONSTRAINT IF EXISTS chk_care_instructions_length;
ALTER TABLE plants DROP CONSTRAINT IF EXISTS chk_plant_parts_used_length;
ALTER TABLE plants DROP CONSTRAINT IF EXISTS chk_uses_length;
ALTER TABLE plants DROP CONSTRAINT IF EXISTS chk_inventory_notes_length;

-- Add new constraints with HTML overhead (1.5x the text-only limits)
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
```

### Step 3: Click "Run"

You should see: **Success. No rows returned**

### Step 4: Verify the Fix

Run this query to verify the constraints were updated:

```sql
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'plants'::regclass 
  AND conname LIKE 'chk_%_length'
ORDER BY conname;
```

You should see all 6 constraints with the new limits.

## Updated Limits

| Field | Text-Only Limit (User Sees) | Database Limit (Includes HTML) |
|-------|----------------------------|-------------------------------|
| Description | 5,000 chars | 7,500 chars |
| Habitat | 2,000 chars | 3,000 chars |
| Care Instructions | 3,000 chars | 4,500 chars |
| Plant Parts Used | 500 chars | 750 chars |
| Uses | 2,000 chars | 3,000 chars |
| Inventory Notes | 1,000 chars | 1,500 chars |

## After Applying the Fix

- Users still see the same character limits (5000, 2000, 3000, etc.)
- The database now accepts the HTML-formatted content
- The 50% overhead is enough for typical formatting (bold, italic, lists, headings)
- You won't see the constraint violation error anymore!

## Alternative Solution (If Migration Doesn't Work)

If you can't access the Supabase SQL Editor, you can also:

1. **Temporarily disable constraints** (NOT RECOMMENDED for production):
   ```sql
   ALTER TABLE plants DROP CONSTRAINT IF EXISTS chk_care_instructions_length;
   ```

2. **Or contact your database administrator** to apply the migration.

---

**Migration file:** `docs/migrations/010_update_length_constraints_for_html.sql`
