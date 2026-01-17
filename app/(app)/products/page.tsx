import { ProductTableRow } from "@/app/components/ui/ProductTableRow";
import { getIngredients, getProducts, deleteProduct } from "../../actions";
import { ProductForm } from "../../components/ProductForm";
import { PageHeader } from "../../components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ProductsPage() {
  const [ingredients, products] = await Promise.all([
    getIngredients(),
    getProducts(),
  ]);

  return (
    <div className="min-h-screen p-8 space-y-8 bg-linear-to-br from-gray-50 to-white text-black">
      <PageHeader
        title="Productos & Recetas"
        gradient="purple"
        backLink={{ href: "dashboard/", label: "Volver al Dashboard" }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <ProductForm ingredients={ingredients} products={products} />
        </div>

        <div className="lg:col-span-2">
          <Card className="rounded-2xl shadow-xl border-gray-100">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Catalogo de Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-100 hover:bg-transparent">
                      <TableHead className="font-medium text-gray-700">
                        Nombre
                      </TableHead>
                      <TableHead className="font-medium text-gray-700">
                        Tipo
                      </TableHead>
                      <TableHead className="font-medium text-right text-gray-700">
                        Precio de venta
                      </TableHead>
                      <TableHead className="font-medium text-right text-gray-700">
                        Costo
                      </TableHead>
                      <TableHead className="font-medium text-right text-gray-700">
                        Beneficio
                      </TableHead>
                      <TableHead className="font-medium text-right text-gray-700">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <ProductTableRow key={product.id} product={product} />
                    ))}
                    {products.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-24 text-center text-gray-500 italic"
                        >
                          No se encontraron productos. ¡Crea tu primera Pizza!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
