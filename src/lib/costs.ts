import { convertCost } from "@/actions/utils/unitConversion";
import { prisma } from "@/lib/prisma";

/**
 * Calculates the cost of a product recursively.
 * If the product is "ELABORADO", it sums the cost of its ingredients and sub-products.
 * If the product is "REVENTA" or "OTHER" (or has no recipe), it uses the manualCost.
 *
 * @param productId The ID of the product to calculate cost for.
 * @returns The calculated cost.
 */
export async function calculateProductCost(productId: string): Promise<number> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      receipeItems: {
        include: {
          ingredient: {
            include: {
              purchases: {
                orderBy: { purchase: { purchaseDate: "desc" } },
                take: 1,
              },
            },
          },
          subProduct: true, // We only need the ID to recurse, but including it doesn't hurt
        },
      },
    },
  });

  if (!product) return 0;

  // If it's not a composed product, return manual cost (or 0 if not set)
  if (product.type !== "ELABORADO") {
    return product.manualCost || 0;
  }

  // If it is composed but has no recipe, cost is 0 (or technically undefined, but 0 is safe)
  if (!product.receipeItems || product.receipeItems.length === 0) {
    return 0;
  }

  let totalCost = 0;

  for (const item of product.receipeItems) {
    if (item.ingredientId && item.ingredient) {
      // Direct ingredient - use last purchase cost or fallback to 0
      const lastPurchaseCost = item.ingredient.purchases?.[0]?.unitCost || 0;
      totalCost += convertCost(
        item.quantity,
        item.unit,
        item.ingredient.unit,
        lastPurchaseCost,
      );
    } else if (item.subProductId) {
      // Sub-product: Valid recursive call
      const subProductCost = await calculateProductCost(item.subProductId);
      // Currently, recipes define quantity of subproduct.
      // We assume the unit of the subproduct in the recipe matches "1 unit" of the subproduct itself
      // equivalent to item.quantity * cost_per_unit
      totalCost += item.quantity * subProductCost;
    }
  }

  return totalCost;
}
