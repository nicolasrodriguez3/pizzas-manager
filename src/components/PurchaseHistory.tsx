"use client";

import { deleteIngredientPurchase } from "@/actions/purchases";
import type { IngredientPurchase } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Package, Calendar, DollarSign } from "lucide-react";
import { FormattedDate } from "./FormattedDate";

export function PurchaseHistory({
  purchases,
}: {
  purchases: IngredientPurchase[];
}) {
  const handleDelete = async (id: string) => {
    if (confirm("¿Está seguro de eliminar esta compra?")) {
      await deleteIngredientPurchase(id);
    }
  };

  return (
    <Card className="border-gray-500/10 shadow-sm w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Historial de Compras
        </CardTitle>
      </CardHeader>
      <CardContent>
        {purchases.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay compras registradas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {purchase.ingredient?.name}
                      </h3>
                      <Badge variant="outline">
                        {purchase.quantity} {purchase.unit}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <FormattedDate
                          date={purchase.purchaseDate}
                          type="date"
                        />
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="w-4 h-4" />$
                        {purchase.unitCost.toFixed(2)}/{purchase.unit}
                      </div>

                      <div className="text-gray-600">
                        Total: $
                        {(purchase.quantity * purchase.unitCost).toFixed(2)}
                      </div>

                      {purchase.supplierName && (
                        <div className="text-gray-600">
                          Proveedor: {purchase.supplierName}
                        </div>
                      )}
                    </div>

                    {purchase.invoiceNumber && (
                      <div className="mt-2 text-sm text-gray-500">
                        Factura: {purchase.invoiceNumber}
                      </div>
                    )}

                    {purchase.notes && (
                      <div className="mt-2 text-sm text-gray-500">
                        Notas: {purchase.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => alert("Función de edición en desarrollo")}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(purchase.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
