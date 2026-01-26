"use client";

import { useState, useActionState } from "react";
import { createIngredient } from "@/actions/ingredients";
import { UNITS } from "@/config/constants";
import type { ActionState, Ingredient } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CreateIngredientDialogProps = {
  onSuccess?: (ingredient: Ingredient) => void;
  trigger?: React.ReactNode;
};

const initialState: ActionState = {
  message: "",
};

export function CreateIngredientDialog({
  onSuccess,
  trigger,
}: CreateIngredientDialogProps) {
  const [open, setOpen] = useState(false);
  const [unit, setUnit] = useState<string>(UNITS[0]);

  const handleAction = async (prevState: ActionState, formData: FormData) => {
    // Inject the selected unit into the formData
    formData.set("unit", unit);
    const result = await createIngredient(prevState, formData);

    if (result.success && result.data) {
      setOpen(false);
      onSuccess?.(result.data as Ingredient);
      // Reset form state
      setUnit(UNITS[0]);
    }

    return result;
  };

  const [state, formAction, isPending] = useActionState(
    handleAction,
    initialState,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            type="button"
            variant="outline"
            className="text-green-600 hover:text-green-500 gap-1 border-green-200 hover:bg-green-50"
          >
            + Nuevo Ingrediente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Ingrediente</DialogTitle>
          <DialogDescription>
            Añade un ingrediente rápidamente sin salir del formulario de
            producto.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="ingredientName">Nombre</Label>
            <Input
              id="ingredientName"
              name="name"
              type="text"
              required
              placeholder="ej. Muzzarella"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ingredientUnit">Unidad</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger id="ingredientUnit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ingredientCost">Costo por {unit}</Label>
              <Input
                id="ingredientCost"
                name="cost"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
              />
            </div>
          </div>

          {state?.message && !state.success && (
            <div className="p-3 rounded-lg text-sm bg-red-500/20 text-red-700">
              {state.message}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              {isPending ? "Creando..." : "Crear Ingrediente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
