# Quick Start Guide

## For Developers

### 1. Setup Environment
```bash
cd botanical-inventory
npm install
```

### 2. Configure Supabase
- Create a free account at [supabase.com](https://supabase.com)
- Create a new project
- Copy the project URL and anon key
- Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-key]
NEXT_PUBLIC_ADMIN_USERNAME=admin
NEXT_PUBLIC_ADMIN_PASSWORD=password123
```

### 3. Initialize Database
- Go to Supabase dashboard → SQL Editor
- Create a new query and paste contents of `docs/schema.sql`
- Execute the query
- In Storage, create a bucket named `plant-images` with public access

### 4. Run Development Server
```bash
npm run dev
```
- Open http://localhost:3000
- System works with placeholder data until Supabase is configured

### 5. Test the System

**As a Public User:**
1. Visit home page
2. Click "Explore Plants"
3. Browse, search, filter by category
4. Click a plant card to view details
5. Use tabs to see description, habitat, care tips

**As an Admin:**
1. Click "Admin Login" or visit `/admin`
2. Login with credentials from `.env.local` (default: admin/password123)
3. View dashboard with all plants
4. Click "Create New Plant" to add one
5. Fill form and upload image
6. Click plant row to edit it
7. Delete plants with confirmation

---

## Troubleshooting

### "Cannot find module @supabase/supabase-js"
- Run `npm install` to fetch dependencies
- The system has a fallback stub so it works without it

### Supabase queries return empty
- Check `.env.local` has correct URL and key
- Verify database schema was run successfully
- Check Supabase project is active

### Images not displaying
- Ensure `plant-images` storage bucket exists and is public
- Check image URL in database (should start with your Supabase URL)
- Verify file upload succeeds without errors

### Admin login not working
- Check `.env.local` credentials match what you enter
- Try clearing browser localStorage: DevTools → Application → Local Storage → Clear
- Verify `.env.local` is in the root `botanical-inventory` folder

---

## File Reference

**Key Pages:**
- `/` - Landing page
- `/plants` - Explore all plants
- `/plants/[id]` - Plant detail view
- `/admin` - Admin login
- `/admin/dashboard` - Manage plants
- `/admin/create` - Create new plant
- `/admin/plants/[id]/edit` - Edit plant

**Key Components:**
- `Navbar.tsx` - Header with search
- `PlantCard.tsx` - Plant grid item
- `ui/button.tsx`, `ui/input.tsx`, `ui/card.tsx` - UI primitives

**Utilities:**
- `lib/supabaseClient.ts` - Database client
- `lib/auth.ts` - Authentication helpers

---

## Database Guide

### Add a Plant Category
In Supabase SQL Editor:
```sql
INSERT INTO categories (name) VALUES ('Indoor');
INSERT INTO categories (name) VALUES ('Outdoor');
INSERT INTO categories (name) VALUES ('Medicinal');
```

### Add a Sample Plant
```sql
INSERT INTO plants (common_name, scientific_name, category_id, description, habitat, care_tips)
VALUES (
  'Spider Plant',
  'Chlorophytum comosum',
  (SELECT id FROM categories WHERE name = 'Indoor'),
  'A popular houseplant with long, slender leaves',
  'Native to tropical regions of Africa',
  'Water weekly, bright indirect light, well-draining soil'
);
```

### Query Plants
```sql
-- All plants
SELECT * FROM plants ORDER BY common_name;

-- Plants by category
SELECT p.* FROM plants p
JOIN categories c ON p.category_id = c.id
WHERE c.name = 'Indoor'
ORDER BY p.common_name;

-- Search by name
SELECT * FROM plants
WHERE common_name ILIKE '%spider%'
ORDER BY common_name;
```

---

## Feature Checklist

- ✅ Public explore page with search & filter
- ✅ Plant detail pages with tabs
- ✅ Admin login/authentication
- ✅ Create plants with image upload
- ✅ Edit plants
- ✅ Delete plants
- ✅ Category filtering
- ✅ Pagination
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states

---

## Performance Tips

- Images are lazy-loaded
- Pagination limits queries to 12 items
- Category filter reduces query results
- Database indexes speed up search

---

## Support

For issues:
1. Check browser console for JavaScript errors
2. Check Network tab for failed API calls
3. Verify `.env.local` values
4. Check Supabase project status
5. Ensure database schema was imported correctly

---

**Happy gardening! 🌱**
