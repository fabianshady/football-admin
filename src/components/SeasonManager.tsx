'use client'

import { useState, useTransition } from 'react'
import { saveSeason, toggleSeasonActive, deleteSeason, type Season } from '@/app/actions/seasons'
import { formatCalendarDate, toCalendarInput } from '@/lib/dateUtils'

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
      {showForm ? (
        <div className="glass-card overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
            <h2 className="flex items-center gap-2 font-display font-bold tracking-wide text-foreground">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-banner text-xs font-black text-white">
                {editing ? '✎' : '+'}
              </span>
              {editing ? 'Editar Temporada' : 'Nueva Temporada'}
            </h2>
            <button type="button" onClick={closeForm} className="text-sm text-muted-foreground hover:text-foreground">
              ✕
            </button>
          </div>
          <form action={handleSubmit} className="space-y-4 p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2">
                <label className="field-label">Nombre</label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={editing?.name ?? ''}
                  placeholder="Ej: 26-2, Apertura 2026"
                  disabled={isPending}
                  className="field-input"
                />
              </div>
              <div>
                <label className="field-label">Inicio</label>
                <input
                  name="startdate"
                  type="date"
                  required
                  defaultValue={editing ? toCalendarInput(editing.startdate) : ''}
                  disabled={isPending}
                  className="field-input"
                />
              </div>
              <div>
                <label className="field-label">Fin</label>
                <input
                  name="enddate"
                  type="date"
                  required
                  defaultValue={editing ? toCalendarInput(editing.enddate) : ''}
                  disabled={isPending}
                  className="field-input"
                />
              </div>
            </div>
            <label className="flex cursor-pointer select-none items-center gap-3">
              <div className="relative">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={editing?.active ?? false}
                  disabled={isPending}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-emerald-500" />
                <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Marcar como temporada activa
              </span>
            </label>
            {error && (
              <p className="text-sm font-medium text-banner">{error}</p>
            )}
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={isPending} className="btn-primary">
                {isPending ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear temporada'}
              </button>
              <button type="button" onClick={closeForm} disabled={isPending} className="btn-ghost">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={openCreate}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border p-5 font-semibold text-muted-foreground transition-all hover:border-banner/50 hover:bg-banner/5 hover:text-banner"
        >
          <span className="text-lg">+</span> Nueva temporada
        </button>
      )}

      {deleteError && (
        <div className="flex items-start gap-2 rounded-xl border border-banner/30 bg-banner/10 px-4 py-3 text-sm font-medium text-banner">
          <span className="text-base">⚠️</span>
          <div className="flex-1">
            <p>{deleteError}</p>
            <button onClick={() => setDeleteError(null)} className="mt-1 text-xs underline opacity-80 hover:opacity-100">
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <div>
            <h2 className="font-display font-bold tracking-wide text-foreground">Temporadas</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{seasons.length} registrada{seasons.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {seasons.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <p className="mb-3 text-4xl">📅</p>
            <p className="font-medium">No hay temporadas aún</p>
            <p className="mt-1 text-sm">Crea la primera para organizar partidos y cobros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="bg-[hsl(218_68%_13%)] text-navy-foreground">
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide">Nombre</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide">Inicio</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide">Fin</th>
                  <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wide">Activa</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {seasons.map((season) => (
                  <tr
                    key={season.id}
                    className={`transition-colors hover:bg-muted/40 ${
                      season.active ? 'bg-emerald-500/5' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{season.name}</span>
                        {season.active && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-banner/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-banner">
                            <span className="h-1.5 w-1.5 rounded-full bg-banner" />
                            Activa
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {formatCalendarDate(season.startdate)}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {formatCalendarDate(season.enddate)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggle(season.id, season.active)}
                        disabled={isPending}
                        title={season.active ? 'Desactivar' : 'Activar'}
                        className="relative inline-flex items-center disabled:opacity-50"
                      >
                        <div className={`h-6 w-11 rounded-full transition-colors ${
                          season.active ? 'bg-emerald-500' : 'bg-muted'
                        }`} />
                        <div className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
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
                          className="rounded-lg bg-navy/10 px-3 py-1.5 text-xs font-semibold text-navy transition hover:bg-navy/15 disabled:opacity-50 dark:bg-gold/15 dark:text-gold dark:hover:bg-gold/25"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(season.id, season.name)}
                          disabled={isPending}
                          className="rounded-lg bg-banner/10 px-3 py-1.5 text-xs font-semibold text-banner transition hover:bg-banner/20 disabled:opacity-50"
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
