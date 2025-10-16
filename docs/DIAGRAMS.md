# Visual System Diagrams

## Component Hierarchy

```
App (Next.js Layout)
│
├── Navbar (Global)
│   ├── Logo Link to Home
│   ├── Search Bar → /plants?q=term
│   ├── Navigation Links
│   │   ├── Explore (/plants)
│   │   ├── Admin (/admin)
│   │   └── Dashboard (/admin/dashboard) [if logged in]
│   └── Login/Logout Button
│
├── Landing Page (/)
│   ├── Hero Section
│   │   ├── Title & Description
│   │   └── CTA Buttons
│   │       ├── Explore Plants → /plants
│   │       └── Admin Login → /admin
│   └── Features Section
│       ├── Feature Card 1
│       ├── Feature Card 2
│       └── Feature Card 3
│
├── Explore Page (/plants)
│   ├── Page Title
│   ├── Filters Section
│   │   ├── Category Dropdown
│   │   └── Search [via Navbar]
│   ├── Results Info
│   │   └── "Showing X-Y of Z"
│   ├── Plant Grid
│   │   └── PlantCard x N
│   │       ├── Image
│   │       ├── Common Name
│   │       ├── Scientific Name
│   │       ├── Description
│   │       └── Link to Detail
│   └── Pagination
│       ├── Prev Button
│       ├── Page Buttons [1] [2] [3]...
│       └── Next Button
│
├── Plant Detail (/plants/[id])
│   ├── Back Link
│   ├── Plant Image
│   ├── Plant Name & Scientific
│   ├── Featured Badge [if featured]
│   └── Tab Navigation
│       ├── Overview Tab (Description)
│       ├── Habitat Tab
│       └── Care Tab
│
├── Admin Login (/admin)
│   ├── Login Form
│   │   ├── Username Input
│   │   ├── Password Input
│   │   └── Login Button
│   └── Alternative Auth
│       └── Google Login [future]
│
├── Admin Dashboard (/admin/dashboard)
│   ├── Page Title
│   ├── Statistics Cards
│   │   ├── Total Plants Card
│   │   └── Featured Plants Card
│   ├── Create Button → /admin/create
│   └── Plants Table
│       ├── Headers: Name, Scientific, Created, Actions
│       └── Rows
│           ├── Plant Name
│           ├── Scientific Name
│           ├── Created Date
│           └── Action Buttons
│               ├── Edit → /admin/plants/[id]/edit
│               └── Delete (with confirm)
│
├── Create Plant Form (/admin/create)
│   ├── Page Title
│   ├── Form Fields
│   │   ├── Common Name (required)
│   │   ├── Scientific Name
│   │   ├── Description
│   │   ├── Habitat
│   │   ├── Care Tips
│   │   └── Image Upload
│   ├── Form Buttons
│   │   ├── Submit Button
│   │   └── Cancel Link
│   └── Status Message
│       ├── Loading: "Creating…"
│       ├── Success: "✓ Plant created"
│       └── Error: "✗ Error message"
│
└── Edit Plant Form (/admin/plants/[id]/edit)
    ├── Page Title
    ├── Back Link
    ├── Form Fields [pre-filled]
    │   ├── Common Name
    │   ├── Scientific Name
    │   ├── Description
    │   ├── Habitat
    │   ├── Care Tips
    │   ├── Current Image Preview
    │   └── New Image Upload
    ├── Form Buttons
    │   ├── Update Button
    │   └── Cancel Link
    └── Status Message
```

---

## Data Flow Diagram

