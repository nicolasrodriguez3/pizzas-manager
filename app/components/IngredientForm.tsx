"use client";

import { createIngredient, updateIngredient } from "@/app/actions";
import { UNITS, UNIT_LABELS } from "@/app/config/constants";
import type { ActionState, Ingredient } from "@/app/types";
import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const initialState: ActionState = {
  message: "",
};

interface IngredientFormProps {
  ingredient?: Ingredient;
}

export function IngredientForm({ ingredient }: IngredientFormProps) {
  const router = useRouter();
  const isEditing = !!ingredient;
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    isEditing ? updateIngredient : createIngredient,
    initialState
  );

  // Reset form and clear URL when success
  useEffect(() => {
    if (state?.success) {
      if (!isEditing && formRef.current) {
        formRef.current.reset();
      }

      // Clear the edit search param from URL
      router.replace("/ingredients");
    }
  }, [state, isEditing, router]);

  return (
    <div className="p-6 rounded-2xl bg-gray-400/10 backdrop-blur-md border border-gray-400/20 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          {isEditing ? "Editar Ingrediente" : "Agregar Ingrediente"}
        </h2>
        {isEditing && (
          <Link
            href="/ingredients"
            className="text-xs text-orange-600 hover:text-orange-700 font-medium"
          >
            Cancelar Edición
          </Link>
        )}
      </div>

      <form ref={formRef} action={formAction} className="space-y-4">
        {isEditing && <input type="hidden" name="id" value={ingredient.id} />}

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Nombre
          </label>
          <input
            name="name"
            type="text"
            required
            key={ingredient?.id}
            defaultValue={ingredient?.name}
            className="w-full px-4 py-2 rounded-lg bg-black/10 border border-white/10 text-gray-900 placeholder-gray-800/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="e.g., Harina, Salsa de tomate"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Descripción (Opcional)
          </label>
          <textarea
            name="description"
            rows={2}
            key={ingredient?.id}
            defaultValue={ingredient?.description || ""}
            className="w-full px-4 py-2 rounded-lg bg-black/10 border border-white/10 text-gray-900 placeholder-gray-800/50 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            placeholder="Detalles adicionales..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Unidad
            </label>
            <select
              name="unit"
              key={ingredient?.id}
              defaultValue={ingredient?.unit}
              className="w-full px-4 py-2 rounded-lg bg-black/10 border border-white/10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
            >
              {UNITS.map((unit) => (
                <option
                  key={unit}
                  value={unit}
                  className="bg-neutral-50 text-gray-900"
                >
                  {UNIT_LABELS[unit]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Costo por Unidad ($)
            </label>
            <input
              name="cost"
              type="number"
              step="0.01"
              min="0"
              required
              key={ingredient?.id}
              defaultValue={ingredient?.cost}
              className="w-full px-4 py-2 rounded-lg bg-black/10 border border-white/10 text-gray-900 placeholder-gray-800/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="0.00"
            />
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

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 px-4 bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50 text-white font-bold rounded-lg shadow-lg transform transition-all active:scale-95"
        >
          {isPending
            ? "Guardando..."
            : isEditing
            ? "Actualizar Ingrediente"
            : "Agregar Ingrediente"}
        </button>
      </form>
    </div>
  );
}
