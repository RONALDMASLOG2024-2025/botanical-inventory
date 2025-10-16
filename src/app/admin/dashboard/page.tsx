"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import { isAdmin } from "../../../lib/auth";
import Button from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Search, Plus, Trash2, Edit, Package, Star, RefreshCw, Filter, TrendingUp } from "lucide-react";

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
  sku?: string;
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Dashboard</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Manage your botanical inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={loadPlants}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Link href="/admin/create">
            <Button className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 shadow-lg shadow-emerald-500/30">
              <Plus className="w-4 h-4" />
              Create Plant
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
      <Card className="bg-[hsl(var(--card))] border-[hsl(var(--border))]">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Plants</CardTitle>
              <CardDescription className="text-sm mt-1">
                Showing {filteredPlants.length} of {totals.plants} plants
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-y border-[hsl(var(--border))]">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Scientific</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Loading plants...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPlants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {searchQuery || categoryFilter !== "all" || statusFilter !== "all" 
                          ? "No plants match your filters. Try adjusting your search."
                          : "No plants yet. Create one to get started!"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredPlants.map((p) => (
                    <tr key={p.id} className="hover:bg-[hsl(var(--muted))]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[hsl(var(--foreground))]">{p.common_name}</span>
                          {p.is_featured && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[hsl(var(--muted-foreground))] italic">
                        {p.scientific_name || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-[hsl(var(--muted-foreground))]">
                        {p.sku || "—"}
                      </td>
                      <td className="px-6 py-4">
                        {p.quantity !== undefined ? (
                          <span className={`text-sm font-semibold ${
                            p.quantity === 0 ? 'text-red-600 dark:text-red-400' : 
                            p.quantity <= 5 ? 'text-orange-600 dark:text-orange-400' : 
                            'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {p.quantity}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(p.status, p.quantity)}
                      </td>
                      <td className="px-6 py-4 text-sm text-[hsl(var(--muted-foreground))]">
                        {p.location || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/plants/${p.id}/edit`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deletePlant(p.id, p.common_name)}
                            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
