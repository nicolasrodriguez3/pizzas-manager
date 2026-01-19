"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionState } from "../types";
import { auth } from "@/app/auth";

export async function getIngredients() {
  const session = await auth();
  if (!session?.user?.organizationId) return [];

  return await prisma.ingredient.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { name: "asc" },
  });
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
  const cost = parseFloat(formData.get("cost") as string);
  const description = formData.get("description") as string | null;
  const isActive = formData.get("isActive") !== "false";

  if (!name || name.trim() === "") {
    return { message: "El nombre es requerido" };
  }

  if (cost < 0) {
    return { message: "El costo no puede ser negativo" };
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

  await prisma.ingredient.create({
    data: {
      name: name.trim(),
      unit,
      cost,
      description: description ? description.trim() : null,
      isActive,
      userId: session.user.id,
      organizationId,
    },
  });

  revalidatePath("/ingredients");
  return { success: true, message: "Ingrediente creado correctamente" };
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
  const cost = parseFloat(formData.get("cost") as string);
  const description = formData.get("description") as string | null;
  const isActive = formData.get("isActive") !== "false";

  if (!id) {
    return { message: "ID de ingrediente faltante" };
  }

  if (!name || name.trim() === "") {
    return { message: "El nombre es requerido" };
  }

  if (cost < 0) {
    return { message: "El costo no puede ser negativo" };
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
        cost,
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
