/**
 * Shared TypeScript types for the Pizza Manager application
 */

// --- Action Response Types ---

export type ActionState = {
  success?: boolean;
  message?: string;
  data?: unknown;
};

// --- Entity Types ---

export type User = {
  id: string;
  email: string;
  name?: string | null;
  password?: string;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Ingredient = {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock?: number | null;
  isActive: boolean;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Nuevo: Compras de ingredientes
export type IngredientPurchase = {
  id: string;
  organizationId: string;
  ingredientId: string;
  ingredient?: Ingredient | null;
  quantity: number;
  unit: string;
  unitCost: number;
  purchaseDate: Date;
  invoiceNumber?: string | null;
  supplierName?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Nuevo: Movimientos de Stock
export type StockMovement = {
  id: string;
  organizationId: string;
  ingredientId: string;
  ingredient?: Ingredient | null;
  type: string; // "COMPRA", "AJUSTE", "RETIRO", "DEVOLUCION"
  quantity: number;
  unit: string;
  reason?: string | null;
  referenceId?: string | null;
  referenceType?: string | null;
  movementDate: Date;
  notes?: string | null;
  createdAt: Date;
};

// Tipos de movimiento de stock
export type StockMovementType = "COMPRA" | "AJUSTE" | "RETIRO" | "DEVOLUCION";

// Extend tipos existentes
export type IngredientWithStock = Ingredient & {
  lastCost?: number; // Costo basado en última compra
  lastPurchaseDate?: Date;
  isLowStock?: boolean | null; // true si currentStock <= minStock
  purchases?: IngredientPurchase[];
  stockMovements?: StockMovement[];
};

export type FixedCost = {
  id: string;
  organizationId: string;
  name: string;
  amount: number;
  category?: string | null;
  isActive: boolean;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type RecipeItem = {
  id: string;
  productId: string;
  ingredientId?: string | null;
  subProductId?: string | null;
  quantity: number;
  unit: string;
  ingredient?: Ingredient | null;
  subProduct?: Product | null;
};

// Base product without relations
export type ProductBase = {
  id: string;
  name: string;
  type: string;
  category?: string | null;
  basePrice: number;
  isActive: boolean;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Product with optional recipe items
export type Product = ProductBase & {
  receipeItems?: RecipeItem[];
};

export type ProductWithCost = Product & {
  cost: number;
  recipeItems?: RecipeItem[]; // Alias for consistency with display if needed
};

export type SaleItem = {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  product: ProductBase;
};

export type Sale = {
  id: string;
  totalAmount: number;
  dateTime: Date;
  items: SaleItem[];
};

// --- Dashboard Types ---

export type DashboardStats = {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalFixedCosts?: number;
  totalSalesCount: number;
  recentSales: Sale[];
};

// --- Form Input Types ---

export type RecipeItemInput = {
  ingredientId?: string | null;
  subProductId?: string | null;
  quantity: number;
  unit: string;
};

export type SaleItemInput = {
  productId: string;
  quantity: number;
};

// Nuevos: Form inputs para compras y stock
export type IngredientPurchaseInput = {
  ingredientId: string;
  quantity: number;
  unit: string;
  unitCost: number;
  invoiceNumber?: string | null;
  supplierName?: string | null;
  notes?: string | null;
  purchaseDate?: string;
};

export type StockMovementInput = {
  ingredientId: string;
  type: StockMovementType;
  quantity: number;
  unit: string;
  reason?: string | null;
  notes?: string | null;
};

// --- Sales History Types ---

export type SalesHistoryParams = {
  startDate?: string;
  endDate?: string;
  search?: string;
  cursor?: string;
  limit?: number;
};

export type SalesHistoryResult = {
  sales: Sale[];
  hasMore: boolean;
  totalCount: number;
  periodStats: {
    revenue: number;
    cost: number;
    profit: number;
    fixedCosts?: number;
    grossProfit?: number;
    operatingProfit?: number;
  };
};
