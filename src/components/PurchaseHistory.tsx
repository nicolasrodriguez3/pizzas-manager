"use client";

import { Calendar, DollarSign, Package, Trash2 } from "lucide-react";

import { deletePurchase } from "@/actions/purchases";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Purchase } from "@/types";
import { FormattedDate } from "./FormattedDate";

export function PurchaseHistory({ purchases }: { purchases: Purchase[] }) {
  const handleDelete = async (id: string) => {
    if (confirm("¿Está seguro de eliminar esta compra completa?")) {
      await deletePurchase(id);
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
              <Card key={purchase.id} className="border border-gray-200">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <FormattedDate
                          date={purchase.purchaseDate}
                          type="date"
                        />
                      </div>
                      {purchase.supplierName && (
                        <div className="text-sm text-gray-600">
                          Proveedor: {purchase.supplierName}
                        </div>
                      )}
                      {purchase.invoiceNumber && (
                        <div className="text-sm text-gray-600">
                          Factura: {purchase.invoiceNumber}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(purchase.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {purchase.notes && (
                    <div className="text-sm text-gray-500 mt-2">
                      Notas: {purchase.notes}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {purchase.ingredientPurchases?.map((ip) => (
                      <div
                        key={ip.id}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="font-medium">
                            {ip.ingredient?.name}
                          </div>
                          <Badge variant="outline">
                            {ip.quantity} {ip.unit}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div>
                            ${ip.unitCost.toFixed(2)}/{ip.unit}
                          </div>
                          <div className="font-medium">
                            ${(ip.quantity * ip.unitCost).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-end pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-lg font-bold">
                        <DollarSign className="w-5 h-5" />
                        Total: $
                        {purchase.ingredientPurchases
                          ?.reduce(
                            (sum, ip) => sum + ip.quantity * ip.unitCost,
                            0,
                          )
                          .toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
