# 📝 Text Field Character Limits

## Overview

To prevent database storage issues and ensure optimal performance, the following character limits are enforced on plant text fields:

| Field | Character Limit | Approximate Word Count |
|-------|----------------|----------------------|
| **Description** | 5,000 characters | ~750-1,000 words |
| **Habitat** | 2,000 characters | ~300-400 words |
| **Care Instructions** | 3,000 characters | ~450-600 words |

---

## Why These Limits?

### 1. **Database Performance**
- Prevents extremely large text entries that slow down queries
- Keeps database size manageable
- Ensures fast page loads

### 2. **User Experience**
- Encourages concise, readable content
- Prevents overwhelming visitors with too much text
- Maintains consistent layout and design

### 3. **Storage Optimization**
- Prevents potential DOS attacks (extremely long texts)
- Keeps backup sizes reasonable
- Reduces bandwidth usage

### 4. **Multi-Admin Safety**
- With multiple admins, limits prevent accidental huge entries
- Ensures consistent data quality across all entries

---

## Visual Indicators

### Character Counter Colors

**Green (0-79% of limit)**
- Safe zone
- Plenty of room left
- Example: 0-3,999 characters for Description

**Orange (80-99% of limit)**
- Warning zone
- Nearing the limit
- Shows "X remaining"
- Example: 4,000-4,999 characters for Description

**Red (100%+ of limit)**
- Over limit
- Form submission blocked
- Shows "X over limit!" with animation
- Example: 5,001+ characters for Description

---

## User Interface Features

### Real-Time Feedback
```
[Text area]
─────────────────────────────────────
2,543 / 5,000 characters    [████████░░] 2,457 remaining
```

### Visual Progress Bar
- Green: Under 80%
- Orange: 80-99%
- Red: Over 100%
- Animated when over limit

### Form Validation
- ❌ Submit button disabled if any field is over limit
- ❌ Button text changes to "Text too long"
- ❌ Warning message appears under over-limit fields
- ❌ Form won't submit until text is shortened

---

## Examples

### ✅ Good Description Length (2,543 characters)

```
The Red Ixora, scientifically known as Ixora coccinea, is a stunning flowering 
shrub renowned for its vibrant clusters of red blooms and lush, glossy foliage. 
Belonging to the Rubiaceae family, this tropical evergreen is native to Asia and 
is widely cultivated across tropical and subtropical regions worldwide for its 
ornamental appeal and versatility in landscaping.

Standing as a testament to nature's artistic prowess, the Red Ixora's flowers 
are its crowning glory. These compact, rounded clusters, known as inflorescences, 
burst forth in profusion, adorning the plant with a riot of scarlet hues...

[About 750 words total - Well within 5,000 character limit]
```

**Status:** ✅ **Accepted** (2,543 / 5,000 characters)

---

### ⚠️ Near Limit (4,850 characters)

```
[Very long, detailed description with extensive botanical information, 
growing conditions, historical uses, cultural significance, etc.]
```

**Status:** ⚠️ **Warning** (4,850 / 5,000 characters - 150 remaining)
**Action:** Orange indicator, can still save but consider shortening

---

### ❌ Over Limit (5,234 characters)

```
[Extremely detailed description with repetitive information, 
unnecessary details, or copy-pasted from multiple sources]
```

**Status:** ❌ **Error** (5,234 / 5,000 characters - 234 over limit!)
**Action:** 
- Red indicator with animation
- Submit button disabled
- Must shorten by at least 234 characters to proceed

---

## Writing Tips for Staying Within Limits

### Description (5,000 characters)

**Include:**
- Plant appearance and key visual characteristics
- Growth habit and size
- Flowering/fruiting characteristics
- Notable features or unique qualities
- Common uses (ornamental, medicinal, etc.)
- Brief historical or cultural significance

**Avoid:**
- Repetitive phrases
- Overly technical jargon
- Copy-pasting multiple encyclopedia entries
- Excessive detail about minor characteristics

**Example Structure:**
1. Introduction (200-300 chars)
2. Physical Description (800-1,200 chars)
3. Flowers/Fruits (400-600 chars)
4. Growing Characteristics (400-600 chars)
5. Uses and Significance (400-600 chars)

**Total:** ~2,200-3,300 characters (well within 5,000 limit)

---

### Habitat (2,000 characters)

**Include:**
- Native region(s)
- Typical climate conditions
- Soil preferences
- Light requirements
- Moisture needs
- Elevation range
- Associated plant communities

**Avoid:**
- Detailed geological history
- Extensive climate data tables
- Lists of every country where it grows

**Example Structure:**
1. Native range (200-300 chars)
2. Climate preferences (300-400 chars)
3. Soil and light (200-300 chars)
4. Natural habitat type (300-400 chars)

**Total:** ~1,000-1,400 characters (within 2,000 limit)

---

### Care Instructions (3,000 characters)

