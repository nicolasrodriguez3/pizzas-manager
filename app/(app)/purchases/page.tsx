import { PurchaseForm } from "@/app/components/PurchaseForm";
import { PurchaseHistory } from "@/app/components/PurchaseHistory";
import { PageHeader } from "@/app/components/ui";
import { getIngredients } from "@/app/actions/ingredients";
import type { IngredientPurchase, IngredientWithStock } from "@/app/types";
import { getIngredientPurchases } from "@/app/actions/purchases";

export default async function PurchasesPage() {
  const ingredients = (await getIngredients()) as IngredientWithStock[];
  const purchases = (await getIngredientPurchases()) as IngredientPurchase[];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Compras de Ingredientes"
        subtitle="Registra y gestiona las compras de ingredientes para tu negocio"
      />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario de compra - 2/3 del ancho */}
          <div className="lg:col-span-2">
            <PurchaseForm ingredients={ingredients} />
          </div>

          {/* Resumen lateral - 1/3 del ancho */}
          <div className="space-y-6">
            {/* Estadísticas rápidas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resumen de Stock
              </h3>
              <div className="space-y-3">
                {ingredients.slice(0, 5).map((ingredient) => (
                  <div
                    key={ingredient.id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {ingredient.name}
                      </p>
                      <p className="text-sm text-gray-500">{ingredient.unit}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-mono text-sm ${
                          ingredient.isLowStock
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {ingredient.currentStock.toFixed(2)}
                      </p>
                      {ingredient.isLowStock && (
                        <p className="text-xs text-red-500">Bajo</p>
                      )}
                    </div>
                  </div>
                ))}
                {ingredients.length > 5 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    y {ingredients.length - 5} ingredientes más...
                  </p>
                )}
              </div>
            </div>

            {/* Últimos costos */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Últimos Costos
              </h3>
              <div className="space-y-3">
                {ingredients
                  .filter((ing) => ing.lastCost && ing.lastCost > 0)
                  .slice(0, 5)
                  .map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="flex justify-between items-center"
                    >
                      <span className="text-gray-900">{ingredient.name}</span>
                      <span className="font-mono text-green-600">
                        ${(ingredient.lastCost || 0).toFixed(2)}/
                        {ingredient.unit}
                      </span>
                    </div>
                  ))}
                {ingredients.filter((ing) => ing.lastCost && ing.lastCost > 0)
                  .length === 0 && (
                  <p className="text-sm text-gray-500 text-center">
                    No hay compras registradas
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Historial completo de compras */}
        <div className="mt-8">
          <PurchaseHistory purchases={purchases} />
        </div>
      </div>
    </div>
  );
}
