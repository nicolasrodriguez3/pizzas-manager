/**
 * Central export file for all server actions
 * This allows importing from '@/app/actions' while keeping code modular
 */

// Ingredient actions
export {
  getIngredients,
  createIngredient,
  deleteIngredient,
  updateIngredient,
} from "./ingredients";

// Product actions
export {
  getProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  getProductBySlug,
} from "./products";

// Sales actions
export { recordSale, getRecentSales, getSalesHistory } from "./sales";

// Dashboard actions
export { getDashboardStats } from "./dashboard";

// Fixed Cost actions
export {
  getFixedCosts,
  createFixedCost,
  updateFixedCost,
  deleteFixedCost,
  getTotalMonthlyFixedCosts,
} from "./fixedCosts";
