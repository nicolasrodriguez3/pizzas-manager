"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/types";
import { auth } from "@/auth";

export async function createIngredientPurchase(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return { message: "Unauthorized" };
  }
  const organizationId = session.user.organizationId;

  const ingredientId = formData.get("ingredientId") as string;
  const quantity = parseFloat(formData.get("quantity") as string);
  const unit = formData.get("unit") as string;
  const unitCost = parseFloat(formData.get("unitCost") as string);
  const invoiceNumber = formData.get("invoiceNumber") as string | null;
  const supplierName = formData.get("supplierName") as string | null;
  const notes = formData.get("notes") as string | null;
  const purchaseDate = formData.get("purchaseDate") as string;

  if (!ingredientId) {
    return { message: "Debe seleccionar un ingrediente" };
  }

  if (!unit || !unit.trim()) {
    return { message: "Debe especificar la unidad de compra" };
  }

  if (!quantity || quantity <= 0) {
    return { message: "La cantidad debe ser mayor a 0" };
  }

  if (!unitCost || unitCost <= 0) {
    return { message: "El costo unitario debe ser mayor a 0" };
  }

  try {
    // Crear compra
    const purchase = await prisma.ingredientPurchase.create({
      data: {
        organizationId,
        ingredientId,
        quantity,
        unit,
        unitCost,
        invoiceNumber: invoiceNumber?.trim() || null,
        supplierName: supplierName?.trim() || null,
        notes: notes?.trim() || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      },
    });

    // Actualizar stock del ingrediente
    await prisma.ingredient.update({
      where: { id: ingredientId },
      data: {
        currentStock: {
          increment: quantity,
        },
      },
    });

    // Crear movimiento de stock
    await prisma.stockMovement.create({
      data: {
        organizationId,
        ingredientId,
        type: "COMPRA",
        quantity,
        unit,
        reason: `Compra ${invoiceNumber ? `Fact: ${invoiceNumber}` : "sin factura"}`,
        referenceId: purchase.id,
        referenceType: "PURCHASE",
        notes: `Proveedor: ${supplierName || "N/A"}`,
      },
    });

    revalidatePath("/ingredients");
    revalidatePath("/purchases");
    return {
      success: true,
      message: "Compra registrada correctamente",
      data: purchase,
    };
  } catch (error) {
    console.error("Failed to create ingredient purchase:", error);
    return { message: "Error al registrar la compra" };
  }
}

export async function getIngredientPurchases() {
  const session = await auth();
  if (!session?.user?.organizationId) return [];

  return await prisma.ingredientPurchase.findMany({
    where: { organizationId: session.user.organizationId },
    include: {
      ingredient: {
        select: {
          id: true,
          name: true,
          unit: true,
        },
      },
    },
    orderBy: { purchaseDate: "desc" },
  });
}

export async function updateIngredientPurchase(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return { message: "Unauthorized" };
  }
  const organizationId = session.user.organizationId;

  const id = formData.get("id") as string;
  const quantity = parseFloat(formData.get("quantity") as string);
  const unitCost = parseFloat(formData.get("unitCost") as string);
  const invoiceNumber = formData.get("invoiceNumber") as string | null;
  const supplierName = formData.get("supplierName") as string | null;
  const notes = formData.get("notes") as string | null;
  const purchaseDate = formData.get("purchaseDate") as string;

  if (!id) {
    return { message: "ID de compra faltante" };
  }

  if (!quantity || quantity <= 0) {
    return { message: "La cantidad debe ser mayor a 0" };
  }

  if (!unitCost || unitCost <= 0) {
    return { message: "El costo unitario debe ser mayor a 0" };
  }

  try {
    // Obtener compra original
    const originalPurchase = await prisma.ingredientPurchase.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        ingredient: true,
      },
    });

    if (!originalPurchase) {
      return { message: "Compra no encontrada" };
    }

    const quantityDiff = quantity - originalPurchase.quantity;

    // Actualizar compra
    await prisma.ingredientPurchase.update({
      where: { id },
      data: {
        quantity,
        unitCost,
        invoiceNumber: invoiceNumber?.trim() || null,
        supplierName: supplierName?.trim() || null,
        notes: notes?.trim() || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      },
    });

    // Ajustar stock del ingrediente
    if (Math.abs(quantityDiff) > 0.001) {
      await prisma.ingredient.update({
        where: { id: originalPurchase.ingredientId },
        data: {
          currentStock: {
            increment: quantityDiff,
          },
        },
      });

      // Actualizar movimiento de stock existente
      const existingMovement = await prisma.stockMovement.findFirst({
        where: {
          referenceId: id,
          referenceType: "PURCHASE",
        },
      });

      if (existingMovement) {
        await prisma.stockMovement.update({
          where: { id: existingMovement.id },
          data: {
            quantity,
            reason: `Compra (editada) ${invoiceNumber ? `Fact: ${invoiceNumber}` : "sin factura"}`,
            notes: `Proveedor: ${supplierName || "N/A"}`,
          },
        });
      }
    }

    revalidatePath("/ingredients");
    revalidatePath("/purchases");
    return {
      success: true,
      message: "Compra actualizada correctamente",
    };
  } catch (error) {
    console.error("Failed to update ingredient purchase:", error);
    return { message: "Error al actualizar la compra" };
  }
}

export async function deleteIngredientPurchase(id: string) {
  const session = await auth();
  if (!session?.user?.organizationId) return;

  try {
    const purchase = await prisma.ingredientPurchase.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (purchase) {
      // Restar stock del ingrediente
      await prisma.ingredient.update({
        where: { id: purchase.ingredientId },
        data: {
          currentStock: {
            decrement: purchase.quantity,
          },
        },
      });

      // Eliminar movimiento de stock
      await prisma.stockMovement.deleteMany({
        where: {
          referenceId: id,
          referenceType: "PURCHASE",
        },
      });
    }

    await prisma.ingredientPurchase.deleteMany({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    revalidatePath("/ingredients");
    revalidatePath("/purchases");
  } catch (error) {
    console.error("Failed to delete ingredient purchase:", error);
  }
}
