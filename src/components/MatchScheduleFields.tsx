'use client'

import { useId, useState } from 'react'
import { KICKOFF_TIMES, WEEKDAYS, type Team, type KickoffSlot } from '@/lib/club'

type Props = {
  teams: Team[]
  slots: KickoffSlot[]
  pending: boolean
  teamId?: string
  date?: string
  time?: string
  override?: boolean
  onTeamChange?: (id: string) => void
}

export default function MatchScheduleFields({ teams, slots, pending, teamId, date, time, override = false, onTeamChange }: Props) {
  const prefix = useId()
  const [selectedTeam, setSelectedTeam] = useState(teamId || teams[0]?.id || '')
  const [exception, setException] = useState(override)
  const team = teams.find(item => item.id === selectedTeam)
  const allowed = slots.map(slot => slot.time.slice(0, 5)).filter(slot => KICKOFF_TIMES.some(time => time === slot))
  return <>
    <div>
      <label htmlFor={`${prefix}-team`} className="field-label">Nosotros</label>
      <select id={`${prefix}-team`} name="teamId" value={selectedTeam} onChange={event => { setSelectedTeam(event.target.value); onTeamChange?.(event.target.value) }} required disabled={pending || !teams.length} className="field-input">
        <option value="" disabled>Selecciona un equipo</option>
        {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
      </select>
      <p id={`${prefix}-schedule`} className="mt-2 text-xs text-muted-foreground">{team ? `${WEEKDAYS[team.match_weekday]}${team.league_name ? ` · ${team.league_name}` : ''}` : 'Configura los equipos antes de registrar un partido.'}</p>
    </div>
    <div>
      <label htmlFor={`${prefix}-date`} className="field-label">Fecha (Tijuana)</label>
      <input id={`${prefix}-date`} aria-describedby={`${prefix}-schedule`} name="date" type="date" defaultValue={date} required disabled={pending} className="field-input" />
    </div>
    <div>
      <label htmlFor={`${prefix}-time`} className="field-label">Hora (Tijuana)</label>
      {exception ? <input key="free" id={`${prefix}-time`} name="time" type="time" defaultValue={time || allowed[0]} required disabled={pending} className="field-input" /> :
        <select key="allowed" id={`${prefix}-time`} name="time" defaultValue={time && allowed.includes(time) ? time : ''} required disabled={pending || !allowed.length} className="field-input">
          <option value="" disabled>Selecciona horario</option>
          {allowed.map(slot => <option key={slot} value={slot}>{slot}</option>)}
        </select>}
    </div>
    <div className="sm:col-span-2 lg:col-span-4 rounded-2xl bg-muted p-4">
      <label className="flex items-center gap-3 text-sm font-semibold">
        <input name="schedule_override" type="checkbox" checked={exception} onChange={event => setException(event.target.checked)} disabled={pending} className="h-5 w-5 accent-[var(--primary)]" />
        Excepción de calendario: permitir otro día u hora
      </label>
      <p className="mt-2 text-xs text-muted-foreground">Sin excepción, el día debe coincidir con el equipo y la hora con los horarios autorizados. La excepción queda registrada en el partido.</p>
    </div>
  </>
}
