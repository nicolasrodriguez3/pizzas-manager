/**
 * Shared TypeScript types for the Pizza Manager application
 */

// --- Action Response Types ---

export type ActionState = {
  success?: boolean;
  message?: string;
};

// --- Entity Types ---

export type User = {
  id: string;
  email: string;
  name?: string | null;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Ingredient = {
  id: string;
  name: string;
  unit: string;
  cost: number;
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
