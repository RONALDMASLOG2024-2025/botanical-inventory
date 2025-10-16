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
  const [category, setCategory] = useState<Category | null>(null);
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
        
        // Load category if exists
        if (plantData.category_id) {
          const { data: catData } = await supabase
            .from("categories")
            .select("*")
            .eq("id", plantData.category_id)
            .single();
          setCategory(catData as Category);
        }
      }
      setLoading(false);
    }
    load();
  }, [plantId]);

  // Get stock status with color
  const getStockStatus = () => {
    if (!plant?.quantity && plant?.quantity !== 0) return null;
    
    if (plant.quantity === 0) {
      return { label: "Out of Stock", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400", icon: "🔴" };
    } else if (plant.minimum_stock && plant.quantity <= plant.minimum_stock) {
      return { label: "Low Stock", color: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400", icon: "⚠️" };
    } else {
      return { label: "In Stock", color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400", icon: "✅" };
    }
  };

  const stockStatus = getStockStatus();

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
              
              {/* Quick Info Cards */}
              {stockStatus && (
                <div className={`mt-4 p-4 rounded-lg ${stockStatus.color} flex items-center gap-2`}>
                  <Package className="h-5 w-5" />
                  <div>
                    <div className="font-semibold">{stockStatus.icon} {stockStatus.label}</div>
                    {plant.quantity !== undefined && (
                      <div className="text-sm opacity-90">{plant.quantity} available</div>
                    )}
                  </div>
                </div>
              )}
              
              {category && (
                <div className="mt-3 p-3 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] flex items-center gap-2">
                  <Tag className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  <span className="text-sm font-medium">{category.name}</span>
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
            </div>

            {/* Description */}
            {plant.description && (
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[hsl(var(--foreground))]">
                  <Info className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Overview
                </h2>
                <p className="text-[hsl(var(--foreground))] leading-relaxed">{plant.description}</p>
              </div>
            )}

            {/* Habitat Information */}
            {plant.habitat && (
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[hsl(var(--foreground))]">
                  <HomeIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  Natural Habitat
                </h2>
                <p className="text-[hsl(var(--foreground))] leading-relaxed">{plant.habitat}</p>
              </div>
            )}

            {/* Care Instructions */}
            {plant.care_instructions && (
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[hsl(var(--foreground))]">
                  <Heart className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  Care Instructions
                </h2>
                <p className="text-[hsl(var(--foreground))] leading-relaxed whitespace-pre-line">{plant.care_instructions}</p>
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
                    <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed">{plant.inventory_notes}</p>
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
