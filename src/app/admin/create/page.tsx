"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { isAdmin } from "../../../lib/auth";
import Button from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Textarea } from "../../../components/ui/textarea";
import ImageUpload from "../../../components/ImageUpload";
import CharacterCounter from "../../../components/CharacterCounter";
import { Package, Leaf, MapPin, DollarSign, Calendar, AlertCircle } from "lucide-react";

type Category = {
  id: string;
  name: string;
};

export default function AdminCreatePage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  
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
  const [imageUploading, setImageUploading] = useState(false);
  
  // Inventory fields
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [minimumStock, setMinimumStock] = useState(5);
  const [unitPrice, setUnitPrice] = useState("");
  const [location, setLocation] = useState("");
  const [section, setSection] = useState("");
  const [supplier, setSupplier] = useState("");
  const [supplierContact, setSupplierContact] = useState("");
  const [dateAcquired, setDateAcquired] = useState(new Date().toISOString().split('T')[0]);
  const [inventoryNotes, setInventoryNotes] = useState("");
  
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      setAuthChecking(true);
      const userIsAdmin = await isAdmin();
      
      if (!userIsAdmin) {
        router.push("/admin");
      } else {
        setAllowed(true);
      }
      setAuthChecking(false);
    }
    checkAuth();
  }, [router]);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");
      
      if (!error && data) {
        setCategories(data);
      }
    }
    
    if (allowed) {
      fetchCategories();
    }
  }, [allowed]);

  // Calculate stock status
  const getStockStatus = () => {
    if (quantity === 0) return { label: "Out of Stock", color: "destructive", icon: "⚠️" };
    if (quantity <= minimumStock) return { label: "Low Stock", color: "warning", icon: "📉" };
    return { label: "Available", color: "success", icon: "✅" };
  };

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    
    if (imageUploading) {
      setStatus("⚠️ Please wait for image upload to complete");
      return;
    }
    
    // Validate text lengths
    const validationErrors: string[] = [];
    
    if (description.length > LIMITS.description) {
      validationErrors.push(`Description is ${description.length - LIMITS.description} characters too long`);
    }
    if (habitat.length > LIMITS.habitat) {
      validationErrors.push(`Habitat is ${habitat.length - LIMITS.habitat} characters too long`);
    }
    if (careTips.length > LIMITS.careTips) {
      validationErrors.push(`Care instructions are ${careTips.length - LIMITS.careTips} characters too long`);
    }
    if (inventoryNotes.length > LIMITS.inventoryNotes) {
      validationErrors.push(`Inventory notes are ${inventoryNotes.length - LIMITS.inventoryNotes} characters too long`);
    }
    
    if (validationErrors.length > 0) {
      setStatus(`❌ ${validationErrors.join('. ')}. Please shorten the text.`);
      return;
    }
    
    setLoading(true);
    setStatus("Creating plant...");

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
        created_at: new Date().toISOString(),
        
        // Inventory fields
        sku: sku || null,
        quantity: quantity,
        minimum_stock: minimumStock,
        unit_price: unitPrice ? parseFloat(unitPrice) : null,
        location: location || null,
        section: section || null,
        supplier: supplier || null,
        supplier_contact: supplierContact || null,
        date_acquired: dateAcquired || new Date().toISOString().split('T')[0],
        inventory_notes: inventoryNotes || null,
      };

      const { error } = await supabase
        .from("plants")
        .insert([plantData])
        .select();

      if (error) {
        let userMessage = error.message || "Unknown database error";
        if (error.code === 'PGRST116') {
          userMessage = "Table 'plants' not found. Please run database migrations.";
        } else if (error.code === '23505') {
          userMessage = "A plant with this name already exists.";
        } else if (error.code === '42501') {
          userMessage = "Permission denied. Please check Row Level Security policies.";
        }
        throw new Error(userMessage);
      }

      setStatus("✓ Plant created successfully!");
      
      // Reset form
      setCommonName("");
      setScientificName("");
      setDescription("");
      setHabitat("");
      setCareTips("");
      setCategoryId("");
      setIsFeatured(false);
      setImageUrl(null);
      setSku("");
      setQuantity(0);
      setMinimumStock(5);
      setUnitPrice("");
      setLocation("");
      setSection("");
      setSupplier("");
      setSupplierContact("");
      setDateAcquired(new Date().toISOString().split('T')[0]);
      setInventoryNotes("");
      
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 2000);

    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus("✗ Error: " + message);
    } finally {
      setLoading(false);
    }
  }

  if (authChecking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[hsl(var(--muted-foreground))]">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!allowed) return null;

  const stockStatus = getStockStatus();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Create New Plant</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Add a new plant to the botanical inventory</p>
      </div>

      <form onSubmit={handleCreate} className="space-y-6">
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
                <Label htmlFor="commonName">Common Name <span className="text-[hsl(var(--destructive))]">*</span></Label>
                <Input 
                  id="commonName"
                  value={commonName} 
                  onChange={(e) => setCommonName(e.target.value)} 
                  placeholder="e.g., Rose, Sunflower"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scientificName">Scientific Name</Label>
                <Input 
                  id="scientificName"
                  value={scientificName} 
                  onChange={(e) => setScientificName(e.target.value)}
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
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className={description.length > LIMITS.description ? 'border-[hsl(var(--destructive))]' : ''}
                rows={4}
                placeholder="Describe the plant's appearance, characteristics, and uses..."
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
                onChange={(e) => setHabitat(e.target.value)} 
                className={habitat.length > LIMITS.habitat ? 'border-[hsl(var(--destructive))]' : ''}
                rows={3}
                placeholder="Where does this plant naturally grow?"
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
                onChange={(e) => setCareTips(e.target.value)} 
                className={careTips.length > LIMITS.careTips ? 'border-[hsl(var(--destructive))]' : ''}
                rows={3}
                placeholder="Light, water, temperature, and soil requirements..."
              />
              <CharacterCounter 
                current={careTips.length} 
                max={LIMITS.careTips}
                fieldName="care instructions"
              />
            </div>

            <div className="space-y-2">
              <ImageUpload
                currentImageUrl={imageUrl}
                onImageUploaded={(url) => setImageUrl(url)}
                onImageRemoved={() => setImageUrl(null)}
                onUploadingChange={(isUploading) => setImageUploading(isUploading)}
                label="Plant Image"
                required={false}
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                id="featured"
                checked={isFeatured}
                onCheckedChange={setIsFeatured}
              />
              <Label htmlFor="featured" className="cursor-pointer">
                Feature this plant on the homepage
              </Label>
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
                  <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                    stockStatus.color === 'destructive' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                    stockStatus.color === 'warning' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  }`}>
                    {stockStatus.label}
                  </span>
                </div>
              </div>
              {quantity > 0 && quantity <= minimumStock && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  Shortage: {minimumStock - quantity} units below minimum stock level
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU / Product Code</Label>
                <Input 
                  id="sku"
                  value={sku} 
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="PLT-001" 
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity <span className="text-[hsl(var(--destructive))]">*</span></Label>
                <Input 
                  id="quantity"
                  type="number"
                  value={quantity} 
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  min={0}
                  required 
                />
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Current stock count</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumStock">Minimum Stock Level</Label>
                <Input 
                  id="minimumStock"
                  type="number"
                  value={minimumStock} 
                  onChange={(e) => setMinimumStock(parseInt(e.target.value) || 0)}
                  min={0}
                />
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Alert when below this amount</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitPrice" className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  Unit Price
                </Label>
                <Input 
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  value={unitPrice} 
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Location
                </Label>
                <Input 
                  id="location"
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Main Greenhouse, Section A" 
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="section">Section / Aisle</Label>
                <Input 
                  id="section"
                  value={section} 
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="B2, Row 5" 
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input 
                  id="supplier"
                  value={supplier} 
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Supplier name" 
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierContact">Supplier Contact</Label>
                <Input 
                  id="supplierContact"
                  value={supplierContact} 
                  onChange={(e) => setSupplierContact(e.target.value)}
                  placeholder="Email or phone" 
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateAcquired" className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Date Acquired
                </Label>
                <Input 
                  id="dateAcquired"
                  type="date"
                  value={dateAcquired} 
                  onChange={(e) => setDateAcquired(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inventoryNotes">Inventory Notes</Label>
              <Textarea 
                id="inventoryNotes"
                value={inventoryNotes} 
                onChange={(e) => setInventoryNotes(e.target.value)} 
                className={inventoryNotes.length > LIMITS.inventoryNotes ? 'border-[hsl(var(--destructive))]' : ''}
                rows={3}
                placeholder="Additional notes about this inventory item..."
              />
              <CharacterCounter 
                current={inventoryNotes.length} 
                max={LIMITS.inventoryNotes}
                fieldName="inventory notes"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center gap-4">
          <Button 
            type="submit" 
            disabled={loading || imageUploading || hasOverLimitFields}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : imageUploading ? "Uploading image..." : "Create Plant"}
          </Button>
          
          <Button 
            type="button"
            onClick={() => router.push("/admin/dashboard")}
            variant="outline"
          >
            Cancel
          </Button>

          {status && (
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium ${
              status.includes("✓") 
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" 
                : status.includes("✗") || status.includes("❌")
                ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}>
              {status}
            </div>
          )}
        </div>

        {hasOverLimitFields && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">
              Some fields exceed their character limits. Please shorten the text before submitting.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
