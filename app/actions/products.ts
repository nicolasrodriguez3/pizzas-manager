'use server'

import { prisma } from '../lib/prisma'
import { revalidatePath } from 'next/cache'
import { convertCost } from './utils/unitConversion'
import type { ActionState, RecipeItemInput } from '../types'
import { auth } from '@/app/auth'

export async function getProducts() {
    const session = await auth()
    if (!session?.user?.id) return []

    const products = await prisma.product.findMany({
        where: { userId: session.user.id },
        include: {
            receipeItems: {
                include: {
                    ingredient: true
                }
            }
        },
        orderBy: { name: 'asc' }
    })

    // Calculate cost on the fly
    return products.map(product => {
        let cost = 0
        if (product.receipeItems && product.receipeItems.length > 0) {
            cost = product.receipeItems.reduce((acc, item) => {
                const itemCost = convertCost(item.quantity, item.unit, item.ingredient.unit, item.ingredient.cost)
                return acc + itemCost
            }, 0)
        }
        return { ...product, cost }
    })
}

export async function createProduct(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const session = await auth()
    if (!session?.user?.id) {
        return { message: 'Unauthorized' }
    }

    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const category = formData.get('category') as string | null
    const description = formData.get('description') as string | null
    const basePrice = parseFloat(formData.get('basePrice') as string)

    const recipeItemsJson = formData.get('recipeItems') as string
    const recipeItems = recipeItemsJson ? JSON.parse(recipeItemsJson) : []

    if (!name || name.trim() === '') {
        return { message: 'El nombre es requerido' }
    }

    if (basePrice < 0) {
        return { message: 'El precio no puede ser negativo' }
    }

    // Check for duplicates
    const existing = await prisma.product.findFirst({
        where: {
            name: { equals: name.trim() },
            userId: session.user.id
        }
    })

    if (existing) {
        return { message: 'Ya existe un producto con este nombre' }
    }

    // Server-side validation for recipes could occur here too (e.g. valid ingredients)

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
                    ingredientId: item.ingredientId,
                    quantity: item.quantity,
                    unit: item.unit
                }))
            }
        }
    })

    revalidatePath('/products')
    return { success: true, message: 'Producto creado correctamente' }
}

export async function deleteProduct(id: string) {
    const session = await auth()
    if (!session?.user?.id) return

    try {
        await prisma.product.delete({
            where: {
                id,
                userId: session.user.id
            }
        })
        revalidatePath('/products')
    } catch (error) {
        console.error('Failed to delete product:', error)
    }
}
