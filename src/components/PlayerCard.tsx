'use client'

import { useState, useTransition } from 'react'
import { updatePlayerInline, togglePlayerStatus, deletePlayer } from '@/app/actions/players'

const POSITION_COLORS: Record<string, string> = {
  'Portero':        'bg-gold/15 text-gold ring-1 ring-gold/30',
  'Defensa':        'bg-navy/10 text-navy ring-1 ring-navy/20 dark:bg-navy/40 dark:text-navy-foreground dark:ring-navy/40',
  'Mediocentro':    'bg-violet-500/10 text-violet-600 ring-1 ring-violet-500/20 dark:text-violet-300',
  'Lateral':        'bg-sky-500/10 text-sky-600 ring-1 ring-sky-500/20 dark:text-sky-300',
  'Delantero':      'bg-banner/10 text-banner ring-1 ring-banner/20',
  'Cuerpo Técnico': 'bg-muted text-muted-foreground ring-1 ring-border',
}

function getPositionColor(pos: string) {
  return POSITION_COLORS[pos] ?? 'bg-muted text-muted-foreground ring-1 ring-border'
}

type Player = {
  id: string
  name: string
  dorsal: number
  positions: string[]
  active: boolean
}

export default function PlayerCard({ player }: { player: Player }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(player.name)
  const [dorsal, setDorsal] = useState(String(player.dorsal))
  const [positions, setPositions] = useState(player.positions.join(', '))
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const reset = () => {
    setName(player.name)
    setDorsal(String(player.dorsal))
    setPositions(player.positions.join(', '))
    setError(null)
    setEditing(false)
  }

  const handleSave = () => {
    setError(null)
    const formData = new FormData()
    formData.set('id', player.id)
    formData.set('name', name)
    formData.set('dorsal', dorsal)
    formData.set('positions', positions)

    startTransition(async () => {
      try {
        await updatePlayerInline(formData)
        setEditing(false)
      } catch (e: any) {
        setError(e?.message || 'Error al guardar')
      }
    })
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl transition-all duration-200 ${
        player.active
          ? 'glass-card hover-lift'
          : 'glass-card opacity-60'
      }`}
    >
      <div className={`h-1 w-full ${player.active ? 'bg-gradient-to-r from-gold to-banner' : 'bg-muted'}`} />

      <div className="p-4 sm:p-5">
        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="field-label">Nombre</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field-input"
                disabled={isPending}
                autoFocus
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="field-label">Dorsal</label>
                <input
                  type="number"
                  value={dorsal}
                  onChange={(e) => setDorsal(e.target.value)}
                  className="field-input"
                  disabled={isPending}
                />
              </div>
              <div className="col-span-2">
                <label className="field-label">Posiciones</label>
                <input
                  value={positions}
                  onChange={(e) => setPositions(e.target.value)}
                  placeholder="Delantero, Extremo"
                  className="field-input"
                  disabled={isPending}
                />
              </div>
            </div>
            {error && (
              <p className="text-xs font-medium text-banner">{error}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isPending}
                className="btn-primary flex-1 px-3 py-2 text-xs"
              >
                {isPending ? 'Guardando…' : 'Guardar'}
              </button>
              <button
                onClick={reset}
                disabled={isPending}
                className="btn-ghost bg-muted px-3 py-2 text-xs"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-start justify-between">
              <div className="min-w-0 flex-1 pr-3">
                <h4 className="truncate font-display text-base font-bold tracking-wide text-foreground">{player.name}</h4>
                {!player.active && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Inactivo</span>
                )}
              </div>
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-navy font-display text-sm font-bold text-navy-foreground shadow-md dark:bg-gold dark:text-navy">
                {player.dorsal}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {player.positions.map((pos: string, i: number) => (
                <span
                  key={i}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getPositionColor(pos)}`}
                >
                  {pos}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {!editing && (
        <div className="flex flex-wrap gap-2 border-t border-border/40 px-4 pb-4 pt-3 sm:px-5">
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg bg-navy/10 px-3 py-1.5 text-xs font-semibold text-navy transition-all hover:bg-navy/15 dark:bg-gold/15 dark:text-gold dark:hover:bg-gold/25"
          >
            Editar
          </button>
          <form action={togglePlayerStatus.bind(null, player.id, player.active)}>
            <button className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              player.active
                ? 'bg-gold/15 text-gold hover:bg-gold/25'
                : 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25'
            }`}>
              {player.active ? 'Dar de baja' : 'Reactivar'}
            </button>
          </form>
          <form action={deletePlayer.bind(null, player.id)}>
            <button className="rounded-lg bg-banner/10 px-3 py-1.5 text-xs font-semibold text-banner transition-all hover:bg-banner/20">
              Eliminar
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
