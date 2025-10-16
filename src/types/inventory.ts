// =====================================================
// Inventory Management Types
// =====================================================

export type PlantStatus = 
  | 'available' 
  | 'low_stock' 
  | 'out_of_stock' 
  | 'reserved' 
  | 'discontinued';

export type InventoryChangeType = 
  | 'restock' 
  | 'sale' 
  | 'adjustment' 
  | 'loss' 
  | 'transfer' 
  | 'initial';

export interface Plant {
  // Existing fields
  id: string;
  common_name: string;
  scientific_name?: string | null;
  description?: string | null;
  habitat?: string | null;
  care_instructions?: string | null;
  category_id?: string | null;
  image_url?: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at?: string | null;
  
  // Performance optimization fields
  version?: number;
  search_vector?: string | null;
  
  // Inventory management fields
  sku?: string | null;
  quantity: number;
  minimum_stock: number;
  unit_price?: number | null;
  location?: string | null;
  section?: string | null;
  status: PlantStatus;
  supplier?: string | null;
  supplier_contact?: string | null;
  date_acquired?: string | null; // ISO date string
  last_restocked?: string | null; // ISO timestamp
  inventory_notes?: string | null;
}

export interface InventoryHistory {
  id: string;
  plant_id: string;
  change_type: InventoryChangeType;
  quantity_before: number;
  quantity_after: number;
  quantity_change: number;
  reason?: string | null;
  reference_number?: string | null;
  changed_by: string;
  changed_at: string;
  metadata?: Record<string, any> | null;
}

export interface LowStockPlant {
  id: string;
  sku?: string | null;
  common_name: string;
  scientific_name?: string | null;
  quantity: number;
  minimum_stock: number;
  shortage: number; // quantity - minimum_stock
  location?: string | null;
  status: PlantStatus;
  supplier?: string | null;
  last_restocked?: string | null;
  category_name?: string | null;
}

export interface InventorySummary {
  category_name: string;
  total_plants: number;
  total_quantity: number;
  available_quantity: number;
  low_stock_count: number;
  out_of_stock_count: number;
  total_inventory_value: number;
}

export interface InventoryStats {
  total_plants: number;
  total_quantity: number;
  total_value: number;
  low_stock_count: number;
  out_of_stock_count: number;
  available_count: number;
  unique_locations: number;
}

// Form data for creating/updating plants
export interface PlantFormData {
  common_name: string;
  scientific_name?: string;
  description?: string;
  habitat?: string;
  care_instructions?: string;
  category_id?: string;
  image_url?: string | null;
  is_featured: boolean;
  
  // Inventory fields
  sku?: string;
  quantity: number;
  minimum_stock: number;
  unit_price?: number;
  location?: string;
  section?: string;
  status: PlantStatus;
  supplier?: string;
  supplier_contact?: string;
  date_acquired?: string;
  inventory_notes?: string;
}

// Inventory adjustment data
export interface InventoryAdjustment {
  plant_id: string;
  change_type: InventoryChangeType;
  quantity_change: number; // Can be positive (add) or negative (remove)
  reason?: string;
  reference_number?: string;
}
