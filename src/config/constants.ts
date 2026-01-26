/**
 * Application-wide constants and configuration
 * Centralized here for easy modification and consistency
 */

// Product types available in the system
export const PRODUCT_TYPES = ["ELABORADO", "REVENTA", "OTHER"] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

// Display labels for product types (Spanish)
export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  ELABORADO: "Producto Elaborado",
  REVENTA: "Reventa",
  OTHER: "Otros",
};

// Emoji icons for product types
export const PRODUCT_TYPE_ICONS: Record<ProductType, string> = {
  ELABORADO: "👨‍🍳",
  REVENTA: "📦",
  OTHER: "🛒",
};

// Default categories per product type
export const DEFAULT_CATEGORIES: Record<ProductType, string[]> = {
  ELABORADO: ["Pizzas", "Empanadas", "Pastas", "Otros"],
  REVENTA: ["Bebidas", "Snacks", "Otros"],
  OTHER: ["Otros"],
};

// Units of measurement available
export const UNITS = ["kg", "g", "l", "ml", "unit"] as const;
export type UnitType = (typeof UNITS)[number];

// Display labels for units (Spanish)
export const UNIT_LABELS: Record<UnitType, string> = {
  kg: "kilogramos",
  g: "gramos",
  l: "litros",
  ml: "mililitros",
  unit: "unidad",
};

// Currency configuration
export const CURRENCY = {
  symbol: "$",
  code: "ARS",
  decimals: 2,
} as const;

// Pagination defaults
export const PAGINATION = {
  salesPerPage: 50,
  recentSalesLimit: 5,
  salesHistoryPerPage: 20,
} as const;
