/**
 * Central export file for all server actions
 * This allows importing from '@/app/actions' while keeping code modular
 */

// Ingredient actions
export {
    getIngredients,
    createIngredient,
    deleteIngredient,
    updateIngredient
} from './ingredients'

// Product actions
export {
    getProducts,
    createProduct,
    deleteProduct
} from './products'

// Sales actions
export {
    recordSale,
    getSales
} from './sales'

// Dashboard actions
export {
    getDashboardStats
} from './dashboard'
