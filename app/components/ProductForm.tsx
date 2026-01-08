'use client'

import { createProduct } from '@/app/actions'
import { PRODUCT_TYPES, PRODUCT_TYPE_LABELS, UNITS } from '@/app/config/constants'
import type { Ingredient, ActionState, RecipeItemInput } from '@/app/types'
import { useState, useActionState } from 'react'

type ProductFormProps = {
    ingredients: Ingredient[]
}

// Simple client-side unit conversion for preview
function estimateCost(qty: number, rUnit: string, iUnit: string, iCost: number): number {
    if (Number.isNaN(qty)) return 0;

    let cost = 0;
    const ru = rUnit.toLowerCase();
    const iu = iUnit.toLowerCase();

    if (ru === iu) {
        cost = qty * iCost;
    } else if ((iu === 'kg' && (ru === 'g' || ru === 'grams')) || (iu === 'l' && (ru === 'ml' || ru === 'milliliters'))) {
        cost = qty * (iCost / 1000);
    } else {
        // default 1:1 if unknown
        cost = qty * iCost;
    }
    return cost;
}

const initialState: ActionState = {
    message: '',
}

export function ProductForm({ ingredients }: ProductFormProps) {
    const [state, formAction, isPending] = useActionState(createProduct, initialState)
    const [productType, setProductType] = useState('PIZZA')
    const [recipeItems, setRecipeItems] = useState<RecipeItemInput[]>([])
    const [clientError, setClientError] = useState('')

    const addIngredient = () => {
        if (ingredients.length > 0) {
            // Check for duplicate in next selection? 
            // Actually, we add just the first one by default, so we should check if the first one is already there?
            // Better UX: find first ingredient not in list
            const usedIds = new Set(recipeItems.map(i => i.ingredientId))
            const available = ingredients.find(i => !usedIds.has(i.id))

            if (available) {
                setRecipeItems([...recipeItems, {
                    ingredientId: available.id,
                    quantity: 1,
                    unit: available.unit
                }])
                setClientError('')
            } else if (ingredients.length > 0 && !available) {
                // Fallback if all are used, maybe just add the first one and let user change it, 
                // but we validated duplicates below. 
                // Simple logic: Just add first, but prevent selection duplication in updateItem
                setRecipeItems([...recipeItems, {
                    ingredientId: ingredients[0].id,
                    quantity: 1,
                    unit: ingredients[0].unit
                }])
            }
        }
    }

    const removeIngredient = (index: number) => {
        const newItems = [...recipeItems]
        newItems.splice(index, 1)
        setRecipeItems(newItems)
    }

    const updateItem = (index: number, field: 'ingredientId' | 'quantity' | 'unit', value: string | number) => {
        if (value === '') return;

        const newItems = [...recipeItems]

        if (field === 'ingredientId') {
            // Check duplicate
            const isDuplicate = recipeItems.some((item, idx) => idx !== index && item.ingredientId === value)
            if (isDuplicate) {
                setClientError('Este ingrediente ya está en la receta')
                return // Don't update
            } else {
                setClientError('')
            }

            const ing = ingredients.find(i => i.id === value)
            if (ing) {
                newItems[index] = { ...newItems[index], ingredientId: value as string, unit: ing.unit }
            }
        } else {
            // Quantity validation
            if (field === 'quantity' && (value as number) < 0) {
                return; // Prevent negative
            }
            newItems[index] = { ...newItems[index], [field]: value }
        }

        setRecipeItems(newItems)
    }

    // Calculate generic cost preview
    const currentCost = recipeItems.reduce((acc, item) => {
        const ing = ingredients.find(i => i.id === item.ingredientId)
        return acc + (ing ? estimateCost(item.quantity, item.unit, ing.unit, ing.cost) : 0)
    }, 0)

    return (
        <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Crear Producto</h2>
            <form action={formAction} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Nombre del Producto</label>
                    <input
                        name="name"
                        type="text"
                        required
                        className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., Margherita Pizza"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Descripción (Opcional)</label>
                    <textarea
                        name="description"
                        rows={2}
                        className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        placeholder="Ingredientes clave, alérgenos, etc."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Categoría</label>
                        <input
                            name="category"
                            type="text"
                            className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="e.g., Clásicas"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Tipo</label>
                        <select
                            name="type"
                            value={productType}
                            onChange={(e) => setProductType(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            {PRODUCT_TYPES.map(type => (
                                <option key={type} value={type} className="bg-neutral-900 text-white">
                                    {PRODUCT_TYPE_LABELS[type]}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Precio de Venta ($)</label>
                    <input
                        name="basePrice"
                        type="number"
                        step="1"
                        min="0"
                        required
                        className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="0.00"
                    />
                </div>

                {productType === 'PIZZA' && (
                    <div className="mt-4 p-4 rounded-lg bg-black/5 border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-bold text-gray-900">Receta (Ingredientes)</h3>
                            <span className="text-xs text-green-700 bg-green-900/30 px-2 py-1 rounded">
                                Costo Est.: ${currentCost.toFixed(2)}
                            </span>
                        </div>

                        {clientError && (
                            <div className="mb-2 text-red-400 text-sm bg-red-900/20 p-2 rounded">
                                {clientError}
                            </div>
                        )}

                        <div className="space-y-2 mb-3">
                            {recipeItems.map((item, index) => (
                                <div key={index} className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                                    <select
                                        value={item.ingredientId}
                                        onChange={(e) => updateItem(index, 'ingredientId', e.target.value)}
                                        className="flex-2 min-w-[120px] px-3 py-1.5 rounded-md bg-black/20 border border-white/10 text-white text-sm"
                                    >
                                        {ingredients.map(ing => (
                                            <option key={ing.id} value={ing.id} className="bg-neutral-900 text-white">{ing.name} (${ing.cost}/{ing.unit})</option>
                                        ))}
                                    </select>

                                    <input
                                        type="number"
                                        step="1"
                                        min="0"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                                        placeholder="Qty"
                                        className="w-20 px-3 py-1.5 rounded-md bg-black/20 border border-white/10 text-white text-sm placeholder-white/50"
                                    />

                                    <select
                                        value={item.unit}
                                        onChange={(e) => updateItem(index, 'unit', e.target.value)}
                                        className="w-24 px-3 py-1.5 rounded-md bg-black/20 border border-white/10 text-white text-sm"
                                    >
                                        {UNITS.map(unit => (
                                            <option key={unit} value={unit} className="bg-white text-black">{unit}</option>
                                        ))}
                                    </select>

                                    <button
                                        type="button"
                                        onClick={() => removeIngredient(index)}
                                        className="text-red-400 hover:text-red-300 p-1"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addIngredient}
                            className="text-sm text-purple-700 hover:text-purple-600 flex items-center gap-1"
                        >
                            + Agregar Ingrediente
                        </button>
                    </div>
                )
                }

                {/* Hidden input to pass recipe items as JSON */}
                <input type="hidden" name="recipeItems" value={JSON.stringify(recipeItems)} />

                {
                    state?.message && (
                        <div className={`p-3 rounded-lg text-sm ${state.message.includes('correctamente') ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}`}>
                            {state.message}
                        </div>
                    )
                }

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-3 px-4 bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg shadow-lg transform transition-all active:scale-95"
                >
                    {isPending ? 'Guardando...' : 'Crear Producto'}
                </button>
            </form >
        </div >
    )
}
