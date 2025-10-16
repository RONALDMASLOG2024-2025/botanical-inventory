# 🌿 Botanical Inventory System

A modern, full-stack botanical garden management system built with Next.js and Supabase. Features admin dashboard with Google OAuth authentication, plant CRUD operations, and public plant exploration.

## ✨ Features

### For Admins
- 🔐 **Google OAuth Authentication** — Secure admin access with pre-registered accounts
- ✏️ **Plant Management** — Create, edit, and delete plant records
- 🖼️ **Image Upload** — Drag-and-drop image uploads with auto-resize and optimization
- 📊 **Dashboard** — View statistics and manage inventory
- 🎨 **Modern UI** — Clean, professional design inspired by shadCN UI

### For Public Users
- 🔍 **Browse Plants** — Explore botanical collection without login
- 🔎 **Search & Filter** — Find plants by name or category
- 📖 **Detailed Views** — View plant information, images, and care instructions
- 📱 **Responsive** — Works seamlessly on mobile and desktop

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account ([create one free](https://supabase.com))

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env.local` in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from your Supabase project settings → API.

### 3. Database Setup
Run these SQL files in Supabase SQL Editor (in order):

1. `docs/migrations/001_initial_schema.sql` — Create tables
2. `docs/migrations/002_add_image_url.sql` — Add image support
3. `docs/migrations/003_storage_setup.sql` — Setup storage bucket

### 4. Setup Authentication
Follow the guide: **[docs/GOOGLE_OAUTH_SETUP.md](docs/GOOGLE_OAUTH_SETUP.md)**

**Quick steps:**
- Enable Google provider in Supabase (Authentication → Providers)
- Add redirect URL: `http://localhost:3000/admin/callback`
- Add your admin email to the `users` table with `role='admin'`

### 5. Setup Storage
Follow the guide: **[docs/STORAGE_SETUP.md](docs/STORAGE_SETUP.md)**

**Quick verify:**
- Bucket `plant-images` exists and is **public**
- Storage policies are enabled (4 total)

### 6. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📖 Documentation

Complete documentation is in the `docs/` folder:

- **[Setup Guides](docs/README.md)** — Quick start index
- **[Google OAuth Setup](docs/GOOGLE_OAUTH_SETUP.md)** — Admin authentication
- **[Storage Setup](docs/STORAGE_SETUP.md)** — Image upload configuration
- **[Storage Quick Ref](docs/STORAGE_QUICK_REF.md)** — Code examples and API
- **[Auth Migration](docs/AUTH_MIGRATION.md)** — Authentication architecture
- **[Database Schema](docs/schema.sql)** — Complete schema

## 🗂️ Project Structure

```
botanical-inventory/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Landing page
│   │   ├── admin/             # Admin section
│   │   │   ├── page.tsx       # Google OAuth login
│   │   │   ├── callback/      # OAuth callback handler
│   │   │   ├── dashboard/     # Admin dashboard
│   │   │   └── create/        # Create plant form
│   │   └── plants/            # Public plant pages
│   │       ├── page.tsx       # Plant listing
│   │       └── [id]/          # Plant detail
│   ├── components/            # React components
│   │   ├── navbar.tsx         # Navigation with auth state
│   │   ├── ImageUpload.tsx    # Image upload component
│   │   └── ui/                # UI primitives
│   └── lib/                   # Utilities
│       ├── supabaseClient.ts  # Supabase client
│       ├── auth.ts            # Authentication helpers
│       └── uploadImage.ts     # Image upload utilities
├── docs/                      # Documentation
│   ├── migrations/            # SQL migrations
│   └── *.md                   # Setup guides
└── public/                    # Static assets
```

## 🔧 Tech Stack

- **Frontend:** Next.js 15.5.5 (App Router), React 19, TypeScript 5
- **Backend:** Supabase (PostgreSQL + Storage + Auth)
- **Authentication:** Google OAuth via Supabase Auth
- **Styling:** Tailwind CSS v4
- **Design:** shadCN UI-inspired components

## 🎯 Key Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page with hero and features |
| `/plants` | Public | Browse all plants with search/filter |
| `/plants/[id]` | Public | Plant detail page with tabs |
| `/admin` | Public | Admin login (Google Sign In) |
| `/admin/callback` | Public | OAuth redirect handler |
| `/admin/dashboard` | **Admin only** | Plant management dashboard |
| `/admin/create` | **Admin only** | Create new plant |
| `/admin/plants/[id]/edit` | **Admin only** | Edit existing plant |

## 🔐 Authentication Flow

1. Admin clicks "Sign in with Google" at `/admin`
2. Redirected to Google OAuth consent screen
3. After approval, redirected to `/admin/callback`
4. System checks if user email exists in `users` table with `role='admin'`
5. If admin → Dashboard access granted
6. If not admin → Access denied, redirect to home

**Only pre-registered admins can access the admin panel.**

## 🖼️ Image Upload Features

- **Auto-resize** — Images resized to 1200px width before upload
- **Optimization** — JPEG quality set to 85% for smaller files
- **Validation** — File type (JPEG/PNG/WebP) and size (5MB max) checked
- **Preview** — Real-time preview before upload
- **Progress** — Loading states during upload
- **Delete** — Remove images with confirmation

## 🗄️ Database Schema

### Tables

**plants**
- `id` (uuid, PK) — Unique identifier
- `common_name` (text) — Display name
- `scientific_name` (text) — Latin name
- `description` (text) — Plant description
- `care_instructions` (text) — Care guide
- `category` (text) — Plant category
- `image_url` (text) — Storage URL
- `is_featured` (boolean) — Show on homepage
- `created_at` (timestamp) — Creation time

**users**
- `id` (uuid, PK) — Unique identifier
- `email` (text, unique) — User email
- `role` (text) — 'admin' or 'user'
- `created_at` (timestamp) — Registration time

**categories** (optional)
- `id` (uuid, PK)
- `name` (text)
- `description` (text)

## 🔒 Security

- ✅ Google OAuth for authentication
- ✅ Database-verified admin roles
- ✅ Row-level security on storage
- ✅ Public read, authenticated write for images
- ✅ File type and size validation
- ✅ Session-based auth with Supabase

## 🐛 Troubleshooting

### Common Issues

**"Access denied" on admin login**
- Verify your email is in `users` table with `role='admin'`
- Check Google OAuth is enabled in Supabase
- Confirm redirect URL is added

**Images not displaying (404)**
- Check bucket `plant-images` is set to **public**
- Verify storage policies are enabled
- Ensure image_url is saved in database

**Upload fails**
- Check file size < 5MB
- Verify file type is JPEG/PNG/WebP
- Ensure user is authenticated
- Check storage policies allow INSERT

**See detailed troubleshooting:**
- [Google OAuth issues](docs/GOOGLE_OAUTH_SETUP.md#troubleshooting)
- [Storage issues](docs/STORAGE_SETUP.md#troubleshooting)

## 📝 Development

### Run Dev Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Lint Code
```bash
npm run lint
```

### Type Check
```bash
npx tsc --noEmit
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

5. **Update OAuth redirect URL** in Supabase:
   - Add `https://your-domain.vercel.app/admin/callback`

### Other Platforms

Works with any Next.js-compatible platform (Netlify, Railway, etc.)

## 🎨 Customization

### Update Branding
- Edit `src/app/page.tsx` for landing page content
- Modify `src/components/navbar.tsx` for site name
- Update colors in `src/app/globals.css`

### Add More Fields
1. Add column to `plants` table
2. Update TypeScript types
3. Add form fields in create/edit pages
4. Update display in detail pages

### Change Image Bucket
- Update bucket name in `src/lib/uploadImage.ts`
- Update policies in migration file
- Recreate bucket in Supabase

## 📄 License

MIT License - feel free to use this project for your own botanical inventory needs.

## 🤝 Contributing

Contributions welcome! Please read the documentation first and ensure:
- Code follows existing patterns
- TypeScript types are correct
- UI matches shadCN aesthetic
- Features are documented

## 📧 Support

For issues:
1. Check documentation in `docs/`
2. Review troubleshooting sections
3. Check Supabase logs
4. Open an issue with details

## 🌟 Features Roadmap

- [ ] Multiple images per plant
- [ ] Image gallery with lightbox
- [ ] Admin user management UI
- [ ] Advanced search with filters
- [ ] Export plants to CSV
- [ ] Public API
- [ ] Mobile app
- [ ] QR code plant labels

---

Built with ❤️ using Next.js and Supabase
