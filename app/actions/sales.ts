'use server'

import { prisma } from '../lib/prisma'
import { revalidatePath } from 'next/cache'
import { convertCost } from './utils/unitConversion'
import { PAGINATION } from '../config/constants'
import type { SaleItemInput } from '../types'
import { auth } from '@/app/auth'

export async function recordSale(items: SaleItemInput[]) {
    const session = await auth()
    if (!session?.user?.id) return

    if (items.length === 0) return

    // Fetch all products to get current prices and costs
    const products = await prisma.product.findMany({
        where: {
            id: { in: items.map(i => i.productId) },
            userId: session.user.id
        },
        include: {
            receipeItems: {
                include: {
                    ingredient: true
                }
            }
        }
    })

    // Calculate total amount and prepare items for DB
    let totalAmount = 0
    const saleItemsData = []

    for (const item of items) {
        const product = products.find(p => p.id === item.productId)
        if (!product) continue // Should not happen

        let unitCost = 0
        if (product.receipeItems && product.receipeItems.length > 0) {
            unitCost = product.receipeItems.reduce((acc, recipeItem) => {
                return acc + convertCost(recipeItem.quantity, recipeItem.unit, recipeItem.ingredient.unit, recipeItem.ingredient.cost)
            }, 0)
        }

        totalAmount += product.basePrice * item.quantity

        saleItemsData.push({
            productId: product.id,
            quantity: item.quantity,
            unitPrice: product.basePrice,
            unitCost: unitCost
        })
    }

    await prisma.sale.create({
        data: {
            totalAmount,
            userId: session.user.id,
            items: {
                create: saleItemsData
            }
        }
    })

    revalidatePath('/')
    revalidatePath('/sales')
}

export async function getRecentSales() {
    const session = await auth()
    if (!session?.user?.id) return []

    return await prisma.sale.findMany({
        where: { userId: session.user.id },
        take: PAGINATION.recentSalesLimit,
        orderBy: {
            dateTime: 'desc'
        },
        include: {
            items: {
                include: {
                    product: true
                }
            }
        }
    })
}
