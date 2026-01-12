"use client";

import { createProduct } from "@/app/actions";
import {
  PRODUCT_TYPES,
  PRODUCT_TYPE_LABELS,
  DEFAULT_CATEGORIES,
  UNITS,
  type ProductType,
} from "@/app/config/constants";
import type {
  Ingredient,
  ActionState,
  RecipeItemInput,
  ProductBase,
} from "@/app/types";
import Link from "next/link";
import { useState, useActionState } from "react";

type ProductFormProps = {
  ingredients: Ingredient[];
  products: (ProductBase & { cost: number })[];
};

// Simple client-side unit conversion for preview
function estimateCost(
  qty: number,
  rUnit: string,
  iUnit: string,
  iCost: number
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

export function ProductForm({ ingredients, products }: ProductFormProps) {
  const [state, formAction, isPending] = useActionState(
    createProduct,
    initialState
  );
  const [productType, setProductType] = useState<ProductType>("ELABORADO");
  const [category, setCategory] = useState(DEFAULT_CATEGORIES.ELABORADO[0]);
  const [recipeItems, setRecipeItems] = useState<RecipeItemInput[]>([]);
  const [clientError, setClientError] = useState<React.ReactNode>("");

  // Update category when product type changes
  const handleTypeChange = (newType: ProductType) => {
    setProductType(newType);
    setCategory(DEFAULT_CATEGORIES[newType][0]);
    // Clear recipe items when switching away from ELABORADO
    if (newType !== "ELABORADO") {
      setRecipeItems([]);
    }
  };

  const createRecipe = (formData: FormData) => {
    formAction(formData);
    if (state.success) {
      setRecipeItems([]);
      setClientError("");
    }
  };

  const addIngredient = () => {
    // By default, add an ingredient if available, else a product
    if (ingredients.length > 0) {
      setRecipeItems([
        ...recipeItems,
        {
          ingredientId: ingredients[0].id,
          subProductId: null,
          quantity: 1,
          unit: ingredients[0].unit,
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
          No hay ingredientes ni productos disponibles.{" "}
          <Link href="/ingredients" className="underline">
            Agrega un ingrediente
          </Link>{" "}
          para continuar.
        </span>
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
    value: string | number
  ) => {
    if (value === "") return;

    const newItems = [...recipeItems];

    if (field === "ingredientId") {
      const isIng = value.toString().startsWith("ing_");
      const id = value.toString().replace("ing_", "").replace("prod_", "");

      if (isIng) {
        const ing = ingredients.find((i) => i.id === id);
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
      const ing = ingredients.find((i) => i.id === item.ingredientId);
      return (
        acc +
        (ing ? estimateCost(item.quantity, item.unit, ing.unit, ing.cost) : 0)
      );
    } else if (item.subProductId) {
      const prod = products.find((p) => p.id === item.subProductId);
      return acc + (prod ? item.quantity * prod.cost : 0);
    }
    return acc;
  }, 0);

  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-gray-900/10 shadow-xl">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Crear Producto</h2>
      <form action={createRecipe} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Nombre del Producto
          </label>
          <input
            name="name"
            type="text"
            required
            className="w-full px-4 py-2 rounded-lg bg-black/10 border border-gray-900/10 text-gray-900 placeholder-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="e.g., Margherita Pizza"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Descripción (Opcional)
          </label>
          <textarea
            name="description"
            rows={2}
            className="w-full px-4 py-2 rounded-lg bg-black/10 border border-gray-900/10 text-gray-900 placeholder-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            placeholder="Ingredientes clave, alérgenos, etc."
          />
        </div>

        <div className="">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Tipo
            </label>
            <select
              name="type"
              value={productType}
              onChange={(e) => handleTypeChange(e.target.value as ProductType)}
              className="w-full px-4 py-2 rounded-lg bg-black/10 border border-gray-900/10 text-gray-900 placeholder-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {PRODUCT_TYPES.map((type) => (
                <option key={type} value={type} className="">
                  {PRODUCT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Categoría
            </label>
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-black/10 border border-gray-900/10 text-gray-900 placeholder-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {DEFAULT_CATEGORIES[productType].map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Subcategoría (Opcional)
            </label>
            <input
              name="subCategory"
              type="text"
              className="w-full px-4 py-2 rounded-lg bg-black/10 border border-gray-900/10 text-gray-900 placeholder-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Clásicas"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Precio de Venta ($)
          </label>
          <input
            name="basePrice"
            type="number"
            step="1"
            min="0"
            required
            className="w-full px-4 py-2 rounded-lg bg-black/10 border border-gray-900/10 text-gray-900 placeholder-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="0.00"
          />
        </div>

        {/* Manual cost input for REVENTA and OTHER */}
        {productType !== "ELABORADO" && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Costo Manual ($)
            </label>
            <input
              name="manualCost"
              type="number"
              step="0.01"
              min="0"
              className="w-full px-4 py-2 rounded-lg bg-black/10 border border-gray-900/10 text-gray-900 placeholder-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="0.00"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ingrese el costo de compra/adquisición del producto
            </p>
          </div>
        )}

        {/* Recipe section for ELABORADO products */}
        {productType === "ELABORADO" && (
          <div className="mt-4 p-4 rounded-lg bg-black/5 border border-gray-900/10">
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
                  <select
                    value={
                      item.ingredientId
                        ? `ing_${item.ingredientId}`
                        : `prod_${item.subProductId}`
                    }
                    onChange={(e) =>
                      updateItem(index, "ingredientId", e.target.value)
                    }
                    className="flex-2 min-w-[120px] px-2 py-1.5 rounded-md bg-black/10 border border-gray-900/10 text-gray-900 text-sm"
                  >
                    <optgroup
                      label="Ingredientes"
                      className="bg-gray-50 text-purple-500"
                    >
                      {ingredients.map((ing) => (
                        <option
                          key={ing.id}
                          value={`ing_${ing.id}`}
                          className="bg-gray-50 text-gray-900"
                        >
                          {ing.name} (${ing.cost}/{ing.unit})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup
                      label="Productos"
                      className="bg-gray-50 text-indigo-500"
                    >
                      {products.map((prod) => (
                        <option
                          key={prod.id}
                          value={`prod_${prod.id}`}
                          className="bg-gray-50 text-gray-900"
                        >
                          {prod.name} (Costo: ${prod.cost.toFixed(2)})
                        </option>
                      ))}
                    </optgroup>
                  </select>

                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", parseFloat(e.target.value))
                    }
                    placeholder="Qty"
                    className="w-20 px-3 py-1.5 rounded-md bg-black/10 border border-gray-900/10 text-gray-900 text-sm placeholder-gray-800/50"
                  />

                  <select
                    value={item.unit}
                    onChange={(e) => updateItem(index, "unit", e.target.value)}
                    className="w-24 px-3 py-1.5 rounded-md bg-black/10 border border-gray-900/10 text-gray-900 text-sm"
                  >
                    {UNITS.map((unit) => (
                      <option
                        key={unit}
                        value={unit}
                        className="bg-white text-black"
                      >
                        {unit}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addIngredient}
              className="text-sm text-purple-600 hover:text-purple-500 flex items-center gap-1"
            >
              + Agregar Ingrediente
            </button>
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

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 px-4 bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg shadow-lg transform transition-all active:scale-95"
        >
          {isPending ? "Guardando..." : "Crear Producto"}
        </button>
      </form>
    </div>
  );
}
