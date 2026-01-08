import Link from 'next/link'
import { Button } from './components/ui'

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans text-white bg-black selection:bg-orange-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-orange-400 to-red-600">
          Pizza Manager
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-sm">Inicia Sesión</Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" className="text-sm shadow-orange-900/20">Registrate Gratis</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-8 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span>Optimiza tu pizzería hoy</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl bg-clip-text text-transparent bg-linear-to-b from-white via-white to-gray-500">
          Controla tus costos, <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 via-red-500 to-purple-600">maximiza tus ganancias.</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
          La herramienta definitiva para dueños de pizzerías. Gestiona recetas, ingredientes y ventas en tiempo real sin complicaciones.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/register" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto text-lg px-8 py-4 shadow-orange-500/25 shadow-lg">
              Empezar Ahora
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto text-lg px-8 py-4 bg-white/5 border-white/10 hover:bg-white/10">
              Ver Demo
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full text-left">
          <FeatureCard
            title="Costo de Recetas"
            description="Calcula automáticamente el costo exacto de cada pizza basado en sus ingredientes."
            icon="🍕"
          />
          <FeatureCard
            title="Control de Stock"
            description="Monitorea el uso de ingredientes en tiempo real con cada venta registrada."
            icon="📉"
          />
          <FeatureCard
            title="Reportes Claros"
            description="Visualiza tus márgenes de ganancia y ventas totales en un dashboard intuitivo."
            icon="📊"
          />
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/10 py-12 text-center text-gray-500 text-sm">
        &copy; 2026 Pizza Manager. Todos los derechos reservados.
      </footer>
    </div>
  )
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: string }) {
  return (
    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-colors group">
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}
