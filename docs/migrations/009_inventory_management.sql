-- =====================================================
-- Migration 009: Inventory Management System
-- =====================================================
-- Purpose: Add inventory tracking fields to plants table
-- Features: Quantity, SKU, pricing, location, status tracking
-- Date: 2025-10-16

-- 1. Add inventory tracking columns
-- =====================================================

-- SKU/Product Code for inventory management
ALTER TABLE plants ADD COLUMN IF NOT EXISTS sku VARCHAR(50) UNIQUE;

-- Quantity tracking
ALTER TABLE plants ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS minimum_stock INTEGER DEFAULT 5;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10, 2);

-- Location tracking
ALTER TABLE plants ADD COLUMN IF NOT EXISTS location VARCHAR(200);
ALTER TABLE plants ADD COLUMN IF NOT EXISTS section VARCHAR(100);

-- Status tracking
CREATE TYPE plant_status AS ENUM (
  'available',
  'low_stock',
  'out_of_stock',
  'reserved',
  'discontinued'
);

ALTER TABLE plants ADD COLUMN IF NOT EXISTS status plant_status DEFAULT 'available';

-- Supplier information
ALTER TABLE plants ADD COLUMN IF NOT EXISTS supplier VARCHAR(200);
ALTER TABLE plants ADD COLUMN IF NOT EXISTS supplier_contact VARCHAR(200);

-- Date tracking
ALTER TABLE plants ADD COLUMN IF NOT EXISTS date_acquired DATE DEFAULT CURRENT_DATE;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS last_restocked TIMESTAMPTZ;

-- Inventory notes
ALTER TABLE plants ADD COLUMN IF NOT EXISTS inventory_notes TEXT;

-- 2. Create inventory history table for audit trail
-- =====================================================

CREATE TABLE IF NOT EXISTS inventory_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  
  -- Change tracking
  change_type VARCHAR(50) NOT NULL, -- 'restock', 'sale', 'adjustment', 'loss', 'transfer'
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  quantity_change INTEGER NOT NULL,
  
  -- Transaction details
  reason TEXT,
  reference_number VARCHAR(100),
  
  -- User tracking
  changed_by VARCHAR(255), -- Email of user who made the change
  changed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Additional metadata
  metadata JSONB,
  
  CONSTRAINT valid_change_type CHECK (
    change_type IN ('restock', 'sale', 'adjustment', 'loss', 'transfer', 'initial')
  )
);

