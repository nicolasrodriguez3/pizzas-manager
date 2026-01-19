"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { convertCost } from "./utils/unitConversion";
import { calculateProductCost } from "../lib/costs";
import type { ActionState, RecipeItemInput } from "../types";
import { auth } from "@/app/auth";
import { redirect } from "next/navigation";

export async function getProducts() {
  const session = await auth();
  if (!session?.user?.organizationId) return [];

  const products = await prisma.product.findMany({
    where: { organizationId: session.user.organizationId },
    include: {
      receipeItems: {
        include: {
          ingredient: true,
          subProduct: {
            include: {
              receipeItems: {
                include: {
                  ingredient: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Calculate costs for all products
  // We use Promise.all to fetch costs in parallel
  const productsWithCost = await Promise.all(
    products.map(async (product) => {
      const cost = await calculateProductCost(product.id);
      return { ...product, cost };
    }),
  );

  return productsWithCost;
}

export async function getProductBySlug(slug: string) {
  const session = await auth();
  if (!session?.user?.organizationId) return null;

  const product = await prisma.product.findFirst({
    where: {
      slug,
      organizationId: session.user.organizationId,
    },
    include: {
      receipeItems: {
        include: {
          ingredient: true,
          subProduct: {
            include: {
              receipeItems: {
                include: {
                  ingredient: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return product;
}

export async function createProduct(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.organizationId || !session?.user?.id) {
    return { message: "Unauthorized" };
  }
  const organizationId = session.user.organizationId;

  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const category = formData.get("category") as string | null;
  const subCategory = formData.get("subCategory") as string | null;
  const description = formData.get("description") as string | null;
  const basePrice = parseFloat(formData.get("basePrice") as string);

  // Manual cost is only for REVENTA and OTHER products
  const manualCostStr = formData.get("manualCost") as string | null;
  const manualCost = manualCostStr ? parseFloat(manualCostStr) : null;

  // Recipe items are only for ELABORADO products
  const recipeItemsJson = formData.get("recipeItems") as string;
  const recipeItems =
    type === "ELABORADO" && recipeItemsJson ? JSON.parse(recipeItemsJson) : [];

  if (!name || name.trim() === "") {
    return { message: "El nombre es requerido" };
  }

  if (basePrice < 0) {
    return { message: "El precio no puede ser negativo" };
  }

  const slug = name.toLowerCase().replace(/\s+/g, "-");

  // Check for duplicates
  const existing = await prisma.product.findFirst({
    where: {
      name: { equals: name.trim() },
      organizationId,
    },
  });

  if (existing) {
    return { message: "Ya existe un producto con este nombre" };
  }

  await prisma.product.create({
    data: {
      name: name.trim(),
      slug,
      type,
      category: category ? category.trim() : null,
      subCategory: subCategory ? subCategory.trim() : null,
      description: description ? description.trim() : null,
      basePrice,
      manualCost: type !== "ELABORADO" ? manualCost : null,
      userId: session.user.id,
      organizationId,
      receipeItems:
        type === "ELABORADO"
          ? {
              create: recipeItems.map((item: RecipeItemInput) => ({
                ingredientId: item.ingredientId || null,
                subProductId: item.subProductId || null,
                quantity: item.quantity,
                unit: item.unit,
              })),
            }
          : undefined,
    },
  });

  revalidatePath("/products");
  return { success: true, message: "Producto creado correctamente" };
}

export async function updateProduct(
  id: string,
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return { message: "Unauthorized" };
  }
  const organizationId = session.user.organizationId;

  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const category = formData.get("category") as string | null;
  const subCategory = formData.get("subCategory") as string | null;
  const description = formData.get("description") as string | null;
  const basePrice = parseFloat(formData.get("basePrice") as string);

  // Manual cost is only for REVENTA and OTHER products
  const manualCostStr = formData.get("manualCost") as string | null;
  const manualCost = manualCostStr ? parseFloat(manualCostStr) : null;

  // Recipe items are only for ELABORADO products
  const recipeItemsJson = formData.get("recipeItems") as string;
  const recipeItems =
    type === "ELABORADO" && recipeItemsJson ? JSON.parse(recipeItemsJson) : [];

  if (!name || name.trim() === "") {
    return { message: "El nombre es requerido" };
  }

  if (basePrice < 0) {
    return { message: "El precio no puede ser negativo" };
  }

  const slug = name.toLowerCase().replace(/\s+/g, "-");

  // Check for duplicates (excluding current product)
  const existing = await prisma.product.findFirst({
    where: {
      name: { equals: name.trim() },
      organizationId,
      NOT: {
        id: id,
      },
    },
  });

  if (existing) {
    return { message: "Ya existe otro producto con este nombre" };
  }

  try {
    // Transaction to update product and replace recipe items
    await prisma.$transaction(async (tx) => {
      // 1. Update basic product info
      await tx.product.update({
        where: {
          id,
          organizationId,
        },
        data: {
          name: name.trim(),
          slug,
          type,
          category: category ? category.trim() : null,
          subCategory: subCategory ? subCategory.trim() : null,
          description: description ? description.trim() : null,
          basePrice,
          manualCost: type !== "ELABORADO" ? manualCost : null,
        },
      });

      // 2. Handle Recipe Items (Delete all and recreate)
      // First, delete existing items
      await tx.recipeItem.deleteMany({
        where: {
          productId: id,
        },
      });

      // Then create new ones if type is ELABORADO
      if (type === "ELABORADO" && recipeItems.length > 0) {
        await tx.recipeItem.createMany({
          data: recipeItems.map((item: RecipeItemInput) => ({
            productId: id,
            ingredientId: item.ingredientId || null,
            subProductId: item.subProductId || null,
            quantity: item.quantity,
            unit: item.unit,
          })),
        });
      }
    });

    revalidatePath("/products");
    revalidatePath(`/products/${slug}`);
  } catch (error) {
    console.error("Failed to update product:", error);
    return { message: "Error al actualizar el producto" };
  }

  redirect(`/products/${slug}`);
}

export async function deleteProduct(id: string) {
  const session = await auth();
  if (!session?.user?.organizationId) return;

  try {
    await prisma.product.updateMany({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
      data: {
        isActive: false,
      },
    });
    revalidatePath("/products");
  } catch (error) {
    console.error("Failed to delete product:", error);
  }
}
