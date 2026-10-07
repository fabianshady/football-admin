'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { createMatch } from '@/app/actions/matches'
import { venueWallclockToUtcIso } from '@/lib/dateUtils'
import type { Season } from '@/app/actions/seasons'
import MatchScheduleFields from './MatchScheduleFields'
import type { Team, KickoffSlot } from '@/lib/club'

type Player = {
  id: string
  name: string
  dorsal: number
  positions: string[]
}

type Props = {
  players: Player[]
  seasons: Season[]
  teams: Team[]
  slots: KickoffSlot[]
  defaultSeasonId?: string | null
}

export default function MatchForm({ players, seasons, teams, slots, defaultSeasonId }: Props) {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [selectedKit, setSelectedKit] = useState<number>(1)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const defaultSeason = defaultSeasonId || seasons.find(s => s.active)?.id || seasons[0]?.id || ''

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
    const timeValue = formData.get('time') as string
    formData.set('kit', selectedKit.toString())

    selectedPlayers.forEach(id => formData.append('squad', id))

    startTransition(async () => {
      try {
        formData.set('date', venueWallclockToUtcIso(dateValue, timeValue))
        await createMatch(formData)
        setSelectedPlayers([])
        setSelectedKit(1)
        setIsOpen(false)
      } catch (e: any) {
        setError(e?.message || 'Error al guardar el partido')
      }
    })
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="mb-8 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border p-5 font-semibold text-muted-foreground transition-all hover:border-gold/50 hover:bg-gold/5 hover:text-gold"
      >
        <span className="text-lg">+</span> Registrar nuevo partido
      </button>
    )
  }

  return (
    <div className="glass-card mb-8 overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
        <h2 className="flex items-center gap-2 font-display font-bold tracking-wide text-foreground">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-navy text-xs font-black text-navy-foreground dark:bg-gold dark:text-navy">+</span>
          Registrar Partido
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
          <MatchScheduleFields teams={teams} slots={slots} pending={isPending} />
          <div>
            <label className="field-label">Rival</label>
            <input name="rivalTeam" type="text" placeholder="Ej: Real Madrid" required disabled={isPending} className="field-input" />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label">Ubicación</label>
            <input name="location" type="text" placeholder="Ej: Estadio Azteca" required disabled={isPending} className="field-input" />
          </div>
          <div>
            <label className="field-label">Temporada</label>
            <select
              name="seasonid"
              required
              defaultValue={defaultSeason}
              disabled={isPending || seasons.length === 0}
              className="field-input"
            >
              {seasons.length === 0 && <option value="">Sin temporadas</option>}
              {seasons.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}{s.active ? ' ●' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="field-label">Pos. Nosotros</label>
              <input name="myPos" type="number" min="1" placeholder="1" required disabled={isPending} className="field-input" />
            </div>
            <div>
              <label className="field-label">Pos. Rival</label>
              <input name="rivalPos" type="number" min="1" placeholder="1" required disabled={isPending} className="field-input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="field-label">Nosotros</label>
              <input name="scoreHome" type="number" min="0" defaultValue="0" disabled={isPending} className="field-input" />
            </div>
            <div>
              <label className="field-label">Rival</label>
              <input name="scoreAway" type="number" min="0" defaultValue="0" disabled={isPending} className="field-input" />
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
                  <Image
                    width={80}
                    height={80}
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
                aria-pressed={selectedPlayers.includes(player.id)}
                disabled={isPending}
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
          {players.length === 0 && (
            <p className="text-sm text-muted-foreground">No hay jugadores activos para convocar</p>
          )}
        </div>

        {error && (
            <p role="alert" className="text-sm font-medium text-banner">{error}</p>
        )}

        <div className="flex gap-3 border-t border-border/50 pt-2">
          <button
            type="submit"
            disabled={isPending || seasons.length === 0 || teams.length === 0}
            className="btn-primary"
          >
            {isPending ? 'Guardando…' : 'Guardar Partido'}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            disabled={isPending}
            className="btn-ghost"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
