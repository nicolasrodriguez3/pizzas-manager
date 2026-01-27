"use client";

import { DollarSign, Package, Plus, Trash2, X } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { createIngredient } from "@/actions/ingredients";
import { createPurchase, updatePurchase } from "@/actions/purchases";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UNITS } from "@/config/constants";
import type {
  IngredientPurchaseInput,
  IngredientWithStock,
  Purchase,
} from "@/types";

interface PurchaseFormProps {
  purchase?: Purchase & {
    ingredientPurchases?: (IngredientPurchaseInput & {
      ingredient?: IngredientWithStock;
    })[];
  };
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
  const [ingredientItems, setIngredientItems] = useState<
    IngredientPurchaseInput[]
  >(
    purchase?.ingredientPurchases?.map((ip) => ({
      ingredientId: ip.ingredientId,
      quantity: ip.quantity,
      unit: ip.unit,
      unitCost: ip.unitCost,
    })) || [{ ingredientId: "", quantity: 0, unit: "", unitCost: 0 }],
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientUnit, setNewIngredientUnit] = useState("");

  const [state, formAction, isPending] = useActionState(
    isEditing ? updatePurchase : createPurchase,
    { message: "" },
  );

  const [createState, createFormAction, isCreatePending] = useActionState(
    createIngredient,
    { message: "" },
  );

  // Handle success
  useEffect(() => {
    if (state?.success && onSuccess) {
      onSuccess();
    }
  }, [state, onSuccess]);

  // Handle create ingredient success
  useEffect(() => {
    if (createState?.success) {
      setCreateDialogOpen(false);
      setNewIngredientName("");
      setNewIngredientUnit("");
      // Refresh ingredients list or add to local state
    }
  }, [createState]);

  const addIngredient = () => {
    setIngredientItems([
      ...ingredientItems,
      { ingredientId: "", quantity: 0, unit: "", unitCost: 0 },
    ]);
  };

  const removeIngredient = (index: number) => {
    if (ingredientItems.length > 1) {
      setIngredientItems(ingredientItems.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (
    index: number,
    field: keyof IngredientPurchaseInput,
    value: string | number,
  ) => {
    const updated = [...ingredientItems];
    updated[index] = { ...updated[index], [field]: value };
    setIngredientItems(updated);
  };

  const handleSubmit = (formData: FormData) => {
    formData.set("ingredients", JSON.stringify(ingredientItems));
    if (isEditing && purchase) {
      formData.set("purchaseId", purchase.id);
    }
    formAction(formData);
  };

  const handleCreateIngredient = (formData: FormData) => {
    formData.set("name", newIngredientName);
    formData.set("unit", newIngredientUnit);
    createFormAction(formData);
  };

  const totalCost = ingredientItems.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0,
  );

  return (
    <Card className="border-gray-500/10 shadow-sm w-full max-w-4xl mx-auto">
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
        <form action={handleSubmit} className="space-y-6">
          {isEditing && (
            <input type="hidden" name="purchaseId" value={purchase.id} />
          )}

          {/* Common fields */}
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

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-lg font-medium">Ingredientes</Label>
              <Button
                type="button"
                onClick={addIngredient}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar Ingrediente
              </Button>
            </div>

            {ingredientItems.map((item, index) => (
              <Card key={index} className="mb-4 p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div className="md:col-span-2">
                    <Label>Ingrediente</Label>
                    <Select
                      value={item.ingredientId}
                      onValueChange={(value) =>
                        updateIngredient(index, "ingredientId", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar ingrediente" />
                      </SelectTrigger>
                      <SelectContent>
                        {ingredients.map((ing) => (
                          <SelectItem key={ing.id} value={ing.id}>
                            {ing.name} ({ing.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Cantidad</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={item.quantity || ""}
                      onChange={(e) =>
                        updateIngredient(
                          index,
                          "quantity",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Unidad</Label>
                    <Input
                      value={item.unit}
                      onChange={(e) =>
                        updateIngredient(index, "unit", e.target.value)
                      }
                      placeholder="kg"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label>Costo/U</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={item.unitCost || ""}
                        onChange={(e) =>
                          updateIngredient(
                            index,
                            "unitCost",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        placeholder="0.00"
                      />
                    </div>
                    {ingredientItems.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeIngredient(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Total Cost */}
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
              disabled={isPending}
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

        {/* Create Ingredient Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Ingrediente</DialogTitle>
            </DialogHeader>
            <form action={handleCreateIngredient} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={newIngredientName}
                  onChange={(e) => setNewIngredientName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="unit">Unidad</Label>
                <Select
                  value={newIngredientUnit}
                  onValueChange={setNewIngredientUnit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((unit: string) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {createState?.message && (
                <div
                  className={`p-3 rounded text-sm ${createState.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {createState.message}
                </div>
              )}
              <div className="flex gap-2">
                <Button type="submit" disabled={isCreatePending}>
                  {isCreatePending ? "Creando..." : "Crear Ingrediente"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
