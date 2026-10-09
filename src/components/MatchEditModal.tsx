'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { updateMatch } from '@/app/actions/matches'
import { utcToVenueDateInput, utcToVenueTimeInput, venueWallclockToUtcIso } from '@/lib/dateUtils'
import type { Season } from '@/app/actions/seasons'
import MatchScheduleFields from './MatchScheduleFields'
import type { Team, KickoffSlot } from '@/lib/club'
import type { Tables } from '@/lib/database.types'
import { errorMessage, type AdminMatch, type AdminPlayer } from '@/lib/phase2'
import RivalFields from './RivalFields'
import SquadPicker from './SquadPicker'
import { unwrapResult } from '@/lib/actionResult'

type Props = {
  match: AdminMatch
  players: AdminPlayer[]
  rivals: Tables<'rival'>[]
  seasons: Season[]
  teams: Team[]
  slots: KickoffSlot[]
}

export default function MatchEditModal({ match, players, rivals, seasons, teams, slots }: Props) {
  const [teamId, setTeamId] = useState(match.teamId)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const dialogRef = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (isOpen) dialogRef.current?.showModal()
  }, [isOpen])

  const initialDateStr = utcToVenueDateInput(match.date)
  const initialTimeStr = utcToVenueTimeInput(match.date)

  const initialSelectedPlayers = match.squad.map(s => s.playerId)
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
    const timeValue = formData.get('time') as string
    formData.set('id', match.id)
    formData.set('kit', selectedKit.toString())

    selectedPlayers.forEach(id => formData.append('squad', id))

    startTransition(async () => {
      try {
        // Keep the exact stored instant when the operator did not change kickoff.
        // This also preserves seconds and the chosen side of an autumn DST overlap.
        formData.set('date', dateValue === initialDateStr && timeValue === initialTimeStr
          ? new Date(match.date).toISOString()
          : venueWallclockToUtcIso(dateValue, timeValue))
        unwrapResult(await updateMatch(formData))
        setIsOpen(false)
      } catch (e) {
        setError(errorMessage(e, 'Error al actualizar'))
      }
    })
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setSelectedPlayers(initialSelectedPlayers)
          setSelectedKit(initialKit)
          setTeamId(match.teamId)
          setError(null)
          setIsOpen(true)
        }}
        aria-label="Editar detalles del partido"
        className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground transition-all hover:bg-gold/15 hover:text-gold"
        title="Editar detalles del partido"
      >
        ✎
      </button>
    )
  }

  return (
    <dialog ref={dialogRef} onCancel={() => setIsOpen(false)} aria-labelledby="match-edit-title" className="m-auto w-[calc(100%-2rem)] max-w-3xl rounded-3xl bg-card p-0 text-foreground backdrop:bg-black/50">
      <div className="glass-card max-h-[90vh] w-full overflow-y-auto rounded-3xl shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/50 bg-card/90 px-5 py-4 backdrop-blur">
          <h2 id="match-edit-title" className="flex items-center gap-2 font-display font-bold tracking-wide text-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-navy text-xs font-black text-navy-foreground dark:bg-gold dark:text-navy">✎</span>
            Editar Partido
          </h2>
          <button
            type="button"
            aria-label="Cerrar edición de partido"
            onClick={() => setIsOpen(false)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <form action={handleSubmit} className="space-y-5 p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MatchScheduleFields teams={teams} slots={slots} pending={isPending} teamId={match.teamId} date={initialDateStr} time={initialTimeStr} override={match.schedule_override} onTeamChange={setTeamId} />
            <RivalFields rivals={rivals} rivalId={match.rivalId} pending={isPending} />
            <div className="sm:col-span-2">
              <label className="field-label">Ubicación</label>
              <input name="location" type="text" defaultValue={match.location} required disabled={isPending} className="field-input" />
            </div>
            <div>
              <label className="field-label">Temporada</label>
              <select
                name="seasonid"
                required
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
                <label className="field-label">Pos. Nosotros</label>
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

          <SquadPicker players={players} retained={match.squad.flatMap(item => item.player ? [item.player] : [])} teamId={teamId} selected={selectedPlayers} onToggle={togglePlayer} pending={isPending} />

          {error && (
            <p role="alert" className="text-sm font-medium text-banner">{error}</p>
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
    </dialog>
  )
}
