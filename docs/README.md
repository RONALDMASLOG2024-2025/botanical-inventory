# Botanical Inventory — Documentation

This folder contains comprehensive documentation for setting up, configuring, and maintaining the Botanical Inventory project.

## 📚 Quick Start Documentation

### Essential Setup Guides

1. **[Google OAuth Setup](GOOGLE_OAUTH_SETUP.md)** — Admin authentication with Google Sign In
2. **[Storage Setup](STORAGE_SETUP.md)** — Plant image uploads and storage configuration
3. **[Storage Quick Reference](STORAGE_QUICK_REF.md)** — Quick lookup for image handling code

### Technical Documentation

- **[Authentication Migration](AUTH_MIGRATION.md)** — Auth system architecture and changes
- **[Database Schema](schema.sql)** — Complete database structure
- **`system-plan.md`** — Full system plan, UI/UX, DB schema and flow
- **`supabase-setup.md`** — How to configure Supabase (tables and storage)
- **`architecture.md`** — High-level architecture and where components live

## 🗂️ Database Migrations

Run these in order in the Supabase SQL Editor:

1. **[001_initial_schema.sql](migrations/001_initial_schema.sql)** — Initial database setup
2. **[002_add_image_url.sql](migrations/002_add_image_url.sql)** — Add image support
3. **[003_storage_setup.sql](migrations/003_storage_setup.sql)** — Storage bucket and policies

## 🚀 Setup Order

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Database Migrations
In Supabase SQL Editor, run migrations 001 → 002 → 003

### 4. Setup Authentication
Follow: [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md)

### 5. Setup Storage
Follow: [STORAGE_SETUP.md](STORAGE_SETUP.md)

### 6. Start Development
```bash
npm run dev
```

## 🔑 Key Features

- ✅ **Admin Authentication** — Google OAuth with database role verification
- ✅ **Plant Management** — Full CRUD operations for botanical data
- ✅ **Image Upload** — Supabase Storage integration with auto-resize
- ✅ **Public Exploration** — Browse plants without authentication
- ✅ **Modern UI** — shadCN-inspired design with Tailwind CSS

## 📊 Architecture

```
Next.js Frontend ↔ Supabase Backend
    ├── Auth (Google OAuth)
    ├── Database (PostgreSQL)
    └── Storage (Plant Images)
```

Refer to the individual documentation files for detailed setup instructions and troubleshooting.

