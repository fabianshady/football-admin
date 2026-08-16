'use client'

import { useState, useTransition } from 'react'
import { updateMatch } from '@/app/actions/matches'
import { utcToVenueDateInput, utcToVenueTimeInput, venueWallclockToUtcIso } from '@/lib/dateUtils'
import type { Season } from '@/app/actions/seasons'

type Player = {
  id: string
  name: string
  dorsal: number
  positions: string[]
}

type Props = {
  match: any
  players: Player[]
  seasons: Season[]
}

export default function MatchEditModal({ match, players, seasons }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const initialDateStr = utcToVenueDateInput(match.date)
  const initialTimeStr = utcToVenueTimeInput(match.date)

  const initialSelectedPlayers = match.squad?.map((s: any) => s.playerId || s.player?.id) || []
  const initialKit = match.kit || 1

  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(initialSelectedPlayers)
  const [selectedKit, setSelectedKit] = useState<number>(initialKit)

  const togglePlayer = (playerId: string) => {
    setSelectedPlayers(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    )
  }

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    const dateValue = formData.get('date') as string
    const timeValue = formData.get('time') as string || '20:00'

    formData.set('date', venueWallclockToUtcIso(dateValue, timeValue))
    formData.set('id', match.id)
    formData.set('kit', selectedKit.toString())

    selectedPlayers.forEach(id => formData.append('squad', id))

    startTransition(async () => {
      try {
        await updateMatch(formData)
        setIsOpen(false)
      } catch (e: any) {
        setError(e?.message || 'Error al actualizar')
      }
    })
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-6 w-6 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground transition-all hover:bg-gold/15 hover:text-gold"
        title="Editar detalles del partido"
      >
        ✎
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="glass-card max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/50 bg-card/90 px-5 py-4 backdrop-blur">
          <h2 className="flex items-center gap-2 font-display font-bold tracking-wide text-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-navy text-xs font-black text-navy-foreground dark:bg-gold dark:text-navy">✎</span>
            Editar Partido
          </h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <form action={handleSubmit} className="space-y-5 p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="field-label">Mi Equipo</label>
              <input name="myTeam" type="text" defaultValue={match.myTeam} required disabled={isPending} className="field-input" />
            </div>
            <div>
              <label className="field-label">Rival</label>
              <input name="rivalTeam" type="text" defaultValue={match.rivalTeam} required disabled={isPending} className="field-input" />
            </div>
            <div>
              <label className="field-label">Fecha</label>
              <input name="date" type="date" defaultValue={initialDateStr} required disabled={isPending} className="field-input" />
            </div>
            <div>
              <label className="field-label">Hora (Tijuana)</label>
              <input name="time" type="time" defaultValue={initialTimeStr} required disabled={isPending} className="field-input" />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Ubicación</label>
              <input name="location" type="text" defaultValue={match.location} required disabled={isPending} className="field-input" />
            </div>
            <div>
              <label className="field-label">Temporada</label>
              <select
                name="seasonid"
                defaultValue={match.seasonid || seasons.find(s => s.active)?.id || ''}
                disabled={isPending}
                className="field-input"
              >
                {seasons.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}{s.active ? ' ●' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="field-label">Mi Pos.</label>
                <input name="myPos" type="number" min="1" defaultValue={match.myPos} required disabled={isPending} className="field-input" />
              </div>
              <div>
                <label className="field-label">Pos. Rival</label>
                <input name="rivalPos" type="number" min="1" defaultValue={match.rivalPos} required disabled={isPending} className="field-input" />
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 pt-4">
            <label className="field-label">Uniforme a utilizar 👕</label>
            <div className="flex max-w-md gap-4">
              {[1, 2].map((kit) => (
                <button
                  key={kit}
                  type="button"
                  onClick={() => setSelectedKit(kit)}
                  className={`group relative flex flex-1 flex-col items-center overflow-hidden rounded-2xl border-2 p-3 transition-all ${
                    selectedKit === kit
                      ? 'border-gold bg-gold/10'
                      : 'border-border bg-muted/40 hover:border-gold/40'
                  }`}
                >
                  <div className="relative mb-2 flex h-20 w-20 items-center justify-center">
                    <img
                      src={`https://vpl0mb2pgnbucvy2.public.blob.vercel-storage.com/${kit}u.png`}
                      alt={`Uniforme ${kit}`}
                      className="max-h-full max-w-full object-contain drop-shadow-md transition-transform duration-200 group-hover:scale-110"
                    />
                  </div>
                  <span className="text-xs font-bold text-foreground">Uniforme {kit}</span>
                  {selectedKit === kit && (
                    <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-navy shadow-sm">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border/50 pt-4">
            <div className="mb-3 flex items-center gap-2">
              <label className="field-label mb-0">Convocatoria</label>
              {selectedPlayers.length > 0 && (
                <span className="rounded-full bg-navy px-2 py-0.5 text-[10px] font-bold text-navy-foreground dark:bg-gold dark:text-navy">
                  {selectedPlayers.length} seleccionados
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {players.map(player => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => togglePlayer(player.id)}
                  className={`group rounded-xl p-2.5 text-left text-xs transition-all ${
                    selectedPlayers.includes(player.id)
                      ? 'bg-navy text-navy-foreground shadow-md dark:bg-gold dark:text-navy'
                      : 'bg-muted/60 text-foreground hover:bg-muted'
                  }`}
                >
                  <span className={`block text-xs font-black ${selectedPlayers.includes(player.id) ? 'opacity-70' : 'text-muted-foreground'}`}>
                    #{player.dorsal}
                  </span>
                  <span className="block truncate font-semibold">{player.name}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm font-medium text-banner">{error}</p>
          )}

          <div className="flex gap-3 border-t border-border/50 pt-2">
            <button type="submit" disabled={isPending} className="btn-primary">
              {isPending ? 'Guardando…' : 'Guardar Cambios'}
            </button>
            <button type="button" onClick={() => setIsOpen(false)} disabled={isPending} className="btn-ghost">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
