import { PageHeader } from "@/app/components/ui";
import { getProducts } from "../../actions";
import { POSInterface } from "../../components/POSInterface";
import Link from "next/link";

export default async function SalesPage() {
  const products = await getProducts();

  return (
    <div className="h-screen flex flex-col p-4 sm:p-6 overflow-hidden bg-linear-to-br from-gray-50 to-white text-black">
      <div className="flex justify-between items-center mb-2">
        <PageHeader
          title="Ventas"
          gradient="green"
          backLink={{ href: "dashboard/", label: "Volver al Dashboard" }}
        />
        <Link
          href="/sales/history"
          className="text-sm text-green-600 hover:text-green-700 hover:underline"
        >
          Ver historial →
        </Link>
      </div>
      <div className="flex-1 min-h-0">
        <POSInterface products={products} />
      </div>
    </div>
  );
}
