"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../../../lib/supabaseClient";
import { isAdmin } from "../../../../../lib/auth";
import Button from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import { Textarea } from "../../../../../components/ui/textarea";
import { Switch } from "../../../../../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../../components/ui/card";
import ImageUpload from "../../../../../components/ImageUpload";
import CharacterCounter from "../../../../../components/CharacterCounter";
import { Package, Leaf, ArrowLeft, AlertCircle } from "lucide-react";

// Define Category type
type Category = {
  id: string;
  name: string;
};

type Plant = {
  id: string;
  common_name: string;
  scientific_name?: string | null;
  description?: string | null;
  habitat?: string | null;
  care_instructions?: string | null;
  category_id?: string | null;
  image_url?: string | null;
  is_featured?: boolean;
  // Inventory fields
  sku?: string | null;
  quantity?: number | null;
  minimum_stock?: number | null;
  unit_price?: number | null;
  location?: string | null;
  section?: string | null;
  supplier?: string | null;
  supplier_contact?: string | null;
  date_acquired?: string | null;
  inventory_notes?: string | null;
  status?: string | null;
};

export default function EditPlant() {
  const router = useRouter();
  const params = useParams();
  const plantId = params?.id as string;

  const [allowed, setAllowed] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Basic plant info
  const [commonName, setCommonName] = useState("");
  const [scientificName, setScientificName] = useState("");
  const [description, setDescription] = useState("");
  const [habitat, setHabitat] = useState("");
  const [careTips, setCareTips] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Inventory fields
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [minimumStock, setMinimumStock] = useState(5);
  const [unitPrice, setUnitPrice] = useState("");
  const [location, setLocation] = useState("");
  const [section, setSection] = useState("");
  const [supplier, setSupplier] = useState("");
  const [supplierContact, setSupplierContact] = useState("");
  const [dateAcquired, setDateAcquired] = useState("");
  const [inventoryNotes, setInventoryNotes] = useState("");

  const [status, setStatus] = useState<string | null>(null);

  // Character limits
  const LIMITS = {
    description: 5000,
    habitat: 2000,
    careTips: 3000,
    inventoryNotes: 1000,
  };

  const hasOverLimitFields = 
    description.length > LIMITS.description ||
    habitat.length > LIMITS.habitat ||
    careTips.length > LIMITS.careTips ||
    inventoryNotes.length > LIMITS.inventoryNotes;

  // Auth check
  useEffect(() => {
    async function checkAuth() {
      console.log("🔐 Checking admin access for /admin/plants/[id]/edit...");
      setAuthChecking(true);
      const userIsAdmin = await isAdmin();
      console.log("  Admin status:", userIsAdmin);

      if (!userIsAdmin) {
        console.warn("⚠️ Access denied - redirecting to admin login");
        router.push("/admin");
      } else {
        console.log("✅ Admin access granted");
        setAllowed(true);
      }
      setAuthChecking(false);
    }
    checkAuth();
  }, [router]);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      console.log("📁 Fetching categories...");
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (error) {
        console.error("❌ Error fetching categories:", error);
      } else {
        console.log("✅ Categories loaded:", data?.length || 0);
        setCategories(data || []);
      }
    }

    if (allowed) {
      fetchCategories();
    }
  }, [allowed]);

  // Load plant data
  useEffect(() => {
    async function loadPlant() {
      if (!allowed || !plantId) return;

      console.log("📥 Loading plant data for ID:", plantId);
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("plants")
          .select("*")
          .eq("id", plantId)
          .single();

        if (error) {
          console.error("❌ Error loading plant:", error);
          setStatus("Plant not found");
          return;
        }

        console.log("✅ Plant loaded:", data);
        const plant = data as Plant;

        setCommonName(plant.common_name || "");
        setScientificName(plant.scientific_name || "");
        setDescription(plant.description || "");
        setHabitat(plant.habitat || "");
        setCareTips(plant.care_instructions || "");
        setCategoryId(plant.category_id || "");
        setIsFeatured(plant.is_featured || false);
        setImageUrl(plant.image_url || null);
        
        // Load inventory fields
        setSku(plant.sku || "");
        setQuantity(plant.quantity || 0);
        setMinimumStock(plant.minimum_stock || 5);
        setUnitPrice(plant.unit_price?.toString() || "");
        setLocation(plant.location || "");
        setSection(plant.section || "");
        setSupplier(plant.supplier || "");
        setSupplierContact(plant.supplier_contact || "");
        setDateAcquired(plant.date_acquired || "");
        setInventoryNotes(plant.inventory_notes || "");
      } catch (err) {
        console.error("❌ Exception loading plant:", err);
        setStatus("Error loading plant");
      } finally {
        setLoading(false);
      }
    }

    loadPlant();
  }, [allowed, plantId]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    console.log("📝 Updating plant...");
    console.log("  ID:", plantId);
    console.log("  Common name:", commonName);

    setSaving(true);
    setStatus("Saving changes...");

    try {
      const plantData = {
        common_name: commonName,
        scientific_name: scientificName || null,
        description: description || null,
        habitat: habitat || null,
        care_instructions: careTips || null,
        category_id: categoryId || null,
        is_featured: isFeatured,
        image_url: imageUrl,
        // Inventory fields
        sku: sku || null,
        quantity: quantity || 0,
        minimum_stock: minimumStock || 5,
        unit_price: unitPrice ? parseFloat(unitPrice) : null,
        location: location || null,
        section: section || null,
        supplier: supplier || null,
        supplier_contact: supplierContact || null,
        date_acquired: dateAcquired || null,
        inventory_notes: inventoryNotes || null,
        // Auto-calculate status based on quantity
        status: quantity === 0 ? 'out_of_stock' : quantity <= minimumStock ? 'low_stock' : 'available',
      };

      console.log("📊 Plant data to update:", plantData);

      const { data, error } = await supabase
        .from("plants")
        .update(plantData)
        .eq("id", plantId)
        .select();

      if (error) {
        console.error("❌ Database error:", error);
        setStatus(`Error: ${error.message}`);
        return;
      }

      console.log("✅ Plant updated successfully:", data);
      setStatus("✅ Plant updated successfully!");

      // Redirect after 1 second
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 1000);
    } catch (err) {
      console.error("❌ Exception during update:", err);
      setStatus("Error updating plant");
    } finally {
      setSaving(false);
    }
  }

  if (authChecking || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[hsl(var(--muted-foreground))]">
            {authChecking ? "Verifying access..." : "Loading plant data..."}
          </p>
        </div>
      </div>
    );
  }

  if (!allowed) return null;

  // Calculate stock status
  const getStockStatus = () => {
    if (quantity === 0) {
      return { label: "Out of Stock", color: "red", icon: "🔴" };
    } else if (quantity <= minimumStock) {
      return { label: "Low Stock", color: "orange", icon: "⚠️", shortage: minimumStock - quantity };
    } else {
      return { label: "Available", color: "emerald", icon: "✅" };
    }
  };

  const stockStatus = getStockStatus();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link 
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Edit Plant</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Update plant information and inventory</p>
        </div>
      </div>

      {/* Validation Alert */}
      {hasOverLimitFields && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900 dark:text-red-100">Character limit exceeded</p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              Please reduce text in fields marked with exceeded limits before saving.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-6">
        {/* Basic Information Card */}
        <Card className="bg-[hsl(var(--card))] border-[hsl(var(--border))] hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Basic Information
            </CardTitle>
            <CardDescription>Essential plant details and classification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commonName">Common Name <span className="text-red-600">*</span></Label>
                <Input 
                  id="commonName"
                  value={commonName} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommonName(e.target.value)} 
                  placeholder="e.g., Rose, Sunflower"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scientificName">Scientific Name</Label>
                <Input 
                  id="scientificName"
                  value={scientificName} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScientificName(e.target.value)} 
                  placeholder="e.g., Rosa rubiginosa"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                value={description} 
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} 
                placeholder="Describe the plant's appearance, characteristics, and uses..."
                rows={4}
              />
              <CharacterCounter 
                current={description.length} 
                max={LIMITS.description}
                fieldName="description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="habitat">Habitat</Label>
              <Textarea 
                id="habitat"
                value={habitat} 
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setHabitat(e.target.value)} 
                placeholder="Where does this plant naturally grow?"
                rows={3}
              />
              <CharacterCounter 
                current={habitat.length} 
                max={LIMITS.habitat}
                fieldName="habitat"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="careTips">Care Instructions</Label>
              <Textarea 
                id="careTips"
                value={careTips} 
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCareTips(e.target.value)} 
                placeholder="Light, water, temperature, and soil requirements..."
                rows={3}
              />
              <CharacterCounter 
                current={careTips.length} 
                max={LIMITS.careTips}
                fieldName="care instructions"
              />
            </div>

            <div className="space-y-2">
              <Label>Plant Image</Label>
              <ImageUpload
                currentImageUrl={imageUrl}
                onImageUploaded={(url) => {
                  console.log("🖼️ Image uploaded:", url);
                  setImageUrl(url);
                }}
                onImageRemoved={() => {
                  console.log("🗑️ Image removed");
                  setImageUrl(null);
                }}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50">
              <Label htmlFor="featured" className="flex flex-col gap-1">
                <span className="font-medium">Featured Plant</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))] font-normal">
                  Display prominently on the home page
                </span>
              </Label>
              <Switch
                id="featured"
                checked={isFeatured}
                onCheckedChange={setIsFeatured}
              />
            </div>
          </CardContent>
        </Card>

        {/* Inventory Management Card */}
        <Card className="bg-[hsl(var(--card))] border-[hsl(var(--border))] hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Inventory Management
            </CardTitle>
            <CardDescription>Stock tracking and supplier information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stock Status Preview */}
            <div className="p-4 rounded-lg bg-[hsl(var(--muted))]/50 border border-[hsl(var(--border))]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">Current Status</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{stockStatus.icon}</span>
                  <span className={`text-sm font-semibold ${
                    stockStatus.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                    stockStatus.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {stockStatus.label}
                  </span>
                </div>
              </div>
              {stockStatus.shortage && stockStatus.shortage > 0 && (
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
                  Need {stockStatus.shortage} more unit{stockStatus.shortage !== 1 ? 's' : ''} to reach minimum stock level
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input 
                  id="sku"
                  value={sku} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSku(e.target.value)} 
                  placeholder="e.g., PLT-001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity in Stock</Label>
                <Input 
                  id="quantity"
                  type="number" 
                  min="0"
                  value={quantity} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(parseInt(e.target.value) || 0)} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumStock">Minimum Stock Level</Label>
                <Input 
                  id="minimumStock"
                  type="number" 
                  min="0"
                  value={minimumStock} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMinimumStock(parseInt(e.target.value) || 0)} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price ($)</Label>
                <Input 
                  id="unitPrice"
                  type="number" 
                  min="0"
                  step="0.01"
                  value={unitPrice} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUnitPrice(e.target.value)} 
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location"
                  value={location} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)} 
                  placeholder="e.g., Greenhouse A"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="section">Section/Zone</Label>
                <Input 
                  id="section"
                  value={section} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSection(e.target.value)} 
                  placeholder="e.g., Section 3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input 
                  id="supplier"
                  value={supplier} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSupplier(e.target.value)} 
                  placeholder="Supplier name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierContact">Supplier Contact</Label>
                <Input 
                  id="supplierContact"
                  value={supplierContact} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSupplierContact(e.target.value)} 
                  placeholder="Email or phone"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="dateAcquired">Date Acquired</Label>
                <Input 
                  id="dateAcquired"
                  type="date" 
                  value={dateAcquired} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateAcquired(e.target.value)} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inventoryNotes">Inventory Notes</Label>
              <Textarea 
                id="inventoryNotes"
                value={inventoryNotes} 
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInventoryNotes(e.target.value)} 
                placeholder="Additional notes about inventory, condition, etc..."
                rows={3}
              />
              <CharacterCounter 
                current={inventoryNotes.length} 
                max={LIMITS.inventoryNotes}
                fieldName="inventory notes"
              />
            </div>
          </CardContent>
        </Card>

        {/* Status Message */}
        {status && (
          <div className={`p-4 rounded-lg ${
            status.includes("✅") || status.includes("success")
              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
              : status.includes("Error") || status.includes("❌")
              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          } font-medium`}>
            {status}
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex items-center gap-4">
          <Button 
            type="submit" 
            disabled={saving || hasOverLimitFields || !commonName.trim()}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </Button>
          
          <Button 
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/dashboard")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
