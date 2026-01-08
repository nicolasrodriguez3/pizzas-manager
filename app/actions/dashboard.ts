'use server'

import { prisma } from '../lib/prisma'
import { PAGINATION } from '../config/constants'
import type { DashboardStats } from '../types'
import { auth } from '@/app/auth'

export async function getDashboardStats(): Promise<DashboardStats> {
    const session = await auth()

    // Default safe return if no session
    if (!session?.user?.id) {
        return {
            totalRevenue: 0,
            totalCost: 0,
            totalProfit: 0,
            totalSalesCount: 0,
            recentSales: []
        }
    }

    // Aggregate stats from all time or today? Let's do All Time for MVP demo
    const sales = await prisma.sale.findMany({
        where: { userId: session.user.id },
        include: {
            items: true
        }
    })

    let totalRevenue = 0
    let totalCost = 0
    let totalProfit = 0
    const totalSalesCount = sales.length

    sales.forEach(sale => {
        totalRevenue += sale.totalAmount
        sale.items.forEach(item => {
            // item.unitCost might be null if old record (though we set default 0), and item.quantity
            const cost = (item.unitCost || 0) * item.quantity
            totalCost += cost
        })
    })

    totalProfit = totalRevenue - totalCost

    // Get recent 5 sales for list
    const recentSales = await prisma.sale.findMany({
        where: { userId: session.user.id },
        take: PAGINATION.recentSalesLimit,
        orderBy: { dateTime: 'desc' },
        include: {
            items: {
                include: {
                    product: true
                }
            }
        }
    })

    return {
        totalRevenue,
        totalCost,
        totalProfit,
        totalSalesCount,
        recentSales
    }
}
