'use client'

import { createEvent } from '@/app/actions/payments'
import { convertLocalToUTC } from '@/lib/dateUtils'

export default function EventForm() {
  const handleSubmit = async (formData: FormData) => {
    const dateValue = formData.get('date') as string

    // Convertir fecha a UTC (asumiendo 00:00:00 en timezone local)
    const utcDateTime = convertLocalToUTC(dateValue, '00:00')
    formData.set('date', utcDateTime)

    await createEvent(formData)
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-8 overflow-hidden">
      <div className="border-l-4 border-emerald-500 p-5">
        <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-emerald-500 rounded-md flex items-center justify-center text-white text-xs font-black">+</span>
          Nuevo Cobro
        </h3>
        <form action={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:items-end flex-wrap">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Concepto</label>
            <input
              name="name" type="text" placeholder="Ej. Arbitraje J3" required
              className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-full sm:w-48 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Costo ($)</label>
            <input
              name="cost" type="number" step="0.5" placeholder="50" required
              className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-28 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Fecha</label>
            <input
              name="date" type="date" required
              className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md w-full sm:w-auto"
          >
            Crear Cobro
          </button>
        </form>
      </div>
    </div>
  )
}
