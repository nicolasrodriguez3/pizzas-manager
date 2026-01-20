"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { convertCost } from "./utils/unitConversion";
import { calculateProductCost } from "../lib/costs";
import { PAGINATION } from "../config/constants";
import type {
  SaleItemInput,
  SalesHistoryParams,
  SalesHistoryResult,
} from "../types";
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

export async function getSalesHistory(
  params: SalesHistoryParams,
): Promise<SalesHistoryResult> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return {
      sales: [],
      hasMore: false,
      totalCount: 0,
      periodStats: { revenue: 0, cost: 0, profit: 0 },
    };
  }

  const {
    startDate,
    endDate,
    search,
    cursor,
    limit = PAGINATION.salesHistoryPerPage,
  } = params;

  // Build where clause
  const where: {
    organizationId: string;
    dateTime?: { gte?: Date; lte?: Date };
    items?: { some: { product: { name: { contains: string } } } };
  } = {
    organizationId: session.user.organizationId,
  };

  // Date filters
  if (startDate || endDate) {
    where.dateTime = {};
    if (startDate) {
      where.dateTime.gte = new Date(startDate);
    }
    if (endDate) {
      // Set to end of day
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      where.dateTime.lte = endOfDay;
    }
  }

  // Search filter (by product name)
  if (search && search.trim()) {
    where.items = {
      some: {
        product: {
          name: { contains: search.trim() },
        },
      },
    };
  }

  // Get total count for the filtered results
  const totalCount = await prisma.sale.count({ where });

  // Fetch sales with cursor-based pagination
  const sales = await prisma.sale.findMany({
    where,
    take: limit + 1, // Get one extra to check if there are more
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { dateTime: "desc" },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  // Check if there are more results
  const hasMore = sales.length > limit;
  const resultSales = hasMore ? sales.slice(0, limit) : sales;

  // Calculate period stats
  let revenue = 0;
  let cost = 0;

  // For stats, we need to aggregate all matching sales (not just the page)
  const allMatchingSales = await prisma.sale.findMany({
    where,
    include: { items: true },
  });

  allMatchingSales.forEach((sale) => {
    revenue += sale.totalAmount;
    sale.items.forEach((item) => {
      cost += (item.unitCost || 0) * item.quantity;
    });
  });

  return {
    sales: resultSales,
    hasMore,
    totalCount,
    periodStats: {
      revenue,
      cost,
      profit: revenue - cost,
    },
  };
}
