"use client";

import { createProduct, updateProduct } from "@/actions/products";
import {
  PRODUCT_TYPES,
  PRODUCT_TYPE_LABELS,
  DEFAULT_CATEGORIES,
  UNITS,
  type ProductType,
  PRODUCT_TYPE_ICONS,
} from "@/config/constants";
import type {
  IngredientWithStock,
  ActionState,
  RecipeItemInput,
  ProductBase,
} from "@/types";
import { useState, useActionState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { CreateIngredientDialog } from "./CreateIngredientDialog";

type ProductFormProps = {
  ingredients: IngredientWithStock[];
  products: (ProductBase & { cost: number })[];
  initialData?: any; // Using any to avoid complex type matching with Prisma result, but ideally should be ProductWithRelations
};

// Simple client-side unit conversion for preview
function estimateCost(
  qty: number,
  rUnit: string,
  iUnit: string,
  iCost: number,
): number {
  if (Number.isNaN(qty)) return 0;

  let cost = 0;
  const ru = rUnit.toLowerCase();
  const iu = iUnit.toLowerCase();

  if (ru === iu) {
    cost = qty * iCost;
  } else if (
    (iu === "kg" && (ru === "g" || ru === "grams")) ||
    (iu === "l" && (ru === "ml" || ru === "milliliters"))
  ) {
    cost = qty * (iCost / 1000);
  } else {
    // default 1:1 if unknown
    cost = qty * iCost;
  }
  return cost;
}

const initialState: ActionState = {
  message: "",
};

export function ProductForm({
  ingredients,
  products,
  initialData,
}: ProductFormProps) {
  const isEditing = !!initialData;

  // Bind ID if editing
  const action = isEditing
    ? updateProduct.bind(null, initialData.id)
    : createProduct;

  const [state, formAction, isPending] = useActionState(action, initialState);

  const [productType, setProductType] = useState<ProductType>(
    initialData?.type || "ELABORADO",
  );

  const [category, setCategory] = useState(
    initialData?.category || DEFAULT_CATEGORIES.ELABORADO[0],
  );

  // Initialize recipe items
  const initialRecipeItems: RecipeItemInput[] =
    initialData?.receipeItems?.map((item: any) => ({
      ingredientId: item.ingredientId,
      subProductId: item.subProductId,
      quantity: item.quantity,
      unit: item.unit,
    })) || [];

  const [recipeItems, setRecipeItems] =
    useState<RecipeItemInput[]>(initialRecipeItems);
  const [clientError, setClientError] = useState<React.ReactNode>("");

  // Local state for ingredients so we can add new ones without page refresh
  const [availableIngredients, setAvailableIngredients] =
    useState<IngredientWithStock[]>(ingredients);

  // Update category when product type changes
  const handleTypeChange = (newType: ProductType) => {
    setProductType(newType);
    setCategory(DEFAULT_CATEGORIES[newType][0]);
    // Clear recipe items when switching away from ELABORADO
    if (newType !== "ELABORADO") {
      setRecipeItems([]);
    }
  };

  const handleSubmit = (formData: FormData) => {
    formAction(formData);
    // Only reset if creating success, not updating
    if (state.success && !isEditing) {
      setRecipeItems([]);
      setClientError("");
    }
  };

  const addIngredient = () => {
    // Better UX: add the first available ingredient or product
    const usedIds = new Set(
      recipeItems.map((item) => item.ingredientId || item.subProductId),
    );

    const unusedIngredients = ingredients.filter((ing) => !usedIds.has(ing.id));

    console.log({ unusedIngredients });

    // By default, add an ingredient if available, else a product
    if (availableIngredients.length > 0 && unusedIngredients.length > 0) {
      setRecipeItems([
        ...recipeItems,
        {
          ingredientId: unusedIngredients[0].id,
          subProductId: null,
          quantity: 1,
          unit: unusedIngredients[0].unit,
        },
      ]);
    } else if (products.length > 0) {
      setRecipeItems([
        ...recipeItems,
        {
          ingredientId: null,
          subProductId: products[0].id,
          quantity: 1,
          unit: "unit",
        },
      ]);
    } else {
      setClientError(
        <span>
          No hay más ingredientes disponibles. Crea uno con el botón "+ Nuevo
          Ingrediente".
        </span>,
      );
    }
  };

  const removeIngredient = (index: number) => {
    const newItems = [...recipeItems];
    newItems.splice(index, 1);
    setRecipeItems(newItems);
  };

  const updateItem = (
    index: number,
    field: "ingredientId" | "quantity" | "unit",
    value: string | number,
  ) => {
    if (value === "") return;

    const newItems = [...recipeItems];

    if (field === "ingredientId") {
      const isIng = value.toString().startsWith("ing_");
      const id = value.toString().replace("ing_", "").replace("prod_", "");

      if (isIng) {
        const ing = availableIngredients.find((i) => i.id === id);
        if (ing) {
          newItems[index] = {
            ...newItems[index],
            ingredientId: id,
            subProductId: null,
            unit: ing.unit,
          };
        }
      } else {
        const prod = products.find((p) => p.id === id);
        if (prod) {
          newItems[index] = {
            ...newItems[index],
            ingredientId: null,
            subProductId: id,
            unit: "unit",
          };
        }
      }
    } else {
      // Quantity validation
      if (field === "quantity" && (value as number) < 0) {
        return; // Prevent negative
      }
      newItems[index] = { ...newItems[index], [field]: value };
    }

    setRecipeItems(newItems);
  };

  // Calculate generic cost preview
  const currentCost = recipeItems.reduce((acc, item) => {
    if (item.ingredientId) {
      const ing = availableIngredients.find((i) => i.id === item.ingredientId);
      return (
        acc +
        (ing && ing.lastCost
          ? estimateCost(item.quantity, item.unit, ing.unit, ing.lastCost)
          : 0)
      );
    } else if (item.subProductId) {
      const prod = products.find((p) => p.id === item.subProductId);
      return acc + (prod ? item.quantity * prod.cost : 0);
    }
    return acc;
  }, 0);

  return (
    <Card className="rounded-2xl shadow-xl border-gray-900/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold text-gray-900">
          {isEditing ? `Editar ${initialData.name}` : "Crear Producto"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-2 block" htmlFor="name">
              Nombre del Producto
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              className="w-full"
              placeholder="ej. Pizza Muzzarella"
              defaultValue={initialData?.name}
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-900 mb-1">
              Tipo
            </span>
            <div className="flex gap-2">
              {PRODUCT_TYPES.map((type) => (
                <label htmlFor={type} key={type}>
                  <input
                    type="radio"
                    name="type"
                    id={type}
                    value={type}
                    checked={productType === type}
                    onChange={() => handleTypeChange(type)}
                    hidden
                  />
                  <Card
                    className={`cursor-pointer transition-all py-4 h-full border-input ${
                      productType === type
                        ? "bg-purple-400/80 border-purple-500"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <CardContent className="px-3 flex flex-1 flex-col items-center justify-center">
                      <div className="text-3xl mb-2 text-center">
                        {PRODUCT_TYPE_ICONS[type] || "📦"}
                      </div>
                      <div className="font-bold text-gray-800 text-center text-sm">
                        {PRODUCT_TYPE_LABELS[type]}
                      </div>
                    </CardContent>
                  </Card>
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-2 block" htmlFor="description">
              Description (Opcional)
            </Label>
            <Textarea
              id="description"
              name="description"
              rows={2}
              className="w-full resize-none"
              placeholder="Ingredientes clave, alérgenos, etc."
              defaultValue={initialData?.description}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">Categoría</Label>
              <Select
                name="category"
                value={category}
                onValueChange={(val) => setCategory(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_CATEGORIES[productType].map((sub) => (
                    <SelectItem key={sub} value={sub}>
                      {sub}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block" htmlFor="subCategory">
                Subcategoría (Opcional)
              </Label>
              <Input
                id="subCategory"
                name="subCategory"
                type="text"
                className="w-full"
                placeholder="e.g., Clásicas"
                defaultValue={initialData?.subCategory}
              />
            </div>
          </div>

          <div>
            <Label className="mb-2 block" htmlFor="basePrice">
              Precio de Venta ($)
            </Label>
            <Input
              id="basePrice"
              name="basePrice"
              type="number"
              step="1"
              min="0"
              required
              className="w-full"
              placeholder="0.00"
              defaultValue={initialData?.basePrice}
            />
          </div>

          {/* Manual cost input for REVENTA and OTHER */}
          {productType !== "ELABORADO" && (
            <div>
              <Label className="mb-2 block" htmlFor="manualCost">
                Costo Manual ($)
              </Label>
              <Input
                id="manualCost"
                name="manualCost"
                type="number"
                step="0.01"
                min="0"
                className="w-full"
                placeholder="0.00"
                defaultValue={initialData?.manualCost}
              />
              <p className="text-xs text-gray-500 mt-1">
                Ingrese el costo de compra/adquisición del producto
              </p>
            </div>
          )}

          {/* Recipe section for ELABORADO products */}
          {productType === "ELABORADO" && (
            <div className="mt-4 p-4 rounded-lg border border-gray-900/10">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-gray-900">
                  Receta (Ingredientes)
                </h3>
                <span className="text-sm font-medium text-green-600 bg-green-50/80 px-2 py-1 rounded">
                  Costo Estimado: ${currentCost.toFixed(2)}
                </span>
              </div>

              {clientError && (
                <div className="mb-2  text-sm bg-red-500/10 text-red-700 p-2 rounded">
                  {clientError}
                </div>
              )}

              <div className="space-y-2 mb-3">
                {recipeItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-2 items-center flex-wrap sm:flex-nowrap"
                  >
                    <Select
                      value={
                        item.ingredientId
                          ? `ing_${item.ingredientId}`
                          : `prod_${item.subProductId}`
                      }
                      onValueChange={(val) =>
                        updateItem(index, "ingredientId", val)
                      }
                    >
                      <SelectTrigger className="flex-2 min-w-[200px]">
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Ingredientes</SelectLabel>
                          {availableIngredients.map((ing) => (
                            <SelectItem key={ing.id} value={`ing_${ing.id}`}>
                              {ing.name} (${ing.lastCost || 0}/${ing.unit})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Productos</SelectLabel>
                          {products
                            // Filter out self if editing
                            .filter(
                              (p) => !isEditing || p.id !== initialData.id,
                            )
                            .map((prod) => (
                              <SelectItem
                                key={prod.id}
                                value={`prod_${prod.id}`}
                              >
                                {prod.name} (Costo: ${prod.cost.toFixed(2)})
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    <Select
                      value={item.unit}
                      onValueChange={(val) => updateItem(index, "unit", val)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UNITS.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      step="1"
                      min="0"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "quantity",
                          parseFloat(e.target.value),
                        )
                      }
                      placeholder="Qty"
                      className="w-24"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-50"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addIngredient}
                  className="text-purple-600 hover:text-purple-500 gap-1 border-purple-200 hover:bg-purple-50"
                >
                  + Agregar Ingrediente
                </Button>
                <CreateIngredientDialog
                  onSuccess={(newIngredient) => {
                    setAvailableIngredients((prev) => [...prev, newIngredient]);
                    setRecipeItems((prev) => [
                      ...prev,
                      {
                        ingredientId: newIngredient.id,
                        quantity: 1,
                        unit: newIngredient.unit,
                      },
                    ]);
                  }}
                />
              </div>
            </div>
          )}

          {/* Hidden input to pass recipe items as JSON */}
          <input
            type="hidden"
            name="recipeItems"
            value={JSON.stringify(recipeItems)}
          />

          {state?.message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                state.message.includes("correctamente")
                  ? "bg-green-500/20 text-green-700"
                  : "bg-red-500/20 text-red-700"
              }`}
            >
              {state.message}
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold shadow-lg"
          >
            {isPending
              ? "Guardando..."
              : isEditing
                ? "Actualizar Producto"
                : "Crear Producto"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
