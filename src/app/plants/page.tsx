"use client";
import { useEffect, useState, Suspense } from "react";
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
};

type Category = {
  id: string;
  name: string;
};

const ITEMS_PER_PAGE = 12;

function PlantsContent() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const searchParams = useSearchParams();
  const router = useRouter();

  const q = searchParams?.get("q") ?? "";
  const cat = searchParams?.get("category") ?? "";
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

      // Load plants with filters and pagination
      let query = supabase.from("plants").select("*", { count: "exact" }).order("common_name", { ascending: true });

      if (q) {
        query = query.ilike("common_name", `%${q}%`);
      }
      if (cat) {
        query = query.eq("category_id", cat);
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
  }, [q, cat, page]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  function updateParams(newParams: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams?.toString() || "");
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null) params.delete(key);
      else params.set(key, value);
    });
    params.set("page", "1"); // Reset to first page when filters change
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
        <h1 className="text-3xl font-bold mb-6">Explore Plants</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Search by name</label>
          <input
            type="text"
            value={q}
            onChange={(e) => updateParams({ q: e.target.value || null })}
            placeholder="Search for plants..."
            className="w-full px-3 py-2 border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] placeholder:text-[hsl(var(--muted-foreground))]"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            value={cat}
            onChange={(e) => updateParams({ category: e.target.value || null })}
            className="w-full px-3 py-2 border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="text-[hsl(var(--muted-foreground))]">Loading…</p>}

      {!loading && plants.length === 0 && <p className="text-[hsl(var(--muted-foreground))]">No plants found.</p>}

      {!loading && total > 0 && (
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, total)} of {total}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {plants.map((p) => (
          <PlantCard key={p.id} id={p.id} name={p.common_name} scientificName={p.scientific_name} description={p.description} imageUrl={p.image_url ?? undefined} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mb-6">
          {page > 1 && (
            <button onClick={() => updateParams({ page: String(page - 1) })} className="px-3 py-1 border border-[hsl(var(--border))] rounded hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]">
              ← Prev
            </button>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => updateParams({ page: String(p) })}
              className={`px-3 py-1 rounded ${p === page ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" : "border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"}`}
            >
              {p}
            </button>
          ))}
          {page < totalPages && (
            <button onClick={() => updateParams({ page: String(page + 1) })} className="px-3 py-1 border border-[hsl(var(--border))] rounded hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]">
              Next →
            </button>
          )}
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
