'use client'

import { createIngredient } from '@/app/actions'
import { UNITS, UNIT_LABELS } from '@/app/config/constants'
import type { ActionState } from '@/app/types'
import { useActionState } from 'react'

const initialState: ActionState = {
  message: '',
}

export function IngredientForm() {
  const [state, formAction, isPending] = useActionState(createIngredient, initialState)

  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Agregar Ingrediente</h2>
      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Nombre</label>
          <input
            name="name"
            type="text"
            required
            className="w-full px-4 py-2 rounded-lg bg-black/10 border border-white/10 text-gray-900 placeholder-gray-800/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="e.g., Harina, Salsa de tomate"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Descripción (Opcional)</label>
          <textarea
            name="description"
            rows={2}
            className="w-full px-4 py-2 rounded-lg bg-black/10 border border-white/10 text-gray-900 placeholder-gray-800/50 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            placeholder="Detalles adicionales..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Unidad</label>
            <select
              name="unit"
              className="w-full px-4 py-2 rounded-lg bg-black/10 border border-white/10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
            >
              {UNITS.map(unit => (
                <option key={unit} value={unit} className="bg-neutral-900 text-gray-900">
                  {UNIT_LABELS[unit]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Costo por Unidad ($)</label>
            <input
              name="cost"
              type="number"
              step="0.01"
              min="0"
              required
              className="w-full px-4 py-2 rounded-lg bg-black/10 border border-white/10 text-gray-900 placeholder-gray-800/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="0.00"
            />
          </div>
        </div>

        {state?.message && (
          <div className={`p-3 rounded-lg text-sm ${state.message.includes('correctamente') ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}`}>
            {state.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 px-4 bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50 text-white font-bold rounded-lg shadow-lg transform transition-all active:scale-95"
        >
          {isPending ? 'Guardando...' : 'Agregar Ingrediente'}
        </button>
      </form>
    </div>
  )
}
