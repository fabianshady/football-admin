'use client'

import { useState, useTransition } from 'react'
import { createEvent } from '@/app/actions/payments'
import { convertLocalToUTC } from '@/lib/dateUtils'
import type { Season } from '@/app/actions/seasons'

type Props = {
  seasons: Season[]
  defaultSeasonId?: string | null
}

export default function EventForm({ seasons, defaultSeasonId }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    const dateValue = formData.get('date') as string
    const utcDateTime = convertLocalToUTC(dateValue, '00:00')
    formData.set('date', utcDateTime)

    startTransition(async () => {
      try {
        await createEvent(formData)
        // Reset form by reloading — server revalidation handles data
        const form = document.getElementById('event-form') as HTMLFormElement | null
        form?.reset()
      } catch (e: any) {
        setError(e?.message || 'Error al crear el cobro')
      }
    })
  }

  const defaultSeason = defaultSeasonId || seasons.find(s => s.active)?.id || seasons[0]?.id || ''

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-8 overflow-hidden">
      <div className="border-l-4 border-emerald-500 p-5">
        <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-emerald-500 rounded-md flex items-center justify-center text-white text-xs font-black">+</span>
          Nuevo Cobro
        </h3>
        <form id="event-form" action={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:items-end flex-wrap">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Concepto</label>
            <input
              name="name" type="text" placeholder="Ej. Arbitraje J3" required
              disabled={isPending}
              className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-full sm:w-48 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Costo ($)</label>
            <input
              name="cost" type="number" step="0.5" placeholder="50" required
              disabled={isPending}
              className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-28 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Fecha</label>
            <input
              name="date" type="date" required
              disabled={isPending}
              className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Temporada</label>
            <select
              name="seasonid"
              required
              defaultValue={defaultSeason}
              disabled={isPending || seasons.length === 0}
              className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition min-w-[140px] disabled:opacity-50"
            >
              {seasons.length === 0 && <option value="">Sin temporadas</option>}
              {seasons.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}{s.active ? ' ●' : ''}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={isPending || seasons.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md w-full sm:w-auto disabled:opacity-50"
          >
            {isPending ? 'Creando…' : 'Crear Cobro'}
          </button>
        </form>
        {error && (
          <p className="mt-3 text-sm text-rose-600 dark:text-rose-400 font-medium">{error}</p>
        )}
        {seasons.length === 0 && (
          <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">Crea una temporada antes de registrar cobros.</p>
        )}
      </div>
    </div>
  )
}
