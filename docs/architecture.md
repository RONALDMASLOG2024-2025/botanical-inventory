# System Architecture & Flowcharts

## User Flow Diagrams

### Public User Journey
```
Landing (/)
    ↓
    ├─→ Explore Plants (/plants)
    │       ├─→ Search bar in Navbar
    │       ├─→ Filter by category
    │       ├─→ Paginate results
    │       └─→ Click plant card
    │           ↓
    │       Plant Detail (/plants/[id])
    │           ├─→ View Overview tab
    │           ├─→ View Habitat tab
    │           └─→ View Care tab
    │
    └─→ Admin Login (/admin)
```

### Admin User Journey
```
Admin Login (/admin)
    ↓
    [Enter credentials]
    ↓
Admin Dashboard (/admin/dashboard)
    ├─→ View stats (plants, featured count)
    ├─→ View plants table
    │
    ├─→ Create New Plant
    │   ↓
    │   Create Form (/admin/create)
    │   ├─→ Fill metadata
    │   ├─→ Upload image
    │   └─→ Submit → Success
    │       ↓
    │       Dashboard (updated)
    │
    ├─→ Edit Plant
    │   ↓
    │   Edit Form (/admin/plants/[id]/edit)
    │   ├─→ Update fields
    │   ├─→ Replace image (optional)
    │   └─→ Submit → Success
    │       ↓
    │       Dashboard (updated)
    │
    └─→ Delete Plant
        ├─→ Confirm dialog
        └─→ Dashboard (updated)
```

## Technology Stack

- **Framework**: Next.js 15.5.5 (App Router), React 19.1.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 + custom UI primitives
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage (plant-images bucket)
- **Auth**: Simple localStorage-based with env credentials

## Complete Routes

**Public**: / → /plants → /plants/[id]
**Admin**: /admin → /admin/dashboard → /admin/create → /admin/plants/[id]/edit
