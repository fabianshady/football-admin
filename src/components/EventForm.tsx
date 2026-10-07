'use client'

import { useState, useTransition } from 'react'
import { createEvent } from '@/app/actions/payments'
import { calendarDateToIso } from '@/lib/dateUtils'
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

    startTransition(async () => {
      try {
        formData.set('date', calendarDateToIso(dateValue))
        await createEvent(formData)
        const form = document.getElementById('event-form') as HTMLFormElement | null
        form?.reset()
      } catch (e: any) {
        setError(e?.message || 'Error al crear el cobro')
      }
    })
  }

  const defaultSeason = defaultSeasonId || seasons.find(s => s.active)?.id || seasons[0]?.id || ''

  return (
    <div className="glass-card mb-8 overflow-hidden rounded-2xl">
      <div className="border-l-4 border-emerald-500 p-5">
        <h3 className="mb-4 flex items-center gap-2 font-display text-base font-bold tracking-wide text-foreground">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500 text-xs font-black text-white">+</span>
          Nuevo Cobro
        </h3>
        <form id="event-form" action={handleSubmit} className="flex flex-col flex-wrap gap-3 sm:flex-row sm:items-end">
          <div>
            <label className="field-label">Concepto</label>
            <input
              name="name" type="text" placeholder="Ej. Arbitraje J3" required
              disabled={isPending}
              className="field-input sm:w-48"
            />
          </div>
          <div>
            <label className="field-label">Costo ($)</label>
            <input
              name="cost" type="number" min="0" step="0.01" placeholder="50" required
              disabled={isPending}
              className="field-input w-28"
            />
          </div>
          <div>
            <label className="field-label">Fecha</label>
            <input
              name="date" type="date" required
              disabled={isPending}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label">Temporada</label>
            <select
              name="seasonid"
              required
              defaultValue={defaultSeason}
              disabled={isPending || seasons.length === 0}
              className="field-input min-w-[140px]"
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
            className="w-full rounded-xl bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md disabled:opacity-50 sm:w-auto"
          >
            {isPending ? 'Creando…' : 'Crear Cobro'}
          </button>
        </form>
        {error && (
            <p role="alert" className="mt-3 text-sm font-medium text-banner">{error}</p>
        )}
        {seasons.length === 0 && (
          <p className="mt-3 text-sm text-gold">Crea una temporada antes de registrar cobros.</p>
        )}
      </div>
    </div>
  )
}
