import { PageHeader } from "@/app/components/ui";
import { getProducts } from "../../actions";
import { POSInterface } from "../../components/POSInterface";

export default async function SalesPage() {
  const products = await getProducts();

  return (
    <div className="h-screen flex flex-col p-4 sm:p-6 overflow-hidden bg-linear-to-br from-gray-50 to-white text-black">
      <PageHeader
        title="Ventas"
        gradient="green"
        backLink={{ href: "dashboard/", label: "Volver al Dashboard" }}
      />
      <div className="flex-1 min-h-0">
        <POSInterface products={products} />
      </div>
    </div>
  );
}
