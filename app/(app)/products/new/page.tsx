import { getIngredients, getProducts } from "@/app/actions";
import { ProductForm } from "@/app/components/ProductForm";
import { PageHeader } from "@/app/components/ui";

export default async function ProductsNewPage() {
  const [ingredients, products] = await Promise.all([
    getIngredients(),
    getProducts(),
  ]);

  return (
    <div className="min-h-screen p-8 space-y-8 bg-linear-to-br from-gray-50 to-white text-black">
      <PageHeader
        title="Nuevo Producto"
        gradient="purple"
        backLink={{ href: "/products", label: "Volver al Catalogo" }}
      />

      <div className="max-w-4xl mx-auto mt-8">
        <ProductForm ingredients={ingredients} products={products} />
      </div>
    </div>
  );
}
