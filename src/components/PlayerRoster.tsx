'use client'

import { useState } from 'react'
import { LINES, primaryLine, type AdminPlayer } from '@/lib/phase2'
import type { Tables } from '@/lib/database.types'
import PlayerForm from './PlayerForm'
import PlayerCard from './PlayerCard'

export default function PlayerRoster({ players, teams }: { players: AdminPlayer[]; teams: Tables<'team'>[] }) {
  const [team, setTeam] = useState('')
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const filtered = players.filter(player => (!team || player.player_team.some(item => item.team_id === team)) &&
    (status === 'all' || player.active === (status === 'active')) &&
    `${player.name} ${player.nickname ?? ''} ${player.dorsal}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))
  return <div className="space-y-8">
    <details className="glass-card rounded-2xl p-5"><summary className="min-h-11 cursor-pointer font-display font-bold">Nuevo jugador</summary><PlayerForm players={players} teams={teams} /></details>
    <div className="glass-card grid gap-3 rounded-2xl p-4 sm:grid-cols-3">
      <label className="text-sm">Equipo<select value={team} onChange={e => setTeam(e.target.value)} className="field-input mt-1"><option value="">Todos los equipos</option>{teams.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label className="text-sm">Estado<select value={status} onChange={e => setStatus(e.target.value)} className="field-input mt-1"><option value="all">Todos</option><option value="active">Activos</option><option value="inactive">Inactivos</option></select></label>
      <label className="text-sm">Buscar<input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Nombre, apodo o dorsal" className="field-input mt-1" /></label>
    </div>
    <p role="status" className="text-sm text-muted-foreground">{filtered.length} jugadores · agrupados por posición principal. Carrileros (WB): bandas de defensa y medio.</p>
    {LINES.map(line => { const group = filtered.filter(player => primaryLine(player.primary_position) === line); return group.length > 0 && <section key={line}><h2 className="mb-3 font-display text-lg font-bold">{line} · {group.length}</h2><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{group.map(player => <PlayerCard key={player.id} player={player} players={players} teams={teams} />)}</div></section> })}
    {!filtered.length && <p className="text-muted-foreground">No hay jugadores con estos filtros.</p>}
  </div>
}
