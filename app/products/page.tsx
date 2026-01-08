import { getIngredients, getProducts, deleteProduct } from '../actions'
import { ProductForm } from '../components/ProductForm'
import { Card, PageHeader } from '../components/ui'

export default async function ProductsPage() {
  const [ingredients, products] = await Promise.all([
    getIngredients(),
    getProducts()
  ])

  return (
    <div className="min-h-screen p-8 space-y-8">
      <PageHeader
        title="Productos & Recetas"
        gradient="purple"
        backLink={{ href: 'dashboard/', label: 'Volver al Dashboard' }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <ProductForm ingredients={ingredients} />
        </div>

        <div className="lg:col-span-2">
          <Card variant="default">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Catalogo de Productos</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-700">
                    <th className="p-3 font-medium">Nombre</th>
                    <th className="p-3 font-medium">Tipo</th>
                    <th className="p-3 font-medium text-right">Precio</th>
                    <th className="p-3 font-medium text-right">Costo</th>
                    <th className="p-3 font-medium text-right">Beneficio</th>
                    <th className="p-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const margin = product.basePrice - product.cost
                    const marginPercent = product.basePrice > 0 ? (margin / product.basePrice) * 100 : 0

                    return (
                      <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                        <td className="p-3 font-medium text-gray-900">
                          {product.name}
                          {product.receipeItems.length > 0 && (
                            <span className="ml-2 text-xs text-gray-500 bg-gray-800 px-1 py-0.5 rounded whitespace-nowrap">
                              {product.receipeItems.length} ingr.
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-gray-600 text-sm">{product.type}</td>
                        <td className="p-3 text-right text-gray-600">${product.basePrice.toFixed(2)}</td>
                        <td className="p-3 text-right text-red-400 font-mono">${product.cost.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono">
                          <div className={margin > 0 ? "text-green-400" : "text-red-500"}>
                            ${margin.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">{marginPercent.toFixed(0)}%</div>
                        </td>
                        <td className="p-3 text-right">
                          <form action={deleteProduct.bind(null, product.id)}>
                            <button className="text-sm px-3 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition opacity-80 group-hover:opacity-100 focus:opacity-100">
                              Borrar
                            </button>
                          </form>
                        </td>
                      </tr>
                    )
                  })}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500 italic">
                        No se encontraron productos. ¡Crea tu primera Pizza!
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
  )
}

