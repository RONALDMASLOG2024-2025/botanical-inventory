"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "../../../lib/supabaseClient";
import { isAdmin } from "../../../lib/auth";
import Button from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Search, Plus, Trash2, Edit, Package, Star, RefreshCw, Filter, TrendingUp, Leaf, Eye, AlertCircle } from "lucide-react";

type Category = {
  id: string;
  name: string;
};

type Plant = {
  id: string;
  common_name: string;
  scientific_name?: string;
  is_featured?: boolean;
  created_at?: string;
  category_id?: string;
  quantity?: number;
  status?: string;
  location?: string;
  section?: string;
  sku?: string;
  image_url?: string | null;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<Plant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_desc");
  
  const [totals, setTotals] = useState({ plants: 0, featured: 0, lowStock: 0, totalQuantity: 0 });

  useEffect(() => {
    async function checkAuth() {
      setAuthChecking(true);
      const userIsAdmin = await isAdmin();
      if (!userIsAdmin) {
        router.push("/admin");
      } else {
        setAllowed(true);
        loadPlants();
        loadCategories();
      }
      setAuthChecking(false);
    }
    checkAuth();
  }, [router]);

  async function loadCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .order("name");
    
    if (!error && data) {
      setCategories(data);
    }
  }

  async function loadPlants() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("plants")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      const plantsData = (data as Plant[]) || [];
      setPlants(plantsData);
      setFilteredPlants(plantsData);
      
      const featured = plantsData.filter(p => p.is_featured).length || 0;
      const lowStock = plantsData.filter(p => 
        p.quantity !== undefined && p.quantity !== null && p.quantity <= 5
      ).length || 0;
      const totalQuantity = plantsData.reduce((sum, p) => sum + (p.quantity || 0), 0);
      
      setTotals({
        plants: plantsData.length,
        featured,
        lowStock,
        totalQuantity,
      });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  // Apply filters
  useEffect(() => {
    let filtered = [...plants];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.common_name.toLowerCase().includes(query) ||
        p.scientific_name?.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query)
      );
    }
    
    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(p => p.category_id === categoryFilter);
    }
    
    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    
    // Sorting
    switch (sortBy) {
      case "name_asc":
        filtered.sort((a, b) => a.common_name.localeCompare(b.common_name));
        break;
      case "name_desc":
        filtered.sort((a, b) => b.common_name.localeCompare(a.common_name));
        break;
      case "created_desc":
        filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      case "created_asc":
        filtered.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
        break;
      case "quantity_desc":
        filtered.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
        break;
      case "quantity_asc":
        filtered.sort((a, b) => (a.quantity || 0) - (b.quantity || 0));
        break;
    }
    
    setFilteredPlants(filtered);
  }, [searchQuery, categoryFilter, statusFilter, sortBy, plants]);

  async function deletePlant(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    
    try {
      const { error } = await supabase.from("plants").delete().eq("id", id);
      if (error) throw error;
      
      // Auto-refresh
      await loadPlants();
      
    } catch (err) {
      console.error(err);
      alert("Failed to delete plant");
    }
  }

  const getStatusBadge = (status?: string, quantity?: number) => {
    if (!status && quantity === undefined) return null;
    
    const actualStatus = status || (quantity === 0 ? 'out_of_stock' : quantity && quantity <= 5 ? 'low_stock' : 'available');
    
    switch (actualStatus) {
      case 'available':
        return <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0">Available</Badge>;
      case 'low_stock':
        return <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-0">Low Stock</Badge>;
      case 'out_of_stock':
        return <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-0">Out of Stock</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (authChecking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!allowed) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Dashboard</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Manage your botanical inventory</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={loadPlants}
            variant="outline"
            size="sm"
            className="gap-2 flex-1 sm:flex-none"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Link href="/admin/create" className="flex-1 sm:flex-none">
            <Button className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 shadow-lg shadow-emerald-500/30 w-full">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Plant</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[hsl(var(--card))] border-[hsl(var(--border))] hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Total Plants</p>
                <p className="text-3xl font-bold text-[hsl(var(--foreground))] mt-2">{totals.plants}</p>
                {filteredPlants.length !== totals.plants && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{filteredPlants.length} filtered</p>
                )}
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[hsl(var(--card))] border-[hsl(var(--border))] hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Featured</p>
                <p className="text-3xl font-bold text-[hsl(var(--foreground))] mt-2">{totals.featured}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[hsl(var(--card))] border-[hsl(var(--border))] hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Total Stock</p>
                <p className="text-3xl font-bold text-[hsl(var(--foreground))] mt-2">{totals.totalQuantity}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[hsl(var(--card))] border-[hsl(var(--border))] hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Low Stock</p>
                <p className="text-3xl font-bold text-[hsl(var(--foreground))] mt-2">{totals.lowStock}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">≤ 5 units</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Filter className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Card */}
      <Card className="bg-[hsl(var(--card))] border-[hsl(var(--border))]">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <Input
                  id="search"
                  placeholder="Name, scientific, SKU..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">Stock Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort" className="text-sm font-medium">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_desc">Newest First</SelectItem>
                  <SelectItem value="created_asc">Oldest First</SelectItem>
                  <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                  <SelectItem value="quantity_desc">Highest Stock</SelectItem>
                  <SelectItem value="quantity_asc">Lowest Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plants Table Card */}
      <Card className="bg-[hsl(var(--card))] border-[hsl(var(--border))] shadow-sm">
        <CardHeader className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Plant Inventory
              </CardTitle>
              <CardDescription className="text-sm mt-1.5">
                Showing <span className="font-semibold text-[hsl(var(--foreground))]">{filteredPlants.length}</span> of <span className="font-semibold text-[hsl(var(--foreground))]">{totals.plants}</span> plants
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={loadPlants}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading plants...</p>
              </div>
            </div>
          ) : filteredPlants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
              </div>
              <p className="text-base font-medium text-[hsl(var(--foreground))] mb-1">No plants found</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))] text-center max-w-sm">
                {searchQuery || categoryFilter !== "all" || statusFilter !== "all" 
                  ? "No plants match your current filters. Try adjusting your search criteria."
                  : "Get started by creating your first plant entry."}
              </p>
              {!searchQuery && categoryFilter === "all" && statusFilter === "all" && (
                <Link href="/admin/create" className="mt-4">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create First Plant
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
              <div className="inline-block min-w-full align-middle">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[280px] min-w-[280px]">
                        <div className="flex items-center gap-2">
                          <Leaf className="w-4 h-4" />
                          Plant Information
                        </div>
                      </TableHead>
                      <TableHead className="hidden md:table-cell min-w-[100px]">
                        <div className="flex items-center gap-2">
                          SKU
                        </div>
                      </TableHead>
                      <TableHead className="text-center min-w-[80px]">
                        <div className="flex items-center justify-center gap-2">
                          <Package className="w-4 h-4" />
                          Stock
                        </div>
                      </TableHead>
                      <TableHead className="hidden lg:table-cell min-w-[120px]">Status</TableHead>
                      <TableHead className="hidden xl:table-cell min-w-[150px]">Location</TableHead>
                      <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {filteredPlants.map((p) => (
                    <TableRow key={p.id}>
                      {/* Plant Information Cell */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {/* Thumbnail */}
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 flex-shrink-0 border-2 border-[hsl(var(--border))] shadow-sm">
                            {p.image_url ? (
                              <Image
                                src={p.image_url}
                                alt={p.common_name}
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Leaf className="w-7 h-7 text-emerald-400/40 dark:text-emerald-600/40" />
                              </div>
                            )}
                          </div>
                          {/* Plant Details */}
                          <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[hsl(var(--foreground))] truncate">
                                {p.common_name}
                              </span>
                              {p.is_featured && (
                                <div className="flex-shrink-0">
                                  <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-0 px-1.5 py-0 text-xs">
                                    <Star className="w-3 h-3 fill-current" />
                                  </Badge>
                                </div>
                              )}
                            </div>
                            {p.scientific_name && (
                              <span className="text-xs italic text-[hsl(var(--muted-foreground))] truncate">
                                {p.scientific_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* SKU Cell */}
                      <TableCell className="hidden md:table-cell">
                        <code className="text-xs font-mono bg-[hsl(var(--muted))] px-2 py-1 rounded border border-[hsl(var(--border))]">
                          {p.sku || "—"}
                        </code>
                      </TableCell>

                      {/* Quantity Cell */}
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`text-lg font-bold tabular-nums ${
                            p.quantity === 0 ? 'text-red-600 dark:text-red-400' : 
                            p.quantity !== undefined && p.quantity <= 5 ? 'text-orange-600 dark:text-orange-400' : 
                            'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {p.quantity !== undefined ? p.quantity : "—"}
                          </span>
                          <span className="text-xs text-[hsl(var(--muted-foreground))]">
                            units
                          </span>
                        </div>
                      </TableCell>

                      {/* Status Cell */}
                      <TableCell className="hidden lg:table-cell">
                        {getStatusBadge(p.status, p.quantity)}
                      </TableCell>

                      {/* Location Cell */}
                      <TableCell className="hidden xl:table-cell">
                        <div className="flex flex-col gap-0.5">
                          {p.location ? (
                            <>
                              <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                                {p.location}
                              </span>
                              {p.section && (
                                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                                  {p.section}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-[hsl(var(--muted-foreground))]">—</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Actions Cell */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/plants/${p.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/plants/${p.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                              title="Edit Plant"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePlant(p.id, p.common_name)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            title="Delete Plant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
