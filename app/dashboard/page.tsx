import { getDashboardStats } from '@/app/actions/dashboard'
import { Card, StatCard, UserHeader } from '@/app/components/ui'
import Link from 'next/link'

export default async function Home() {
  const stats = await getDashboardStats()
  const marginPercent = stats.totalRevenue > 0 ? (stats.totalProfit / stats.totalRevenue) * 100 : 0

  return (
    <div className="min-h-screen p-8 sm:p-12 font-sans bg-linear-to-br from-gray-900 to-black text-white">
      <main className="max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-linear-to-br from-orange-400 via-red-500 to-purple-600 mb-4 pb-2">
              Pizza Manager
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl">
              Gestiona tus ingredientes, recetas y ventas de pizzas en tiempo real.
            </p>
          </div>
          <UserHeader />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total de Ventas"
            value={`$${stats.totalRevenue.toFixed(0)}`}
            color="green"
          />
          <StatCard
            title="Total de Costos"
            value={`$${stats.totalCost.toFixed(0)}`}
            color="red"
          />
          <StatCard
            title="Beneficio Neto"
            value={`$${stats.totalProfit.toFixed(0)}`}
            color={stats.totalProfit >= 0 ? 'green' : 'red'}
          />
          <StatCard
            title="Margen"
            value={`${marginPercent.toFixed(1)}%`}
            color="purple"
          />
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            href="/ingredients"
            className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 flex flex-col items-center text-center"
          >
            <div className="h-14 w-14 rounded-full bg-orange-500/20 flex items-center justify-center mb-4 group-hover:bg-orange-500/30 text-2xl">
              🥕
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Ingredientes
            </h2>
            <p className="text-sm text-gray-400">
              Gestiona los ingredientes y sus costos.
            </p>
          </Link>

          <Link
            href="/products"
            className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 flex flex-col items-center text-center"
          >
            <div className="h-14 w-14 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 text-2xl">
              🍕
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Recetas y Productos
            </h2>
            <p className="text-sm text-gray-400">
              Crea recetas y calcula los margenes.
            </p>
          </Link>

          <Link
            href="/sales"
            className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 flex flex-col items-center text-center"
          >
            <div className="h-14 w-14 rounded-full bg-green-500/20 flex items-center justify-center mb-4 text-2xl">
              💰
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Ventas & POS
            </h2>
            <p className="text-sm text-gray-400">
              Interfaz de transacciones.
            </p>
          </Link>
        </div>

        {/* Recent Activity */}
        <Card padding="lg" className="rounded-3xl">
          <h2 className="text-2xl font-bold mb-6">Ventas Recientes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 text-sm uppercase tracking-wider">
                  <th className="pb-4 font-medium">Fecha y Hora</th>
                  <th className="pb-4 font-medium">Items</th>
                  <th className="pb-4 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.recentSales.map(sale => (
                  <tr key={sale.id} className="text-gray-300">
                    <td className="py-4">
                      {new Date(sale.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-4">
                      {sale.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
                    </td>
                    <td className="py-4 text-right font-mono text-green-400">
                      ${sale.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {stats.recentSales.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-500 italic">
                      No hay ventas registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </main>
    </div>
  );
}
