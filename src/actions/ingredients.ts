"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/types";
import { auth } from "@/auth";

export async function getIngredients() {
  const session = await auth();
  if (!session?.user?.organizationId) return [];

  const ingredients = await prisma.ingredient.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { name: "asc" },
    include: {
      purchases: {
        where: { organizationId: session.user.organizationId },
        orderBy: { purchaseDate: "desc" },
        take: 1,
      },
    },
  });

  // Calcular costos basado en última compra
  return ingredients.map((ing) => ({
    ...ing,
    lastCost: ing.purchases[0]?.unitCost || 0,
    lastPurchaseDate: ing.purchases[0]?.purchaseDate,
    isLowStock: ing.minStock && ing.currentStock <= ing.minStock,
  }));
}

export async function createIngredient(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.organizationId || !session?.user?.id) {
    return { message: "Unauthorized" };
  }
  const organizationId = session.user.organizationId;

  const name = formData.get("name") as string;
  const unit = formData.get("unit") as string;
  const minStock = formData.get("minStock")
    ? parseFloat(formData.get("minStock") as string)
    : null;
  const description = formData.get("description") as string | null;
  const isActive = formData.get("isActive") !== "false";

  if (!name || name.trim() === "") {
    return { message: "El nombre es requerido" };
  }

  if (minStock !== null && minStock < 0) {
    return { message: "El stock mínimo no puede ser negativo" };
  }

  // Check for duplicates
  const existing = await prisma.ingredient.findFirst({
    where: {
      name: { equals: name.trim() },
      organizationId,
    },
  });

  if (existing) {
    return { message: "Ya existe un ingrediente con este nombre" };
  }

  const newIngredient = await prisma.ingredient.create({
    data: {
      name: name.trim(),
      unit,
      currentStock: 0, // Inicializar sin stock
      minStock,
      description: description ? description.trim() : null,
      isActive,
      userId: session.user.id,
      organizationId,
    },
  });

  revalidatePath("/ingredients");
  revalidatePath("/products");
  return {
    success: true,
    message: "Ingrediente creado correctamente",
    data: newIngredient,
  };
}

export async function deleteIngredient(id: string) {
  const session = await auth();
  if (!session?.user?.organizationId) return;

  try {
    await prisma.ingredient.deleteMany({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });
    revalidatePath("/ingredients");
  } catch (error) {
    console.error("Failed to delete ingredient:", error);
  }
}

export async function updateIngredient(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return { message: "Unauthorized" };
  }
  const organizationId = session.user.organizationId;

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const unit = formData.get("unit") as string;
  const minStock = formData.get("minStock")
    ? parseFloat(formData.get("minStock") as string)
    : null;
  const description = formData.get("description") as string | null;
  const isActive = formData.get("isActive") !== "false";

  if (!id) {
    return { message: "ID de ingrediente faltante" };
  }

  if (!name || name.trim() === "") {
    return { message: "El nombre es requerido" };
  }

  if (minStock !== null && minStock < 0) {
    return { message: "El stock mínimo no puede ser negativo" };
  }

  // Check for duplicates (excluding current)
  const existing = await prisma.ingredient.findFirst({
    where: {
      name: { equals: name.trim() },
      organizationId,
      NOT: { id },
    },
  });

  if (existing) {
    return { message: "Ya existe otro ingrediente con este nombre" };
  }

  try {
    await prisma.ingredient.update({
      where: {
        id,
        organizationId,
      },
      data: {
        name: name.trim(),
        unit,
        minStock,
        description: description ? description.trim() : null,
        isActive,
      },
    });
    revalidatePath("/ingredients");
    return { success: true, message: "Ingrediente actualizado correctamente" };
  } catch (error) {
    console.error("Failed to update ingredient:", error);
    return { message: "Error al actualizar el ingrediente" };
  }
}

// NUEVAS FUNCIONES

export async function getIngredientStock(id: string) {
  const session = await auth();
  if (!session?.user?.organizationId) return null;

  return await prisma.ingredient.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
    include: {
      purchases: {
        orderBy: { purchaseDate: "desc" },
        take: 5,
      },
      stockMovements: {
        orderBy: { movementDate: "desc" },
        take: 10,
      },
    },
  });
}

export async function updateIngredientStock(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return { message: "Unauthorized" };
  }

  const id = formData.get("id") as string;
  const newStock = parseFloat(formData.get("currentStock") as string);
  const reason = formData.get("reason") as string | null;
  const notes = formData.get("notes") as string | null;

  if (!id) {
    return { message: "ID de ingrediente faltante" };
  }

  if (isNaN(newStock) || newStock < 0) {
    return { message: "El stock debe ser un número válido" };
  }

  try {
    const ingredient = await prisma.ingredient.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!ingredient) {
      return { message: "Ingrediente no encontrado" };
    }

    const stockDifference = newStock - ingredient.currentStock;

    // Actualizar stock
    await prisma.ingredient.update({
      where: { id },
      data: { currentStock: newStock },
    });

    // Crear movimiento de ajuste si hay diferencia
    if (Math.abs(stockDifference) > 0.001) {
      await prisma.stockMovement.create({
        data: {
          organizationId: session.user.organizationId,
          ingredientId: id,
          type: "AJUSTE",
          quantity: stockDifference,
          unit: ingredient.unit,
          reason: reason || "Ajuste manual de stock",
          notes,
          referenceType: "ADJUSTMENT",
        },
      });
    }

    revalidatePath("/ingredients");
    return {
      success: true,
      message: "Stock actualizado correctamente",
    };
  } catch (error) {
    console.error("Failed to update ingredient stock:", error);
    return { message: "Error al actualizar el stock" };
  }
}
