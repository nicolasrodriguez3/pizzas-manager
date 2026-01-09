"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { convertCost } from "./utils/unitConversion";
import type { ActionState, RecipeItemInput } from "../types";
import { auth } from "@/app/auth";

export async function getProducts() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const products = await prisma.product.findMany({
    where: { userId: session.user.id },
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

  // Calculate cost recursively
  async function calculateProductCost(productId: string): Promise<number> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        receipeItems: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    if (!product || !product.receipeItems) return 0;

    let totalCost = 0;
    for (const item of product.receipeItems) {
      if (item.ingredientId && item.ingredient) {
        totalCost += convertCost(
          item.quantity,
          item.unit,
          item.ingredient.unit,
          item.ingredient.cost
        );
      } else if (item.subProductId) {
        const subProductCost = await calculateProductCost(item.subProductId);
        // For subproducts, we assume 1:1 units if not specified otherwise
        // We don't have a "unit" for Product yet, but we use the quantity
        totalCost += item.quantity * subProductCost;
      }
    }
    return totalCost;
  }

  // Map through products and calculate their costs
  // Note: To avoid too many DB calls, we could improve this by caching or fetching everything at once
  // For now, let's do a more efficient version of the initial fetch that includes subproduct info

  // Efficient calculation for the initial list
  const productsWithCost = products.map((product) => {
    const calculateCost = (prod: any): number => {
      let cost = 0;
      if (prod.receipeItems) {
        prod.receipeItems.forEach((item: any) => {
          if (item.ingredientId && item.ingredient) {
            cost += convertCost(
              item.quantity,
              item.unit,
              item.ingredient.unit,
              item.ingredient.cost
            );
          } else if (item.subProductId && item.subProduct) {
            // Recurse into subproduct
            cost += item.quantity * calculateCost(item.subProduct);
          }
        });
      }
      return cost;
    };
    return { ...product, cost: calculateCost(product) };
  });

  return productsWithCost;
}

export async function createProduct(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const category = formData.get("category") as string | null;
  const description = formData.get("description") as string | null;
  const basePrice = parseFloat(formData.get("basePrice") as string);

  const recipeItemsJson = formData.get("recipeItems") as string;
  const recipeItems = recipeItemsJson ? JSON.parse(recipeItemsJson) : [];

  if (!name || name.trim() === "") {
    return { message: "El nombre es requerido" };
  }

  if (basePrice < 0) {
    return { message: "El precio no puede ser negativo" };
  }

  // Check for duplicates
  const existing = await prisma.product.findFirst({
    where: {
      name: { equals: name.trim() },
      userId: session.user.id,
    },
  });

  if (existing) {
    return { message: "Ya existe un producto con este nombre" };
  }

  await prisma.product.create({
    data: {
      name: name.trim(),
      type,
      category: category ? category.trim() : null,
      description: description ? description.trim() : null,
      basePrice,
      userId: session.user.id,
      receipeItems: {
        create: recipeItems.map((item: RecipeItemInput) => ({
          ingredientId: item.ingredientId || null,
          subProductId: item.subProductId || null,
          quantity: item.quantity,
          unit: item.unit,
        })),
      },
    },
  });

  revalidatePath("/products");
  return { success: true, message: "Producto creado correctamente" };
}

export async function deleteProduct(id: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  try {
    await prisma.product.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });
    revalidatePath("/products");
  } catch (error) {
    console.error("Failed to delete product:", error);
  }
}
