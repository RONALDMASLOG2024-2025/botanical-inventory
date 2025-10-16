# Botanical Garden — System Plan

That’s a great project idea — a **Botanical Garden Inventory & Explorer System** sounds both visually appealing 🌿 and technically solid with **Supabase + Next.js + ShadCN UI**. Let’s design a **modern, structured plan** that balances admin management and public exploration.

Below is a full breakdown of the **system plan**, including structure, design system, UI/UX flow, and database schema.

---

## 🌱 PROJECT OVERVIEW

**App Name:** *Botanical Garden* 
**Goal:** To allow **admins** to manage plant data and **explorers** (public users) to visually explore the garden’s collection — by categories, tags, or even map visualization.

---

## 🧩 1. CORE FEATURES

### 👨‍💼 Admin

* **Google Auth Login (Supabase Auth)**
* Dashboard overview (total species, plants, recent uploads)
* Add, edit, delete plant entries
* Upload plant photos (Supabase Storage)
* Manage plant categories (trees, flowers, herbs, etc.)
* Option to “feature” plants for the homepage
* Manage garden zones or locations (optional)
* View visitor analytics (page views, favorites, etc.)

### 🌿 Explorer (Public)

* View all plants (grid view)
* Search and filter by category, color, scientific name, etc.
* Plant detail page (photo, description, habitat, status)
* View featured plants on home page
* Option to “favorite” plants (stored locally in browser)
* Map or section view of garden zones (optional future feature)

---

## 🎨 2. MODERN DESIGN CONCEPT (UI/UX)

### 🧠 Design Philosophy

* **Minimal, natural, and modern.**
* Soft greens, whites, and subtle textures (to reflect nature).
* Rounded corners, shadows, and clean typography.
* Consistent spacing, card-based layout.
* Smooth transitions (Framer Motion).

---

### 🌿 Color Palette

| Element   | Color     | Use                                        |
| --------- | --------- | ------------------------------------------ |
| Primary   | `#3B7A57` | Natural green accent (buttons, highlights) |
| Secondary | `#A8D5BA` | Light mint for hover, backgrounds          |
| Neutral   | `#F8F9FA` | Background                                 |
| Text      | `#1E1E1E` | Dark text                                  |
| Border    | `#E0E0E0` | Card outlines                              |

---

### 🖼️ Visual Components (ShadCN UI)

| Page                    | Components Used                                                       |
| ----------------------- | --------------------------------------------------------------------- |
| **Home (Explorer)**     | Hero section, featured plant cards, category chips                    |
| **Plant List**          | Search bar, filter dropdowns, responsive grid of cards                |
| **Plant Details**       | Large image, tabs for “Description”, “Habitat”, “Care”                |
| **Admin Dashboard**     | Sidebar layout, stats cards, data table (TanStack Table)              |
| **Add/Edit Plant Form** | Dialog or sheet modal, file uploader (Supabase Storage), input fields |
| **Login Page**          | Centered card with Google login button                                |

---

## ⚙️ 3. SYSTEM STRUCTURE (Next.js App Router)

```
/app
  /page.tsx                -> Home (Explorer view)
  /plants/page.tsx         -> Public plant listing
  /plants/[id]/page.tsx    -> Plant details
  /admin/page.tsx          -> Dashboard overview
  /admin/plants/page.tsx   -> Manage plants table
  /admin/plants/new        -> Add new plant form
  /login/page.tsx          -> Google Auth login (Supabase)
  /api                     -> Server actions (CRUD)
```

---

## 🗃️ 4. DATABASE SCHEMA (Supabase)

### **Tables**

#### `plants`

| Column          | Type      | Description           |
| --------------- | --------- | --------------------- |
| id              | uuid      | Primary key           |
| common_name     | text      | Common name           |
| scientific_name | text      | Scientific name       |
| category_id     | uuid      | FK → categories.id    |
| description     | text      | Rich text or markdown |
| habitat         | text      | Habitat info          |
| image_url       | text      | Supabase storage path |
| is_featured     | boolean   | For homepage          |
| created_at      | timestamp | Auto                  |

#### `categories`

| Column | Type | Description                  |
| ------ | ---- | ---------------------------- |
| id     | uuid | Primary key                  |
| name   | text | e.g., Trees, Shrubs, Flowers |

#### `users`

| Column | Type | Description           |
| ------ | ---- | --------------------- |
| id     | uuid | Supabase user id      |
| email  | text | Admin email           |
| role   | text | "admin" or "explorer" |

> Note: Explorers don’t need login; admins are validated via Supabase Auth with an `authorized_admins` list or table.

---

## 🔐 5. AUTH & ROUTING LOGIC

* **Public routes:** `/`, `/plants`, `/plants/[id]`
* **Protected routes (Admin):** `/admin/*`
* **Middleware (Next.js)** checks:

  ```ts
  if (!session && pathname.startsWith("/admin")) redirect("/login");
  if (session && !isAdmin) redirect("/");
  ```

---

## 📱 6. UI PAGES FLOW

### 🏠 Home (Public)

* Hero: “Explore the Botanical Garden”
* Search bar + Categories
* Featured plants carousel
* CTA: “View All Plants”

### 🌿 Plant List

* Search + filter chips (category, native, etc.)
* Grid of plant cards
* Pagination / infinite scroll

### 🌼 Plant Details

* Large image on top
* Tabs: Overview | Habitat | Care Tips
* Optional: Similar plants section

### 🧭 Admin Dashboard

* Summary cards: total plants, categories, featured plants
* Manage buttons
* Sidebar navigation

### 🌱 Manage Plants Page

* Table (Name, Category, Date, Actions)
* Add new button (opens modal)
* Edit/Delete actions

---

## 🚀 7. FUTURE ENHANCEMENTS

* Map integration (plot plant locations in garden)
* AI-based plant recognition (upload photo → detect species)
* Export data (CSV or PDF)
* PWA support for offline exploration

---

## 🧰 8. TECH STACK SUMMARY

| Layer           | Technology                        |
| --------------- | --------------------------------- |
| Frontend        | Next.js 15 (App Router), React 19 |
| Styling         | Tailwind CSS + ShadCN/UI          |
| Database        | Supabase Postgres                 |
| Auth            | Supabase Auth (Google)            |
| File Storage    | Supabase Storage                  |
| Charts / Tables | Recharts, TanStack Table          |
| Animation       | Framer Motion                     |

---

Would you like me to generate the **UI layout wireframes (visual design sketches)** next — e.g., for the **Explorer Home, Plant Details, and Admin Dashboard** — so you can visualize how the app will look before building it?