```
CREATING A PLANT
────────────────

Admin fills form
    ↓
Upload image → Supabase Storage → Get public URL
    ↓
INSERT into plants table
    ↓
✓ Success message
    ↓
Redirect to dashboard
    ↓
New plant appears in table


VIEWING PLANTS (PUBLIC)
──────────────────────

User visits /plants
    ↓
useEffect triggers
    ↓
Query Supabase:
├─ SELECT * FROM plants
├─ (optional) WHERE common_name ILIKE ?
├─ (optional) WHERE category_id = ?
└─ LIMIT 12 OFFSET (page-1)*12
    ↓
Parse response → state
    ↓
Render grid of PlantCard
    ↓
Show pagination if > 12 results
    ↓
User can:
├─ Click card → /plants/[id]
├─ Search → /plants?q=term
├─ Filter → /plants?category=id
└─ Paginate → /plants?page=2


SEARCHING
─────────

User types "rose" in Navbar
    ↓
Form submits
    ↓
Navigate to /plants?q=rose
    ↓
useEffect runs in /plants page
    ↓
Query WHERE common_name ILIKE '%rose%'
    ↓
Results filtered and displayed


FILTERING BY CATEGORY
─────────────────────

User selects "Indoor" dropdown
    ↓
updateParams({ category: id })
    ↓
Navigate to /plants?category=id&page=1
    ↓
useEffect runs
    ↓
Query WHERE category_id = id
    ↓
Results paginated from page 1


AUTHENTICATION
──────────────

Admin enters username + password
    ↓
Compare with env variables
    ↓
Match? → Yes
    ↓
Save to localStorage
    ↓
Set auth state
    ↓
Redirect to /admin/dashboard
    ↓
Dashboard checks isSignedIn()
    ↓
✓ Access granted


PROTECTED ROUTE GUARD
────────────────────

User tries to access /admin/dashboard
    ↓
useEffect runs
    ↓
Call isSignedIn()
    ↓
Check localStorage
    ↓
Found? → No
    ↓
router.push("/admin")
    ↓
User redirected to login
```

---

## State Management Diagram

```
GLOBAL STATE (App-wide)
──────────────────────

Authentication
├─ localStorage ["auth_session"]
│  └─ Contains: { username, timestamp }
└─ Checked by: isSignedIn() function

URL Search Params
├─ ?q=searchterm (search)
├─ ?category=uuid (filter)
└─ ?page=N (pagination)
   └─ Accessed by: useSearchParams()


LOCAL STATE (Component-level)
────────────────────────────

Form Components
├─ commonName (string)
├─ scientificName (string)
├─ description (string)
├─ habitat (string)
├─ careTips (string)
├─ file (File | null)
├─ status (string - feedback)
└─ saving (boolean - loading)

List Components
├─ plants (Plant[])
├─ categories (Category[])
├─ loading (boolean)
├─ total (number)
└─ totals { plants, featured }

Detail Components
├─ selectedTab (string)
├─ imageLoaded (boolean)
└─ expandedSections (Set<string>)


DATABASE STATE
──────────────

Supabase PostgreSQL
├─ plants table
│  ├─ Stores all plant data
│  └─ Indexed for fast search
├─ categories table
│  └─ Category lookup
└─ users table
   └─ Reserved for future


BROWSER CACHE
─────────────

localStorage
├─ auth_session
│  ├─ Key: "isAdmin"
│  └─ Value: timestamp or null
└─ Other site data
   └─ Managed by browser

Images
└─ Cached by browser from Supabase CDN
```

---

## API/Database Call Patterns

