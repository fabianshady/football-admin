'use client'

import { useState, useTransition } from 'react'
import { saveSeason, toggleSeasonActive, deleteSeason, type Season } from '@/app/actions/seasons'

function formatDate(d: string) {
  // Dates come as YYYY-MM-DD or ISO; display local
  const date = new Date(d.includes('T') ? d : d + 'T12:00:00')
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

function toInputDate(d: string) {
  if (!d) return ''
  if (d.includes('T')) return d.slice(0, 10)
  return d.slice(0, 10)
}

export default function SeasonManager({ seasons }: { seasons: Season[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Season | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const openCreate = () => {
    setEditing(null)
    setError(null)
    setShowForm(true)
  }

  const openEdit = (season: Season) => {
    setEditing(season)
    setError(null)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
    setError(null)
  }

  const handleSubmit = (formData: FormData) => {
    setError(null)
    if (editing) formData.set('id', editing.id)
    // Checkbox: if not present, set false
    if (!formData.has('active')) formData.set('active', 'false')
    else formData.set('active', 'true')

    startTransition(async () => {
      try {
        await saveSeason(formData)
        closeForm()
      } catch (e: any) {
        setError(e?.message || 'Error al guardar')
      }
    })
  }

  const handleToggle = (id: string, active: boolean) => {
    setDeleteError(null)
    startTransition(async () => {
      try {
        await toggleSeasonActive(id, active)
      } catch (e: any) {
        setDeleteError(e?.message || 'Error al cambiar estado')
      }
    })
  }

  const handleDelete = (id: string, name: string) => {
    setDeleteError(null)
    if (!confirm(`¿Eliminar la temporada "${name}"? Esta acción no se puede deshacer.`)) return
    startTransition(async () => {
      try {
        await deleteSeason(id)
      } catch (e: any) {
        setDeleteError(e?.message || 'No se pudo eliminar')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Create / Edit form */}
      {showForm ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <span className="w-6 h-6 bg-violet-600 rounded-md flex items-center justify-center text-white text-xs font-black">
                {editing ? '✎' : '+'}
              </span>
              {editing ? 'Editar Temporada' : 'Nueva Temporada'}
            </h2>
            <button type="button" onClick={closeForm} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm">
              ✕
            </button>
          </div>
          <form action={handleSubmit} className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Nombre</label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={editing?.name ?? ''}
                  placeholder="Ej: 26-2, Apertura 2026"
                  disabled={isPending}
                  className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-full text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 outline-none disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Inicio</label>
                <input
                  name="startdate"
                  type="date"
                  required
                  defaultValue={editing ? toInputDate(editing.startdate) : ''}
                  disabled={isPending}
                  className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-full text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 outline-none disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Fin</label>
                <input
                  name="enddate"
                  type="date"
                  required
                  defaultValue={editing ? toInputDate(editing.enddate) : ''}
                  disabled={isPending}
                  className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-full text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 outline-none disabled:opacity-50"
                />
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={editing?.active ?? false}
                  disabled={isPending}
                  className="peer sr-only"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 rounded-full peer-checked:bg-emerald-500 transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Marcar como temporada activa
              </span>
            </label>
            {error && (
              <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">{error}</p>
            )}
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={isPending}
                className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-xl font-semibold text-sm transition-all shadow-sm disabled:opacity-50"
              >
                {isPending ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear temporada'}
              </button>
              <button
                type="button"
                onClick={closeForm}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={openCreate}
          className="w-full p-5 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-all text-slate-400 hover:text-violet-500 font-semibold flex items-center justify-center gap-2"
        >
          <span className="text-lg">+</span> Nueva temporada
        </button>
      )}

      {deleteError && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl px-4 py-3 text-sm font-medium flex items-start gap-2">
          <span className="text-base">⚠️</span>
          <div className="flex-1">
            <p>{deleteError}</p>
            <button onClick={() => setDeleteError(null)} className="text-xs underline mt-1 opacity-80 hover:opacity-100">
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800 dark:text-slate-100">Temporadas</h2>
            <p className="text-xs text-slate-400 mt-0.5">{seasons.length} registrada{seasons.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {seasons.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <p className="text-4xl mb-3">📅</p>
            <p className="font-medium">No hay temporadas aún</p>
            <p className="text-sm mt-1">Crea la primera para organizar partidos y cobros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm text-left">
              <thead>
                <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wide">Nombre</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wide">Inicio</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wide">Fin</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wide text-center">Activa</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wide text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {seasons.map((season) => (
                  <tr
                    key={season.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                      season.active ? 'bg-emerald-50/40 dark:bg-emerald-900/10' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-100">{season.name}</span>
                        {season.active && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Activa
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      {formatDate(season.startdate)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      {formatDate(season.enddate)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggle(season.id, season.active)}
                        disabled={isPending}
                        title={season.active ? 'Desactivar' : 'Activar'}
                        className="relative inline-flex items-center disabled:opacity-50"
                      >
                        <div className={`w-11 h-6 rounded-full transition-colors ${
                          season.active ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-600'
                        }`} />
                        <div className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          season.active ? 'translate-x-5' : ''
                        }`} />
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(season)}
                          disabled={isPending}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg text-blue-600 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition disabled:opacity-50"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(season.id, season.name)}
                          disabled={isPending}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg text-rose-500 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition disabled:opacity-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
