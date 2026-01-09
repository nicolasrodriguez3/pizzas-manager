import { getIngredients, deleteIngredient } from "../../actions";
import { IngredientForm } from "../../components/IngredientForm";
import { Card, PageHeader } from "../../components/ui";

export default async function IngredientsPage() {
  const ingredients = await getIngredients();

  return (
    <div className="min-h-screen p-8 space-y-8">
      <PageHeader
        title="Ingredientes"
        gradient="orange"
        backLink={{ href: "/dashboard", label: "Volver al Dashboard" }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <IngredientForm />
        </div>

        <div className="lg:col-span-2">
          <Card variant="glass">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Stock & Costos
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-700">
                    <th className="p-3 font-medium">Nombre</th>
                    <th className="p-3 font-medium">Unidad</th>
                    <th className="p-3 font-medium">Costo/Unidad</th>
                    <th className="p-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ing) => (
                    <tr
                      key={ing.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                    >
                      <td className="p-3 font-medium text-gray-900">
                        {ing.name}
                      </td>
                      <td className="p-3 text-gray-900">{ing.unit}</td>
                      <td className="p-3 text-green-400 font-mono">
                        ${ing.cost.toFixed(2)}
                      </td>
                      <td className="p-3 text-right">
                        <form action={deleteIngredient.bind(null, ing.id)}>
                          <button className="text-sm px-3 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition opacity-80 group-hover:opacity-100 focus:opacity-100">
                            Borrar
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                  {ingredients.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-8 text-center text-gray-500 italic"
                      >
                        No se encontraron ingredientes. Agrega uno para
                        comenzar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
