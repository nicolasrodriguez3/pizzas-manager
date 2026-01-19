"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { convertCost } from "./utils/unitConversion";
import { calculateProductCost } from "../lib/costs";
import { PAGINATION } from "../config/constants";
import type { SaleItemInput } from "../types";
import { auth } from "@/app/auth";

export async function recordSale(items: SaleItemInput[]) {
  const session = await auth();
  if (!session?.user?.organizationId || !session?.user?.id) return;

  if (items.length === 0) return;

  // Fetch all products to get current prices and costs
  const products = await prisma.product.findMany({
    where: {
      id: { in: items.map((i) => i.productId) },
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

  // Calculate total amount and prepare items for DB
  let totalAmount = 0;
  const saleItemsData = [];

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue; // Should not happen

    // Calculate unit cost (recursively if needed)
    const unitCost = await calculateProductCost(product.id);

    totalAmount += product.basePrice * item.quantity;

    saleItemsData.push({
      productId: product.id,
      quantity: item.quantity,
      unitPrice: product.basePrice,
      unitCost: unitCost,
    });
  }

  await prisma.sale.create({
    data: {
      totalAmount,
      userId: session.user.id,
      organizationId: session.user.organizationId,
      items: {
        create: saleItemsData,
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/sales");
}

export async function getRecentSales() {
  const session = await auth();
  if (!session?.user?.organizationId) return [];

  return await prisma.sale.findMany({
    where: { organizationId: session.user.organizationId },
    take: PAGINATION.recentSalesLimit,
    orderBy: {
      dateTime: "desc",
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}
