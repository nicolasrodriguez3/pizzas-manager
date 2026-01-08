import { getProducts } from '../actions'
import { POSInterface } from '../components/POSInterface'
import Link from 'next/link'

export default async function SalesPage() {
    const products = await getProducts()

    return (
        <div className="h-screen flex flex-col p-4 sm:p-6 overflow-hidden bg-linear-to-br from-gray-900 to-black">
            <header className="flex justify-between items-center mb-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-green-400 to-emerald-600">
                        Ventas
                    </h1>
                    <p className="text-gray-400 text-sm">Nueva Transacción</p>
                </div>
                <Link href="/" className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition text-sm">
                    Salir al Dashboard
                </Link>
            </header>

            <div className="flex-1 min-h-0">
                <POSInterface products={products} />
            </div>
        </div>
    )
}
