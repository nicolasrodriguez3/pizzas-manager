import { ProductForm } from "@/app/components/ProductForm";
import { getProductBySlug } from "@/app/actions";
import { getIngredients, getProducts } from "@/app/actions";
import { notFound } from "next/navigation";
import { PageHeader } from "@/app/components/ui";

export default async function ProductEditPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const [product, ingredients, products] = await Promise.all([
    getProductBySlug(slug),
    getIngredients(),
    getProducts(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen p-8 bg-linear-to-br from-gray-50 to-white text-gray-900">
      <PageHeader
        title={`Editar: ${product.name}`}
        gradient="purple"
        backLink={{
          href: `/products/${product.slug}`,
          label: "Volver al Producto",
        }}
      />
      <div className="max-w-4xl mx-auto mt-8">
        <ProductForm
          initialData={product}
          ingredients={ingredients}
          products={products}
        />
      </div>
    </div>
  );
}
