'use client'

import { useState, useTransition } from 'react'
import { togglePlayerStatus } from '@/app/actions/players'
import { POSITIONS, SIDE_LABELS, FOOT_LABELS, errorMessage, type AdminPlayer } from '@/lib/phase2'
import type { Tables } from '@/lib/database.types'
import PlayerForm from './PlayerForm'
import { unwrapResult } from '@/lib/actionResult'

export default function PlayerCard({ player, players, teams }: { player: AdminPlayer; players: AdminPlayer[]; teams: Tables<'team'>[] }) {
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  return <article className="glass-card overflow-hidden rounded-2xl">
    <div className={`h-1 ${player.active ? 'bg-gradient-to-r from-gold to-banner' : 'bg-muted'}`} />
    <div className="p-4 sm:p-5">
      {editing ? <PlayerForm player={player} players={players} teams={teams} onSaved={() => setEditing(false)} onCancel={() => setEditing(false)} /> : <>
        <div className="mb-3 flex justify-between gap-3"><div><h3 className="font-display font-bold">{player.name}</h3>{player.nickname && <p className="text-sm text-gold">{player.nickname}</p>}<p className="text-xs text-muted-foreground">{player.active ? 'Activo' : 'Inactivo'}</p></div><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy font-bold text-navy-foreground dark:bg-gold dark:text-navy">{player.dorsal}</span></div>
        <div className="flex flex-wrap gap-2"><span className="rounded-full bg-gold/15 px-3 py-1 text-xs">{player.primary_position ? POSITIONS[player.primary_position] : 'Sin posición'}</span>{player.secondary_positions.map(code => <span key={code} className="rounded-full bg-muted px-3 py-1 text-xs">{POSITIONS[code]}</span>)}</div>
        <p className="mt-3 text-xs text-muted-foreground">Lado: {SIDE_LABELS[player.preferred_side]} · Pie: {player.foot ? FOOT_LABELS[player.foot] : 'sin registrar'}</p>
        <p className="mt-2 text-xs text-muted-foreground">{player.player_team.map(item => item.team?.name).filter(Boolean).join(' · ') || 'Sin equipo actual'}</p>
        <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => { setError(''); setEditing(true) }} className="btn-ghost min-h-11">Editar</button><button disabled={pending} onClick={() => { setError(''); startTransition(async () => { try { unwrapResult(await togglePlayerStatus(player.id, player.active)) } catch (error) { setError(errorMessage(error)) } }) }} className="btn-ghost min-h-11">{pending ? 'Guardando…' : player.active ? 'Desactivar' : 'Reactivar'}</button></div>
        {error && <p role="alert" className="mt-2 text-sm text-banner">{error}</p>}
      </>}
    </div>
  </article>
}