```
READ OPERATIONS
───────────────

Get all plants (paginated):
  SELECT * FROM plants
  ORDER BY common_name
  LIMIT 12 OFFSET 0
  → Returns: [Plant, Plant, ...]

Search plants:
  SELECT * FROM plants
  WHERE common_name ILIKE '%rose%'
  → Returns: [Plant, Plant]

Filter by category:
  SELECT * FROM plants
  WHERE category_id = 'uuid-123'
  → Returns: [Plant, Plant, Plant]

Get single plant:
  SELECT * FROM plants
  WHERE id = 'uuid-456'
  → Returns: Plant

Get categories:
  SELECT * FROM categories
  ORDER BY name
  → Returns: [Category, Category, ...]


CREATE OPERATIONS
─────────────────

Create plant:
  INSERT INTO plants
  (common_name, scientific_name, description, habitat, care_tips, image_url)
  VALUES (...)
  → Returns: { success } or { error }

Upload image:
  Storage.upload('plant-images', 'timestamp_filename', file)
  → Returns: { success } or { error }

Get public URL:
  Storage.getPublicUrl('filename')
  → Returns: { publicUrl: 'https://...' }


UPDATE OPERATIONS
─────────────────

Update plant:
  UPDATE plants
  SET common_name = ?, description = ?, ...
  WHERE id = 'uuid-123'
  → Returns: { success } or { error }

Replace image:
  Storage.upload(...) → get URL
  UPDATE plants SET image_url = ?
  → Returns: { success } or { error }


DELETE OPERATIONS
─────────────────

Delete plant:
  DELETE FROM plants
  WHERE id = 'uuid-123'
  → Returns: { success } or { error }

(Note: Storage images not deleted automatically,
 can be cleaned up manually from Supabase)
```

---

## Error Flow

```
OPERATION ATTEMPTS
──────────────────

User Action
    ↓
Try Block ──→ Attempt Operation
    │
    ├─→ Success ──→ Update UI ──→ Show Success Message
    │
    └─→ Error ──→ Catch Block
            ├─→ console.error(err)
            ├─→ Extract message
            └─→ Show Error Message

    ↓
User sees feedback


SPECIFIC ERROR SCENARIOS
────────────────────────

Supabase not configured
  → Show placeholder data
  → Lists work but are empty

No results found
  → Display "No plants found" message
  → Show empty grid

Network error
  → Log to console
  → Show "✗ Network error" message
  → User can retry

Image upload fails
  → Status shows "✗ Upload failed"
  → Form not submitted

Delete fails
  → Alert with error details
  → Item remains in table

Unauthorized access
  → Check isSignedIn()
  → Redirect to /admin
  → Show login form

Input validation
  → Form blocks submission
  → Shows "required" message
  → User fills field

```

---

## Pagination Algorithm

```
INPUTS
──────
- total: 47 plants
- items_per_page: 12
- current_page: 2

CALCULATION
───────────

total_pages = ceil(47 / 12) = 4 pages

from_index = (2 - 1) * 12 = 12
to_index = from_index + 12 - 1 = 23

Query: OFFSET 12 LIMIT 12
Result: Items 13-24

DISPLAY
───────

"Showing 13-24 of 47"

Buttons: [← Prev] [1] [2*] [3] [4] [Next →]
         (* = current)

NAVIGATION
──────────

User clicks page 3
  ↓
updateParams({ page: "3" })
  ↓
Navigate to /plants?page=3
  ↓
useEffect runs with page dependency
  ↓
Calculate: from = (3-1)*12 = 24
  ↓
Query: OFFSET 24 LIMIT 12
  ↓
Show items 25-36
```

---

## Authentication State Machine

```
       ┌─────────────────────────────────────┐
       │      UNAUTHENTICATED STATE          │
       │  (isSignedIn() returns false)        │
       │                                     │
       │  Can access: /admin (login page)    │
       │  Cannot access: /admin/* routes     │
       │  Redirects attempted access to /   │
       └────────┬────────────────────────────┘
                │
                │ User enters correct credentials
                ↓
       ┌─────────────────────────────────────┐
       │      AUTHENTICATED STATE            │
       │  (isSignedIn() returns true)         │
       │  localStorage has auth_session      │
       │                                     │
       │  Can access: All admin routes       │
       │  /admin/dashboard                   │
       │  /admin/create                      │
       │  /admin/plants/[id]/edit            │
       └────────┬────────────────────────────┘
                │
                │ User clicks logout OR clears storage
                ↓
       ┌─────────────────────────────────────┐
       │      UNAUTHENTICATED AGAIN          │
       └─────────────────────────────────────┘

Public routes always accessible:
├─ / (Landing)
├─ /plants (Explore)
└─ /plants/[id] (Detail)
```

---

These diagrams should help visualize how the system works together! 🌿