**Include:**
- Light requirements
- Watering schedule/needs
- Soil type and pH
- Fertilizer recommendations
- Pruning guidance
- Common pests/diseases
- Temperature tolerance
- Propagation methods

**Avoid:**
- Month-by-month detailed schedules
- Extensive pest treatment protocols
- Lists of every possible fertilizer brand

**Example Structure:**
1. Light & Location (250-350 chars)
2. Watering (300-400 chars)
3. Soil & Fertilizer (300-400 chars)
4. Pruning (200-300 chars)
5. Pests & Diseases (300-400 chars)
6. Propagation (200-300 chars)

**Total:** ~1,550-2,150 characters (within 3,000 limit)

---

## Database Migration

The character limits are enforced at the **database level** via CHECK constraints:

```sql
-- From: docs/migrations/008_performance_optimizations.sql

ALTER TABLE plants ADD CONSTRAINT chk_description_length 
  CHECK (char_length(description) <= 5000);

ALTER TABLE plants ADD CONSTRAINT chk_habitat_length 
  CHECK (char_length(habitat) <= 2000);

ALTER TABLE plants ADD CONSTRAINT chk_care_instructions_length 
  CHECK (char_length(care_instructions) <= 3000);
```

**To apply these limits**, run the migration:
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `docs/migrations/008_performance_optimizations.sql`
3. Paste and click "Run"
4. Verify success: "Success. No rows returned"

---

## Error Messages

### Client-Side (Before Submission)
```
⚠️ Description is too long. Please shorten it to save the plant.
```
- Shows under the text area
- Submit button disabled
- Character counter turns red

### Server-Side (If client validation bypassed)
```
❌ Error: new row for relation "plants" violates check constraint "chk_description_length"
```
- Rare (only if JavaScript disabled or API called directly)
- Prevents saving to database
- Maintains data integrity

---

## Frequently Asked Questions

### Q: What if I need more than 5,000 characters for description?
**A:** The 5,000 character limit allows for ~750-1,000 words, which is more than enough for comprehensive plant descriptions. Consider:
- Removing redundant information
- Focusing on the most important characteristics
- Breaking very long sentences into shorter ones
- Using bullet points in the care instructions instead of paragraphs

### Q: Can the limits be increased?
**A:** Yes, but not recommended. The current limits are designed for:
- Optimal database performance
- Good user experience (readable content)
- Fast page loads
- Prevention of abuse

If you have a special case, modify the migration SQL before running it.

### Q: What happens to existing plants with text over the limit?
**A:** 
- Existing data is **grandfathered in** (not affected)
- The constraints only apply to **new inserts and updates**
- When editing an old plant with over-limit text, you'll need to shorten it to save

### Q: Do spaces and line breaks count?
**A:** Yes, all characters count including:
- Spaces
- Line breaks
- Punctuation
- Special characters

### Q: Can I use HTML or Markdown?
**A:** The fields accept plain text only. HTML/Markdown will be displayed as-is (not rendered).

---

## Implementation Details

### Client-Side Validation (`src/app/admin/create/page.tsx`)

```typescript
// Character limits
const LIMITS = {
  description: 5000,
  habitat: 2000,
  careTips: 3000,
};

// Validation before submit
const validationErrors: string[] = [];

if (description.length > LIMITS.description) {
  validationErrors.push(`Description is ${description.length - LIMITS.description} characters too long`);
}
// ... more validations
```

### Character Counter Component (`src/components/CharacterCounter.tsx`)

```typescript
<CharacterCounter 
  current={description.length} 
  max={LIMITS.description}
  fieldName="description"
/>
```

**Features:**
- Real-time character count
- Percentage-based progress bar
- Color-coded status (green/orange/red)
- "Remaining" or "Over limit" messages
- Smooth animations

---

## Best Practices

1. ✅ **Write concisely** - Focus on key information
2. ✅ **Use the character counter** - Watch the indicator colors
3. ✅ **Save drafts** - Don't write extremely long text before checking length
4. ✅ **Edit ruthlessly** - Remove redundant phrases
5. ✅ **Preview before submitting** - Ensure text fits well
6. ❌ **Don't copy-paste** entire Wikipedia articles
7. ❌ **Don't repeat** the same information in multiple fields
8. ❌ **Don't ignore** the orange warning indicator

---

## Summary

| Aspect | Details |
|--------|---------|
| **Description Limit** | 5,000 characters |
| **Habitat Limit** | 2,000 characters |
| **Care Tips Limit** | 3,000 characters |
| **Visual Indicator** | Green → Orange → Red |
| **Form Behavior** | Blocks submission if over limit |
| **Database Enforcement** | CHECK constraints |
| **Migration File** | `008_performance_optimizations.sql` |

**Benefits:**
- ⚡ Faster database performance
- 📊 Consistent data quality
- 🛡️ DOS attack prevention
- 👥 Multi-admin safety
- 📱 Better mobile experience