-- Index for inventory history queries
CREATE INDEX IF NOT EXISTS idx_inventory_history_plant_id ON inventory_history(plant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_history_changed_at ON inventory_history(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_history_change_type ON inventory_history(change_type);

-- 3. Create low stock alerts view
-- =====================================================

CREATE OR REPLACE VIEW low_stock_plants AS
SELECT 
  p.id,
  p.sku,
  p.common_name,
  p.scientific_name,
  p.quantity,
  p.minimum_stock,
  p.quantity - p.minimum_stock AS shortage,
  p.location,
  p.status,
  p.supplier,
  p.last_restocked,
  c.name AS category_name
FROM plants p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.quantity <= p.minimum_stock
  AND p.status != 'discontinued'
ORDER BY (p.quantity - p.minimum_stock) ASC;

COMMENT ON VIEW low_stock_plants IS 'Plants that are at or below minimum stock level';

-- 4. Create inventory summary view
-- =====================================================

CREATE OR REPLACE VIEW inventory_summary AS
SELECT 
  c.name AS category_name,
  COUNT(p.id) AS total_plants,
  SUM(p.quantity) AS total_quantity,
  SUM(CASE WHEN p.status = 'available' THEN p.quantity ELSE 0 END) AS available_quantity,
  SUM(CASE WHEN p.quantity <= p.minimum_stock THEN 1 ELSE 0 END) AS low_stock_count,
  SUM(CASE WHEN p.quantity = 0 THEN 1 ELSE 0 END) AS out_of_stock_count,
  SUM(p.quantity * COALESCE(p.unit_price, 0)) AS total_inventory_value
FROM categories c
LEFT JOIN plants p ON c.id = p.category_id
GROUP BY c.id, c.name
ORDER BY c.name;

COMMENT ON VIEW inventory_summary IS 'Summary of inventory by category';

-- 5. Function to auto-update status based on quantity
-- =====================================================

CREATE OR REPLACE FUNCTION update_plant_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-update status based on quantity
  IF NEW.quantity = 0 THEN
    NEW.status = 'out_of_stock';
  ELSIF NEW.quantity <= NEW.minimum_stock THEN
    NEW.status = 'low_stock';
  ELSIF NEW.status IN ('out_of_stock', 'low_stock') THEN
    -- Only auto-change back to available if it was auto-set
    -- Don't override manual 'reserved' or 'discontinued' status
    NEW.status = 'available';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update status
DROP TRIGGER IF EXISTS trigger_update_plant_status ON plants;
CREATE TRIGGER trigger_update_plant_status
  BEFORE INSERT OR UPDATE OF quantity, minimum_stock ON plants
  FOR EACH ROW
  EXECUTE FUNCTION update_plant_status();

-- 6. Function to log inventory changes
-- =====================================================

CREATE OR REPLACE FUNCTION log_inventory_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if quantity changed
  IF (TG_OP = 'UPDATE' AND OLD.quantity != NEW.quantity) THEN
    INSERT INTO inventory_history (
      plant_id,
      change_type,
      quantity_before,
      quantity_after,
      quantity_change,
      changed_by,
      reason
    ) VALUES (
      NEW.id,
      'adjustment', -- Default, can be updated via app
      OLD.quantity,
      NEW.quantity,
      NEW.quantity - OLD.quantity,
      current_user,
      'Quantity updated'
    );
  ELSIF (TG_OP = 'INSERT' AND NEW.quantity > 0) THEN
    INSERT INTO inventory_history (
      plant_id,
      change_type,
      quantity_before,
      quantity_after,
      quantity_change,
      changed_by,
      reason
    ) VALUES (
      NEW.id,
      'initial',
      0,
      NEW.quantity,
      NEW.quantity,
      current_user,
      'Initial inventory'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log inventory changes
DROP TRIGGER IF EXISTS trigger_log_inventory_change ON plants;
CREATE TRIGGER trigger_log_inventory_change
  AFTER INSERT OR UPDATE OF quantity ON plants
  FOR EACH ROW
  EXECUTE FUNCTION log_inventory_change();

-- 7. Add constraints for data integrity
-- =====================================================

-- Quantity must be non-negative
ALTER TABLE plants DROP CONSTRAINT IF EXISTS chk_quantity_non_negative;
ALTER TABLE plants ADD CONSTRAINT chk_quantity_non_negative 
  CHECK (quantity >= 0);

-- Minimum stock must be non-negative
ALTER TABLE plants DROP CONSTRAINT IF EXISTS chk_minimum_stock_non_negative;
ALTER TABLE plants ADD CONSTRAINT chk_minimum_stock_non_negative 
  CHECK (minimum_stock >= 0);

-- Unit price must be non-negative
ALTER TABLE plants DROP CONSTRAINT IF EXISTS chk_unit_price_non_negative;
ALTER TABLE plants ADD CONSTRAINT chk_unit_price_non_negative 
  CHECK (unit_price IS NULL OR unit_price >= 0);

-- SKU format validation (alphanumeric, hyphens, underscores only)
ALTER TABLE plants DROP CONSTRAINT IF EXISTS chk_sku_format;
ALTER TABLE plants ADD CONSTRAINT chk_sku_format 
  CHECK (sku IS NULL OR sku ~ '^[A-Za-z0-9_-]+$');

-- Inventory notes length
ALTER TABLE plants DROP CONSTRAINT IF EXISTS chk_inventory_notes_length;
ALTER TABLE plants ADD CONSTRAINT chk_inventory_notes_length 
  CHECK (char_length(inventory_notes) <= 1000);

-- 8. Add indexes for inventory queries
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_plants_sku ON plants(sku);
CREATE INDEX IF NOT EXISTS idx_plants_quantity ON plants(quantity);
CREATE INDEX IF NOT EXISTS idx_plants_status ON plants(status);
CREATE INDEX IF NOT EXISTS idx_plants_location ON plants(location);
CREATE INDEX IF NOT EXISTS idx_plants_date_acquired ON plants(date_acquired DESC);
CREATE INDEX IF NOT EXISTS idx_plants_low_stock ON plants(quantity, minimum_stock) 
  WHERE quantity <= minimum_stock;

-- 9. Add helpful comments
-- =====================================================

COMMENT ON COLUMN plants.sku IS 'Stock Keeping Unit - unique product code';
COMMENT ON COLUMN plants.quantity IS 'Current stock quantity';
COMMENT ON COLUMN plants.minimum_stock IS 'Minimum stock level before low stock alert';
COMMENT ON COLUMN plants.unit_price IS 'Price per unit in local currency';
COMMENT ON COLUMN plants.location IS 'Physical location (e.g., "Greenhouse A", "Section B2")';
COMMENT ON COLUMN plants.section IS 'Sub-location or section within location';
COMMENT ON COLUMN plants.status IS 'Inventory status: available, low_stock, out_of_stock, reserved, discontinued';
COMMENT ON COLUMN plants.supplier IS 'Name of supplier/source';
COMMENT ON COLUMN plants.date_acquired IS 'Date when plant was acquired/added to inventory';
COMMENT ON COLUMN plants.last_restocked IS 'Timestamp of last restocking';
COMMENT ON COLUMN plants.inventory_notes IS 'Additional notes about inventory (max 1000 chars)';

COMMENT ON TABLE inventory_history IS 'Audit trail of all inventory quantity changes';

-- 10. Create function to get inventory statistics
-- =====================================================

CREATE OR REPLACE FUNCTION get_inventory_stats()
RETURNS TABLE (
  total_plants BIGINT,
  total_quantity BIGINT,
  total_value NUMERIC,
  low_stock_count BIGINT,
  out_of_stock_count BIGINT,
  available_count BIGINT,
  unique_locations BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT id) AS total_plants,
    COALESCE(SUM(quantity), 0) AS total_quantity,
    COALESCE(SUM(quantity * unit_price), 0) AS total_value,
    COUNT(*) FILTER (WHERE quantity <= minimum_stock AND quantity > 0) AS low_stock_count,
    COUNT(*) FILTER (WHERE quantity = 0) AS out_of_stock_count,
    COUNT(*) FILTER (WHERE status = 'available') AS available_count,
    COUNT(DISTINCT location) FILTER (WHERE location IS NOT NULL) AS unique_locations
  FROM plants;
END;
$$ LANGUAGE plpgsql;

-- 11. Sample data for testing (optional - comment out if not needed)
-- =====================================================

-- Update existing plants with inventory data
UPDATE plants SET 
  quantity = 10,
  minimum_stock = 3,
  location = 'Main Greenhouse',
  status = 'available',
  date_acquired = CURRENT_DATE
WHERE quantity IS NULL;

-- 12. Verify new columns
-- =====================================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'plants'
  AND column_name IN ('sku', 'quantity', 'minimum_stock', 'unit_price', 'location', 'status')
ORDER BY ordinal_position;

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '✅ Inventory Management System installed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📦 New Features:';
  RAISE NOTICE '  • Quantity tracking with auto-status updates';
  RAISE NOTICE '  • SKU/product codes';
  RAISE NOTICE '  • Location management';
  RAISE NOTICE '  • Pricing support';
  RAISE NOTICE '  • Low stock alerts (view: low_stock_plants)';
  RAISE NOTICE '  • Inventory history/audit trail';
  RAISE NOTICE '  • Automated status management';
  RAISE NOTICE '  • Inventory statistics function';
  RAISE NOTICE '';
  RAISE NOTICE '📊 New Tables:';
  RAISE NOTICE '  • inventory_history - Audit trail of quantity changes';
  RAISE NOTICE '';
  RAISE NOTICE '👁️ New Views:';
  RAISE NOTICE '  • low_stock_plants - Plants at or below minimum stock';
  RAISE NOTICE '  • inventory_summary - Summary by category';
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Query Examples:';
  RAISE NOTICE '  • SELECT * FROM low_stock_plants;';
  RAISE NOTICE '  • SELECT * FROM inventory_summary;';
  RAISE NOTICE '  • SELECT * FROM get_inventory_stats();';
END $$;
