"use client";

import { useState, useEffect } from "react";
import {
  createIngredientPurchase,
  updateIngredientPurchase,
} from "@/app/actions/purchases";
import { UNITS, UNIT_LABELS } from "@/app/config/constants";
import type { IngredientPurchase, IngredientWithStock } from "@/app/types";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Package, DollarSign } from "lucide-react";

interface PurchaseFormProps {
  purchase?: IngredientPurchase;
  ingredients: IngredientWithStock[];
  onClose?: () => void;
  onSuccess?: () => void;
}

export function PurchaseForm({
  purchase,
  ingredients,
  onClose,
  onSuccess,
}: PurchaseFormProps) {
  const isEditing = !!purchase;
  const [selectedIngredient, setSelectedIngredient] = useState<string>(
    purchase?.ingredientId || "",
  );
  const [totalCost, setTotalCost] = useState<number>(
    (purchase?.quantity || 0) * (purchase?.unitCost || 0),
  );

  const [state, formAction, isPending] = useActionState(
    isEditing ? updateIngredientPurchase : createIngredientPurchase,
    { message: "" },
  );

  // Calculate total when quantity or unitCost changes
  const handleCostChange = (quantity: number, unitCost: number) => {
    setTotalCost(quantity * unitCost);
  };

  // Handle success
  useEffect(() => {
    if (state?.success && onSuccess) {
      onSuccess();
    }
  }, [state, onSuccess]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-5 h-5" />
          {isEditing ? "Editar Compra" : "Registrar Compra"}
        </CardTitle>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {isEditing && <input type="hidden" name="id" value={purchase.id} />}

          <div>
            <Label className="mb-2 block" htmlFor="ingredientId">
              Ingrediente
            </Label>
            <Select
              name="ingredientId"
              value={selectedIngredient}
              onValueChange={setSelectedIngredient}
              disabled={isEditing}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar ingrediente" />
              </SelectTrigger>
              <SelectContent>
                {ingredients.map((ingredient) => (
                  <SelectItem key={ingredient.id} value={ingredient.id}>
                    {ingredient.name} ({ingredient.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block" htmlFor="quantity">
                Cantidad
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                step="0.01"
                min="0.01"
                required
                defaultValue={purchase?.quantity || ""}
                className="w-full"
                placeholder="0.00"
                onChange={(e) => {
                  const quantity = parseFloat(e.target.value) || 0;
                  const unitCostInput = document.querySelector(
                    'input[name="unitCost"]',
                  ) as HTMLInputElement;
                  const unitCost = parseFloat(unitCostInput?.value || "0");
                  handleCostChange(quantity, unitCost);
                }}
              />
            </div>

            <input
              hidden
              name="unit"
              defaultValue={
                ingredients.find((i) => i.id === selectedIngredient)?.unit
              }
            />

            <div>
              <Label className="mb-2 block" htmlFor="unitCost">
                Costo por Unidad ($)
              </Label>
              <Input
                id="unitCost"
                name="unitCost"
                type="number"
                step="0.01"
                min="0.01"
                required
                defaultValue={purchase?.unitCost || ""}
                className="w-full"
                placeholder="0.00"
                onChange={(e) => {
                  const unitCost = parseFloat(e.target.value) || 0;
                  const quantityInput = document.querySelector(
                    'input[name="quantity"]',
                  ) as HTMLInputElement;
                  const quantity = parseFloat(quantityInput?.value || "0");
                  handleCostChange(quantity, unitCost);
                }}
              />
            </div>
          </div>

          {/* Total Cost Display */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Costo Total
              </span>
              <span className="text-lg font-bold text-green-900">
                ${totalCost.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block" htmlFor="purchaseDate">
                Fecha de Compra
              </Label>
              <Input
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                defaultValue={
                  purchase?.purchaseDate
                    ? new Date(purchase.purchaseDate)
                        .toISOString()
                        .split("T")[0]
                    : new Date().toISOString().split("T")[0]
                }
                className="w-full"
              />
            </div>

            <div>
              <Label className="mb-2 block" htmlFor="invoiceNumber">
                Nº de Factura (Opcional)
              </Label>
              <Input
                id="invoiceNumber"
                name="invoiceNumber"
                type="text"
                defaultValue={purchase?.invoiceNumber || ""}
                className="w-full"
                placeholder="0001-A"
              />
            </div>
          </div>

          <div>
            <Label className="mb-2 block" htmlFor="supplierName">
              Proveedor (Opcional)
            </Label>
            <Input
              id="supplierName"
              name="supplierName"
              type="text"
              defaultValue={purchase?.supplierName || ""}
              className="w-full"
              placeholder="Nombre del proveedor"
            />
          </div>

          <div>
            <Label className="mb-2 block" htmlFor="notes">
              Notas (Opcional)
            </Label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={purchase?.notes || ""}
              className="w-full p-2 border border-gray-300 rounded-md resize-none"
              placeholder="Notas adicionales sobre la compra..."
            />
          </div>

          {state?.message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                state.success
                  ? "bg-green-500/20 text-green-700"
                  : "bg-red-500/20 text-red-700"
              }`}
            >
              {state.message}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isPending || !selectedIngredient}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isPending
                ? "Guardando..."
                : isEditing
                  ? "Actualizar Compra"
                  : "Registrar Compra"}
            </Button>
            {onClose && (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-6"
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
