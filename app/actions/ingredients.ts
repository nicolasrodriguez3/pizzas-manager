'use server'

import { prisma } from '../lib/prisma'
import { revalidatePath } from 'next/cache'
import type { ActionState } from '../types'
import { auth } from '@/app/auth'

export async function getIngredients() {
    const session = await auth()
    if (!session?.user?.id) return []

    return await prisma.ingredient.findMany({
        where: { userId: session.user.id },
        orderBy: { name: 'asc' }
    })
}

export async function createIngredient(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const session = await auth()
    if (!session?.user?.id) {
        return { message: 'Unauthorized' }
    }

    const name = formData.get('name') as string
    const unit = formData.get('unit') as string
    const cost = parseFloat(formData.get('cost') as string)
    const description = formData.get('description') as string | null
    const isActive = formData.get('isActive') !== 'false'

    if (!name || name.trim() === '') {
        return { message: 'El nombre es requerido' }
    }

    if (cost < 0) {
        return { message: 'El costo no puede ser negativo' }
    }

    // Check for duplicates
    const existing = await prisma.ingredient.findFirst({
        where: {
            name: { equals: name.trim() },
            userId: session.user.id
        }
    })

    if (existing) {
        return { message: 'Ya existe un ingrediente con este nombre' }
    }

    await prisma.ingredient.create({
        data: {
            name: name.trim(),
            unit,
            cost,
            description: description ? description.trim() : null,
            isActive,
            userId: session.user.id
        }
    })

    revalidatePath('/ingredients')
    return { success: true, message: 'Ingrediente creado correctamente' }
}

export async function deleteIngredient(id: string) {
    const session = await auth()
    if (!session?.user?.id) return

    try {
        await prisma.ingredient.delete({
            where: {
                id,
                userId: session.user.id
            }
        })
        revalidatePath('/ingredients')
    } catch (error) {
        console.error('Failed to delete ingredient:', error)
    }
}

export async function updateIngredient(id: string, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return

    const name = formData.get('name') as string
    const unit = formData.get('unit') as string
    const cost = parseFloat(formData.get('cost') as string)

    try {
        await prisma.ingredient.update({
            where: {
                id,
                userId: session.user.id
            },
            data: {
                name,
                unit,
                cost
            }
        })
        revalidatePath('/ingredients')
    } catch (error) {
        console.error('Failed to update ingredient:', error)
    }
}
