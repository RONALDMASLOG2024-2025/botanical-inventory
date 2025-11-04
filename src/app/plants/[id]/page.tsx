"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "../../../lib/supabaseClient";
import { Package, MapPin, Calendar, DollarSign, Tag, Leaf, Info, Home as HomeIcon, Heart } from "lucide-react";

type Plant = {
  id: string;
  common_name: string;
  scientific_name?: string;
  description?: string;
  habitat?: string;
  care_instructions?: string;
  image_url?: string | null;
  category_id?: string;
  is_featured?: boolean;
  // Botanical classification and usage
  family?: string;
  plant_parts_used?: string;
  uses?: string;
  // Inventory fields
  sku?: string;
  quantity?: number;
  minimum_stock?: number;
  unit_price?: number;
  location?: string;
  section?: string;
  status?: string;
  supplier?: string;
  date_acquired?: string;
  inventory_notes?: string;
  created_at?: string;
};

type Category = {
  id: string;
  name: string;
};

export default function PlantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [plant, setPlant] = useState<Plant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]); // Changed to array
  const [loading, setLoading] = useState(true);
  const [plantId, setPlantId] = useState<string | null>(null);

  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params;
      setPlantId(resolvedParams.id);
    }
    getParams();
  }, [params]);

  useEffect(() => {
    if (!plantId) return;
    
    async function load() {
      setLoading(true);
      
      // Load plant data
      const { data, error } = await supabase
        .from("plants")
        .select("*")
        .eq("id", plantId)
        .single();
        
      if (error) {
        console.error(error);
        setPlant(null);
      } else {
        const plantData = data as Plant;
        setPlant(plantData);
        
        // Load categories from junction table
        const { data: plantCategories } = await supabase
          .from("plant_categories")
          .select(`
            category_id,
            categories (
              id,
              name
            )
          `)
          .eq("plant_id", plantId);
        
        if (plantCategories && plantCategories.length > 0) {
          const cats = plantCategories
            .map(pc => (pc as any).categories)
            .filter(Boolean);
          setCategories(cats);
        } else if (plantData.category_id) {
          // Fallback to old category_id if no junction table entries
          const { data: catData } = await supabase
            .from("categories")
            .select("*")
            .eq("id", plantData.category_id)
            .single();
          if (catData) {
            setCategories([catData as Category]);
          }
        }
      }
      setLoading(false);
    }
    load();
  }, [plantId]);

  if (loading) return <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">Loading plant details…</div>;
  if (!plant) return <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">Plant not found.</div>;

  return (
    <article className="relative min-h-screen">
      {/* Floating Bubbles Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-4 top-20 h-64 w-64 animate-float rounded-full bg-emerald-400/30 blur-3xl dark:bg-emerald-400/20"></div>
        <div className="absolute -right-8 top-40 h-56 w-56 animate-float-delay-2 rounded-full bg-green-400/25 blur-3xl dark:bg-green-400/15"></div>
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 animate-float-delay-5 rounded-full bg-teal-400/20 blur-3xl dark:bg-teal-400/10"></div>
        <div className="absolute left-1/4 top-2/3 h-40 w-40 animate-float-delay-3 rounded-full bg-emerald-500/25 blur-2xl dark:bg-emerald-500/15"></div>
        <div className="absolute right-1/4 bottom-1/4 h-48 w-48 animate-float-delay-7 rounded-full bg-green-300/20 blur-2xl dark:bg-green-300/10"></div>
        <div className="absolute bottom-20 left-1/3 h-36 w-36 animate-float-delay-4 rounded-full bg-cyan-400/25 blur-2xl dark:bg-cyan-400/15"></div>
      </div>

      {/* Grid Background */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:14px_24px] opacity-50 dark:opacity-30"></div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/plants" className="inline-flex items-center gap-2 text-[hsl(var(--primary))] hover:underline mb-6">
          ← Back to plants
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Left Column - Image */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="rounded-xl overflow-hidden bg-[hsl(var(--muted))] aspect-square flex items-center justify-center shadow-lg border border-[hsl(var(--border))]">
                {plant.image_url ? (
                  <Image 
                    src={plant.image_url} 
                    alt={plant.common_name} 
                    width={800}
                    height={800}
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[hsl(var(--muted-foreground))]">
                    <Leaf className="h-16 w-16 opacity-20" />
                    <span>No image available</span>
                  </div>
                )}
              </div>
              
              {/* Quantity Info Card */}
              {plant.quantity !== undefined && plant.quantity !== null && (
                <div className="mt-4 p-4 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] flex items-center gap-3">
                  <Package className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                  <div>
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">Available Quantity</div>
                    <div className="text-2xl font-bold text-[hsl(var(--foreground))]">{plant.quantity}</div>
                  </div>
                </div>
              )}
              
              {categories.length > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase">
                      {categories.length === 1 ? 'Category' : 'Categories'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <span 
                        key={cat.id}
                        className="inline-flex px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium rounded-full"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-4xl font-bold text-[hsl(var(--foreground))]">{plant.common_name}</h1>
                {plant.is_featured && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 text-sm font-medium rounded-full whitespace-nowrap">
                    <Heart className="h-3 w-3 fill-current" />
                    Featured
                  </span>
                )}
              </div>
              {plant.scientific_name && (
                <p className="text-xl italic text-[hsl(var(--muted-foreground))] flex items-center gap-2">
                  <Leaf className="h-5 w-5" />
                  {plant.scientific_name}
                </p>
              )}
              {plant.family && (
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Family: <span className="font-semibold text-[hsl(var(--foreground))]">{plant.family}</span>
                </p>
              )}
            </div>

            {/* Plant Parts Used & Uses */}
            {(plant.plant_parts_used || plant.uses) && (
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[hsl(var(--foreground))]">
                  <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Botanical Uses
                </h2>
                <div className="space-y-4">
                  {plant.plant_parts_used && (
                    <div>
                      <div className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-2">Plant Part/s Used</div>
                      <div 
                        className="text-[hsl(var(--foreground))] leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: plant.plant_parts_used }}
                      />
                    </div>
                  )}
                  {plant.uses && (
                    <div>
                      <div className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-2">Uses</div>
                      <div 
                        className="text-[hsl(var(--foreground))] leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: plant.uses }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {plant.description && (
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[hsl(var(--foreground))]">
                  <Info className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Overview
                </h2>
                <div 
                  className="text-[hsl(var(--foreground))] leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: plant.description }}
                />
              </div>
            )}

            {/* Habitat Information */}
            {plant.habitat && (
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[hsl(var(--foreground))]">
                  <HomeIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  Natural Habitat
                </h2>
                <div 
                  className="text-[hsl(var(--foreground))] leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: plant.habitat }}
                />
              </div>
            )}

            {/* Care Instructions */}
            {plant.care_instructions && (
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[hsl(var(--foreground))]">
                  <Heart className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  Care Instructions
                </h2>
                <div 
                  className="text-[hsl(var(--foreground))] leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: plant.care_instructions }}
                />
              </div>
            )}

            {/* Inventory & Location Details */}
            {(plant.location || plant.section || plant.sku || plant.unit_price || plant.date_acquired) && (
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[hsl(var(--foreground))]">
                  <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Additional Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {plant.location && (
                    <div>
                      <div className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Location</div>
                      <div className="font-medium text-[hsl(var(--foreground))]">{plant.location}</div>
                    </div>
                  )}
                  {plant.section && (
                    <div>
                      <div className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Section</div>
                      <div className="font-medium text-[hsl(var(--foreground))]">{plant.section}</div>
                    </div>
                  )}
                  {plant.sku && (
                    <div>
                      <div className="text-sm text-[hsl(var(--muted-foreground))] mb-1">SKU</div>
                      <div className="font-mono text-sm font-medium text-[hsl(var(--foreground))]">{plant.sku}</div>
                    </div>
                  )}
                  {plant.unit_price && (
                    <div>
                      <div className="text-sm text-[hsl(var(--muted-foreground))] mb-1 flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Price per Unit
                      </div>
                      <div className="font-medium text-[hsl(var(--foreground))]">${plant.unit_price.toFixed(2)}</div>
                    </div>
                  )}
                  {plant.date_acquired && (
                    <div>
                      <div className="text-sm text-[hsl(var(--muted-foreground))] mb-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Date Acquired
                      </div>
                      <div className="font-medium text-[hsl(var(--foreground))]">
                        {new Date(plant.date_acquired).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  {plant.supplier && (
                    <div>
                      <div className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Supplier</div>
                      <div className="font-medium text-[hsl(var(--foreground))]">{plant.supplier}</div>
                    </div>
                  )}
                </div>
                
                {plant.inventory_notes && (
                  <div className="mt-4 pt-4 border-t border-[hsl(var(--border))]">
                    <div className="text-sm text-[hsl(var(--muted-foreground))] mb-2">Inventory Notes</div>
                    <div 
                      className="text-sm text-[hsl(var(--foreground))] leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: plant.inventory_notes }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Timestamp */}
            {plant.created_at && (
              <div className="text-sm text-[hsl(var(--muted-foreground))] flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Added on {new Date(plant.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
