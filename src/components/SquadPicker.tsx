'use client'

import { useState } from 'react'
import { POSITIONS, squadChoices, type AdminPlayer } from '@/lib/phase2'
import type { Tables } from '@/lib/database.types'

export default function SquadPicker({ players, retained = [], teamId, selected, onToggle, pending }: {
  players: AdminPlayer[]; retained?: Tables<'Player'>[]; teamId: string; selected: string[]; onToggle: (id: string) => void; pending: boolean
}) {
  const [onlyTeam, setOnlyTeam] = useState(true)
  const { crossTeam, visible } = squadChoices(players, retained, teamId, selected, onlyTeam)
  return <fieldset className="space-y-3 border-t border-border/50 pt-4">
    <legend className="field-label">Convocatoria · {selected.length} seleccionados</legend>
    <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={onlyTeam} onChange={e => setOnlyTeam(e.target.checked)} className="h-5 w-5" disabled={pending} />Mostrar afiliados al equipo seleccionado (y toda selección actual)</label>
    {crossTeam.length > 0 && <p role="status" className="text-sm text-gold">Sin afiliación verificada al equipo: {crossTeam.map(player => player.name).join(', ')}. Se conserva la selección; revisa si corresponde.</p>}
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">{visible.map(player => <button key={player.id} type="button" aria-pressed={selected.includes(player.id)} onClick={() => onToggle(player.id)} disabled={pending} className={`min-h-11 rounded-xl p-3 text-left text-xs ${selected.includes(player.id) ? 'bg-navy text-navy-foreground dark:bg-gold dark:text-navy' : 'bg-muted text-foreground'}`}><span className="block font-bold">#{player.dorsal} {player.name}</span><span>{player.primary_position ? POSITIONS[player.primary_position] : 'Sin posición'}{!player.active ? ' · Inactivo (histórico)' : ''}</span></button>)}</div>
    {!visible.length && <p className="text-sm text-muted-foreground">Sin afiliados activos. Desmarca el filtro para convocar desde la plantilla activa.</p>}
  </fieldset>
}
