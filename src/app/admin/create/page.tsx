"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { isAdmin } from "../../../lib/auth";
import Button from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import ImageUpload from "../../../components/ImageUpload";
import CharacterCounter from "../../../components/CharacterCounter";
import RichTextEditor from "../../../components/RichTextEditor";
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
  const [categoryIds, setCategoryIds] = useState<string[]>([]); // Changed to array
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  
  // Botanical classification and usage
  const [family, setFamily] = useState("");
  const [plantPartsUsed, setPlantPartsUsed] = useState("");
  const [uses, setUses] = useState("");
  
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
    plantPartsUsed: 500,
    uses: 2000,
  };

  const hasOverLimitFields = 
    description.replace(/<[^>]*>/g, '').length > LIMITS.description ||
    habitat.replace(/<[^>]*>/g, '').length > LIMITS.habitat ||
    careTips.replace(/<[^>]*>/g, '').length > LIMITS.careTips ||
    inventoryNotes.replace(/<[^>]*>/g, '').length > LIMITS.inventoryNotes ||
    plantPartsUsed.replace(/<[^>]*>/g, '').length > LIMITS.plantPartsUsed ||
    uses.replace(/<[^>]*>/g, '').length > LIMITS.uses;

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
    
    const descriptionTextLength = description.replace(/<[^>]*>/g, '').length;
    const habitatTextLength = habitat.replace(/<[^>]*>/g, '').length;
    const careTipsTextLength = careTips.replace(/<[^>]*>/g, '').length;
    const inventoryNotesTextLength = inventoryNotes.replace(/<[^>]*>/g, '').length;
    const plantPartsUsedTextLength = plantPartsUsed.replace(/<[^>]*>/g, '').length;
    const usesTextLength = uses.replace(/<[^>]*>/g, '').length;
    
    if (descriptionTextLength > LIMITS.description) {
      validationErrors.push(`Description is ${descriptionTextLength - LIMITS.description} characters too long`);
    }
    if (habitatTextLength > LIMITS.habitat) {
      validationErrors.push(`Habitat is ${habitatTextLength - LIMITS.habitat} characters too long`);
    }
    if (careTipsTextLength > LIMITS.careTips) {
      validationErrors.push(`Care instructions are ${careTipsTextLength - LIMITS.careTips} characters too long`);
    }
    if (inventoryNotesTextLength > LIMITS.inventoryNotes) {
      validationErrors.push(`Inventory notes are ${inventoryNotesTextLength - LIMITS.inventoryNotes} characters too long`);
    }
    if (plantPartsUsedTextLength > LIMITS.plantPartsUsed) {
      validationErrors.push(`Plant parts used is ${plantPartsUsedTextLength - LIMITS.plantPartsUsed} characters too long`);
    }
    if (usesTextLength > LIMITS.uses) {
      validationErrors.push(`Uses is ${usesTextLength - LIMITS.uses} characters too long`);
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
        category_id: categoryIds.length > 0 ? categoryIds[0] : null, // Keep for backward compatibility
        is_featured: isFeatured,
        image_url: imageUrl,
        created_at: new Date().toISOString(),
        
        // Botanical classification and usage
        family: family || null,
        plant_parts_used: plantPartsUsed || null,
        uses: uses || null,
        
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

      // Debug: Log character lengths with HTML
      console.log("📊 Field lengths (including HTML):");
      console.log("  description:", description?.length || 0, "chars");
      console.log("  habitat:", habitat?.length || 0, "chars");
      console.log("  care_instructions:", careTips?.length || 0, "chars (DB limit: 4500)");
      console.log("  plant_parts_used:", plantPartsUsed?.length || 0, "chars");
      console.log("  uses:", uses?.length || 0, "chars");
      console.log("  inventory_notes:", inventoryNotes?.length || 0, "chars");

      const { data: newPlant, error } = await supabase
        .from("plants")
        .insert([plantData])
        .select()
        .single();

      if (error) {
        let userMessage = error.message || "Unknown database error";
        if (error.code === 'PGRST116') {
          userMessage = "Table 'plants' not found. Please run database migrations.";
        } else if (error.code === '23505') {
          userMessage = "A plant with this name already exists.";
        } else if (error.code === '42501') {
          userMessage = "Permission denied. Please check Row Level Security policies.";
        } else if (error.message?.includes('chk_') && error.message?.includes('length')) {
          // Extract field name from constraint error
          const match = error.message.match(/chk_(\w+)_length/);
          const fieldName = match ? match[1].replace(/_/g, ' ') : 'field';
          const actualLength = error.message.includes('care_instructions') ? careTips?.length : 
                               error.message.includes('description') ? description?.length :
                               error.message.includes('habitat') ? habitat?.length :
                               error.message.includes('plant_parts_used') ? plantPartsUsed?.length :
                               error.message.includes('uses') ? uses?.length :
                               error.message.includes('inventory_notes') ? inventoryNotes?.length : 0;
          userMessage = `❌ Database constraint error: ${fieldName} is too long (${actualLength} characters including HTML tags). The database limit may not have been updated. Please run the SQL migration in docs/migrations/010_update_length_constraints_for_html.sql`;
        }
        throw new Error(userMessage);
      }

      // Insert categories into junction table
      if (newPlant && categoryIds.length > 0) {
        const categoryInserts = categoryIds.map(catId => ({
          plant_id: newPlant.id,
          category_id: catId
        }));
        
        const { error: catError } = await supabase
          .from("plant_categories")
          .insert(categoryInserts);
        
        if (catError) {
          console.error("Error inserting categories:", catError);
          // Don't fail the whole operation if categories fail
        }
      }

      setStatus("✓ Plant created successfully!");
      
      // Reset form
      setCommonName("");
      setScientificName("");
      setDescription("");
      setHabitat("");
      setCareTips("");
      setCategoryIds([]); // Reset to empty array
      setIsFeatured(false);
      setImageUrl(null);
      setFamily("");
      setPlantPartsUsed("");
      setUses("");
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
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))]">Create New Plant</h1>
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

              <div className="space-y-2">
                <Label htmlFor="family">Family</Label>
                <Input 
                  id="family"
                  value={family} 
                  onChange={(e) => setFamily(e.target.value)}
                  placeholder="e.g., MYRTACEAE, ROSACEAE" 
                  maxLength={200}
                />
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Botanical family classification</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categories">Categories (Multiple Selection)</Label>
              <div className="border border-[hsl(var(--input))] rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto bg-[hsl(var(--background))]">
                {categories.length === 0 ? (
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">No categories available</p>
                ) : (
                  categories.map((cat) => (
                    <div key={cat.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`category-${cat.id}`}
                        checked={categoryIds.includes(cat.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCategoryIds([...categoryIds, cat.id]);
                          } else {
                            setCategoryIds(categoryIds.filter(id => id !== cat.id));
                          }
                        }}
                        className="w-4 h-4 rounded border-[hsl(var(--input))] text-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--ring))]"
                      />
                      <label 
                        htmlFor={`category-${cat.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {cat.name}
                      </label>
                    </div>
                  ))
                )}
              </div>
              {categoryIds.length > 0 && (
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {categoryIds.length} {categoryIds.length === 1 ? 'category' : 'categories'} selected
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Describe the plant's appearance, characteristics, and uses..."
                maxLength={LIMITS.description}
                rows={4}
                className={description.replace(/<[^>]*>/g, '').length > LIMITS.description ? 'border-[hsl(var(--destructive))]' : ''}
              />
              <CharacterCounter 
                current={description.replace(/<[^>]*>/g, '').length} 
                max={LIMITS.description}
                fieldName="description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="habitat">Habitat</Label>
              <RichTextEditor
                value={habitat}
                onChange={setHabitat}
                placeholder="Where does this plant naturally grow?"
                maxLength={LIMITS.habitat}
                rows={3}
                className={habitat.replace(/<[^>]*>/g, '').length > LIMITS.habitat ? 'border-[hsl(var(--destructive))]' : ''}
              />
              <CharacterCounter 
                current={habitat.replace(/<[^>]*>/g, '').length} 
                max={LIMITS.habitat}
                fieldName="habitat"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="careTips">Care Instructions</Label>
              <RichTextEditor
                value={careTips}
                onChange={setCareTips}
                placeholder="Light, water, temperature, and soil requirements..."
                maxLength={LIMITS.careTips}
                rows={3}
                className={careTips.replace(/<[^>]*>/g, '').length > LIMITS.careTips ? 'border-[hsl(var(--destructive))]' : ''}
              />
              <CharacterCounter 
                current={careTips.replace(/<[^>]*>/g, '').length} 
                max={LIMITS.careTips}
                fieldName="care instructions"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plantPartsUsed">Plant Part/s Used</Label>
              <RichTextEditor
                value={plantPartsUsed}
                onChange={setPlantPartsUsed}
                placeholder="e.g., ROOTS, BARK, FRUIT, FLOWER, LEAVES, STEMS..."
                maxLength={LIMITS.plantPartsUsed}
                rows={2}
                className={plantPartsUsed.replace(/<[^>]*>/g, '').length > LIMITS.plantPartsUsed ? 'border-[hsl(var(--destructive))]' : ''}
              />
              <CharacterCounter 
                current={plantPartsUsed.replace(/<[^>]*>/g, '').length} 
                max={LIMITS.plantPartsUsed}
                fieldName="plant parts used"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="uses">Uses</Label>
              <RichTextEditor
                value={uses}
                onChange={setUses}
                placeholder="e.g., ANTHELMINTIC, JAUNDICE, CONSTIPATION, VAGINAL WASH, CHOREA, DIABETES, ANTI-MICROBIAL..."
                maxLength={LIMITS.uses}
                rows={3}
                className={uses.replace(/<[^>]*>/g, '').length > LIMITS.uses ? 'border-[hsl(var(--destructive))]' : ''}
              />
              <CharacterCounter 
                current={uses.replace(/<[^>]*>/g, '').length} 
                max={LIMITS.uses}
                fieldName="uses"
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
              <RichTextEditor
                value={inventoryNotes}
                onChange={setInventoryNotes}
                placeholder="Additional notes about this inventory item..."
                maxLength={LIMITS.inventoryNotes}
                rows={3}
                className={inventoryNotes.replace(/<[^>]*>/g, '').length > LIMITS.inventoryNotes ? 'border-[hsl(var(--destructive))]' : ''}
              />
              <CharacterCounter 
                current={inventoryNotes.replace(/<[^>]*>/g, '').length} 
                max={LIMITS.inventoryNotes}
                fieldName="inventory notes"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <Button 
            type="submit" 
            disabled={loading || imageUploading || hasOverLimitFields}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {loading ? "Creating..." : imageUploading ? "Uploading image..." : "Create Plant"}
          </Button>
          
          <Button 
            type="button"
            onClick={() => router.push("/admin/dashboard")}
            variant="outline"
            className="w-full sm:w-auto"
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
