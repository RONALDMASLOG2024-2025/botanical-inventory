"use client";
import { useEffect, useState, Suspense, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient";
import PlantCard from "../../components/PlantCard";
import { useSearchParams, useRouter } from "next/navigation";

type Plant = {
  id: string;
  common_name: string;
  scientific_name?: string;
  description?: string;
  image_url?: string | null;
  category_id?: string;
  family?: string;
  uses?: string;
  plant_parts_used?: string;
};

type Category = {
  id: string;
  name: string;
};

const ITEMS_PER_PAGE = 12;

function PlantsContent() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [families, setFamilies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const searchParams = useSearchParams();
  const router = useRouter();

  const q = searchParams?.get("q") ?? "";
  const cat = searchParams?.get("category") ?? "";
  const fam = searchParams?.get("family") ?? "";
  const sort = searchParams?.get("sort") ?? "name_asc";
  const page = parseInt(searchParams?.get("page") ?? "1");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        // show placeholder content when supabase not configured
        setPlants([
          { id: "1", common_name: "Fiddle Leaf Fig", scientific_name: "Ficus lyrata", description: "Large glossy leaves", image_url: "/plants/fiddle.jpg" },
          { id: "2", common_name: "Monstera", scientific_name: "Monstera deliciosa", description: "Perforated leaves", image_url: null },
        ]);
        setCategories([
          { id: "1", name: "Indoor" },
          { id: "2", name: "Outdoor" },
        ]);
        setTotal(2);
        setLoading(false);
        return;
      }

      // Load categories
      const { data: catData } = await supabase.from("categories").select("*").order("name");
      if (mounted) setCategories((catData as Category[]) || []);

      // Load unique families
      const { data: familyData } = await supabase
        .from("plants")
        .select("family")
        .not("family", "is", null)
        .order("family");
      
      if (mounted && familyData) {
        const uniqueFamilies = [...new Set(familyData.map(p => p.family).filter(Boolean))] as string[];
        setFamilies(uniqueFamilies);
      }

      // Load plants with filters and pagination
      let query = supabase.from("plants").select("*", { count: "exact" });

      if (q) {
        query = query.or(`common_name.ilike.%${q}%,scientific_name.ilike.%${q}%,uses.ilike.%${q}%`);
      }
      if (cat) {
        query = query.eq("category_id", cat);
      }
      if (fam) {
        query = query.eq("family", fam);
      }

      // Apply sorting
      switch (sort) {
        case "name_asc":
          query = query.order("common_name", { ascending: true });
          break;
        case "name_desc":
          query = query.order("common_name", { ascending: false });
          break;
        case "scientific_asc":
          query = query.order("scientific_name", { ascending: true, nullsFirst: false });
          break;
        case "scientific_desc":
          query = query.order("scientific_name", { ascending: false, nullsFirst: false });
          break;
        default:
          query = query.order("common_name", { ascending: true });
      }

      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) {
        console.error(error);
        setPlants([]);
      } else if (mounted) {
        setPlants((data as Plant[]) || []);
        setTotal(count || 0);
      }
      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, [q, cat, fam, sort, page]);

  // Keyboard navigation for pagination
  const goToPage = useCallback((pageNum: number) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("page", String(pageNum));
    router.push(`/plants?${params.toString()}`);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [router, searchParams]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Only handle if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      
      const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
      
      if (e.key === 'ArrowLeft' && page > 1) {
        e.preventDefault();
        goToPage(page - 1);
      } else if (e.key === 'ArrowRight' && page < totalPages) {
        e.preventDefault();
        goToPage(page + 1);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [page, total, goToPage]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  function updateParams(newParams: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams?.toString() || "");
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null) params.delete(key);
      else params.set(key, value);
    });
    // Only reset to page 1 if we're not explicitly setting the page
    if (!newParams.hasOwnProperty('page')) {
      params.set("page", "1");
    }
    router.push(`/plants?${params.toString()}`);
  }

  return (
    <section className="relative min-h-screen">
      {/* Floating Bubbles Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Bubbles */}
        <div className="absolute -left-4 top-20 h-64 w-64 animate-float rounded-full bg-emerald-400/30 blur-3xl"></div>
        <div className="absolute -right-8 top-40 h-56 w-56 animate-float-delay-2 rounded-full bg-green-400/25 blur-3xl"></div>
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 animate-float-delay-5 rounded-full bg-teal-400/20 blur-3xl"></div>
        <div className="absolute left-1/4 top-2/3 h-40 w-40 animate-float-delay-3 rounded-full bg-emerald-500/25 blur-2xl"></div>
        <div className="absolute right-1/4 bottom-1/4 h-48 w-48 animate-float-delay-7 rounded-full bg-green-300/20 blur-2xl"></div>
        <div className="absolute bottom-20 left-1/3 h-36 w-36 animate-float-delay-4 rounded-full bg-cyan-400/25 blur-2xl"></div>
      </div>

      {/* Grid Background */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[hsl(var(--background))] bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:14px_24px] opacity-50 dark:opacity-30"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[hsl(var(--foreground))] mb-2">Explore Plants</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Discover our botanical collection</p>
        </div>

        {/* Advanced Filters Card */}
        <div className="mb-8 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter & Search
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Search
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={q}
                  onChange={(e) => updateParams({ q: e.target.value || null })}
                  placeholder="Search by name, scientific name, or uses..."
                  className="w-full pl-10 pr-4 py-2.5 border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-[hsl(var(--muted-foreground))] transition-all"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Category
              </label>
              <select
                value={cat}
                onChange={(e) => updateParams({ category: e.target.value || null })}
                className="w-full px-3 py-2.5 border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Family Filter */}
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Family
              </label>
              <select
                value={fam}
                onChange={(e) => updateParams({ family: e.target.value || null })}
                className="w-full px-3 py-2.5 border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                <option value="">All Families</option>
                {families.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort and Active Filters Row */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            {/* Sort By */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                Sort by:
              </label>
              <select
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="px-3 py-1.5 border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
              >
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="scientific_asc">Scientific Name (A-Z)</option>
                <option value="scientific_desc">Scientific Name (Z-A)</option>
              </select>
            </div>

            {/* Active Filters */}
            {(q || cat || fam) && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-[hsl(var(--muted-foreground))]">Active filters:</span>
                {q && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full">
                    Search: &quot;{q}&quot;
                    <button onClick={() => updateParams({ q: null })} className="hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded-full p-0.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {cat && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
                    Category
                    <button onClick={() => updateParams({ category: null })} className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {fam && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium rounded-full">
                    Family: {fam}
                    <button onClick={() => updateParams({ family: null })} className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                <button 
                  onClick={() => updateParams({ q: null, category: null, family: null })}
                  className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[hsl(var(--muted-foreground))]">Loading plants...</p>
          </div>
        </div>
      )}

      {!loading && plants.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[hsl(var(--muted-foreground))] text-lg">No plants found.</p>
          <p className="text-[hsl(var(--muted-foreground))] text-sm mt-2">Try adjusting your filters or search terms.</p>
        </div>
      )}

      {!loading && total > 0 && (
        <div className="mb-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Showing <span className="font-semibold text-[hsl(var(--foreground))]">{(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, total)}</span> of <span className="font-semibold text-[hsl(var(--foreground))]">{total}</span> plants
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {plants.map((p) => (
          <PlantCard key={p.id} id={p.id} name={p.common_name} scientificName={p.scientific_name} description={p.description} imageUrl={p.image_url ?? undefined} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="space-y-4">
          {/* Desktop Pagination */}
          <div className="hidden sm:flex justify-center items-center gap-2 flex-wrap">
            <button 
              onClick={() => goToPage(page - 1)} 
              disabled={page <= 1}
              className="px-4 py-2 border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              ← Previous
            </button>
            
            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {/* First page */}
              {page > 3 && (
                <>
                  <button
                    onClick={() => goToPage(1)}
                    className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] transition-colors"
                  >
                    1
                  </button>
                  {page > 4 && <span className="px-2 text-[hsl(var(--muted-foreground))]">...</span>}
                </>
              )}
              
              {/* Pages around current */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === page || p === page - 1 || p === page + 1 || p === page - 2 || p === page + 2)
                .filter(p => p > 0 && p <= totalPages)
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`px-3 py-2 rounded-lg transition-colors font-medium ${
                      p === page 
                        ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm" 
                        : "border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              
              {/* Last page */}
              {page < totalPages - 2 && (
                <>
                  {page < totalPages - 3 && <span className="px-2 text-[hsl(var(--muted-foreground))]">...</span>}
                  <button
                    onClick={() => goToPage(totalPages)}
                    className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] transition-colors"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            
            <button 
              onClick={() => goToPage(page + 1)} 
              disabled={page >= totalPages}
              className="px-4 py-2 border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Next →
            </button>
          </div>
          
          {/* Mobile Pagination (Compact) */}
          <div className="flex sm:hidden justify-between items-center gap-2">
            <button 
              onClick={() => goToPage(page - 1)} 
              disabled={page <= 1}
              className="px-4 py-2 border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex-1"
            >
              ← Prev
            </button>
            
            <div className="px-4 py-2 border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--muted))] text-sm font-medium">
              {page} / {totalPages}
            </div>
            
            <button 
              onClick={() => goToPage(page + 1)} 
              disabled={page >= totalPages}
              className="px-4 py-2 border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex-1"
            >
              Next →
            </button>
          </div>
          
          {/* Page Info */}
          <div className="text-center text-sm text-[hsl(var(--muted-foreground))]">
            Page <span className="font-semibold text-[hsl(var(--foreground))]">{page}</span> of <span className="font-semibold text-[hsl(var(--foreground))]">{totalPages}</span>
            <span className="hidden sm:inline"> • Use ← → arrow keys to navigate</span>
          </div>
        </div>
      )}
      </div>
    </section>
  );
}

export default function PlantsPage() {
  return (
    <Suspense fallback={
      <section className="relative min-h-screen">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-6">Explore Plants</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Loading plants...</p>
        </div>
      </section>
    }>
      <PlantsContent />
    </Suspense>
  );
}
