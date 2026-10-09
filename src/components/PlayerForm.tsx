'use client'

import { useId, useState, useTransition } from 'react'
import { savePlayer } from '@/app/actions/players'
import { unwrapResult } from '@/lib/actionResult'
import { POSITIONS, POSITION_CODES, SIDE_LABELS, FOOT_LABELS, freeDorsals, errorMessage, type AdminPlayer } from '@/lib/phase2'
import type { Tables, PlayerPosition } from '@/lib/database.types'

export default function PlayerForm({ player, players, teams, onSaved, onCancel }: {
  player?: AdminPlayer; players: AdminPlayer[]; teams: Tables<'team'>[]; onSaved?: () => void; onCancel?: () => void
}) {
  const prefix = useId()
  const [primary, setPrimary] = useState<PlayerPosition | ''>(player?.primary_position ?? '')
  const [secondary, setSecondary] = useState<PlayerPosition[]>(player?.secondary_positions ?? [])
  const [dorsal, setDorsal] = useState(String(player?.dorsal ?? ''))
  const [active, setActive] = useState(player?.active ?? true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pending, startTransition] = useTransition()
  const free = freeDorsals(players, player?.id)
  const occupied = active && dorsal !== '' && !free.includes(Number(dorsal))
  function submit(form: FormData) {
    setError(''); setSuccess('')
    startTransition(async () => {
      try { unwrapResult(await savePlayer(form)); setSuccess('Jugador guardado'); onSaved?.() }
      catch (error) { setError(errorMessage(error)) }
    })
  }
  return <form action={submit} className="space-y-4">
    {player && <input type="hidden" name="id" value={player.id} />}
    <input type="hidden" name="memberships" value="replace" />
    <fieldset disabled={pending} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div><label htmlFor={`${prefix}-name`} className="field-label">Nombre registrado</label><input id={`${prefix}-name`} name="name" defaultValue={player?.name} required maxLength={200} className="field-input" /><p className="mt-1 text-xs text-muted-foreground">Conserva el nombre conocido; no hace falta un nombre completo.</p></div>
        <div><label htmlFor={`${prefix}-nickname`} className="field-label">Apodo (opcional)</label><input id={`${prefix}-nickname`} name="nickname" defaultValue={player?.nickname ?? ''} maxLength={200} className="field-input" /></div>
        <div><label htmlFor={`${prefix}-dorsal`} className="field-label">Dorsal · 1–99</label><input id={`${prefix}-dorsal`} name="dorsal" type="number" min={1} max={99} required value={dorsal} onChange={e => setDorsal(e.target.value)} aria-invalid={occupied} aria-describedby={`${prefix}-available`} className="field-input" />
          <p id={`${prefix}-available`} className={`mt-1 text-xs ${occupied ? 'text-banner' : 'text-muted-foreground'}`}>{occupied ? 'Dorsal ocupado por un jugador activo. ' : ''}Disponibles: {free.slice(0, 8).join(', ') || 'ninguno'} (se valida al guardar).</p>
          <div className="flex flex-wrap gap-1">{free.slice(0, 4).map(number => <button key={number} type="button" onClick={() => setDorsal(String(number))} className="btn-ghost min-h-11 min-w-11" aria-label={`Usar dorsal ${number}`}>{number}</button>)}</div>
        </div>
        <div><label htmlFor={`${prefix}-active`} className="field-label">Estado</label><select id={`${prefix}-active`} name="active" value={String(active)} onChange={e => setActive(e.target.value === 'true')} className="field-input"><option value="true">Activo</option><option value="false">Inactivo</option></select></div>
        <div><label htmlFor={`${prefix}-primary`} className="field-label">Posición principal</label><select id={`${prefix}-primary`} name="primary_position" value={primary} onChange={e => { const value = e.target.value as PlayerPosition | ''; setPrimary(value); setSecondary(value ? secondary.filter(code => code !== value) : []) }} className="field-input"><option value="">Sin posición</option>{POSITION_CODES.map(code => <option key={code} value={code}>{code} · {POSITIONS[code]}</option>)}</select></div>
        <div><label htmlFor={`${prefix}-side`} className="field-label">Lado preferido</label><select id={`${prefix}-side`} name="preferred_side" defaultValue={player?.preferred_side ?? 'ANY'} className="field-input">{Object.entries(SIDE_LABELS).map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></div>
        <div><label htmlFor={`${prefix}-foot`} className="field-label">Pie (opcional)</label><select id={`${prefix}-foot`} name="foot" defaultValue={player?.foot ?? ''} className="field-input"><option value="">Sin registrar</option>{Object.entries(FOOT_LABELS).map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></div>
      </div>
      <fieldset><legend className="field-label">Posiciones secundarias</legend><div className="flex flex-wrap gap-2">{POSITION_CODES.filter(code => code !== primary).map(code => <label key={code} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-3 text-xs ${secondary.includes(code) ? 'border-gold bg-gold/15' : 'border-border bg-muted'}`}><input type="checkbox" name="secondary_positions" value={code} disabled={!primary} checked={secondary.includes(code)} onChange={e => setSecondary(e.target.checked ? [...secondary, code] : secondary.filter(item => item !== code))} className="h-4 w-4" />{POSITIONS[code]}</label>)}</div></fieldset>
      <fieldset><legend className="field-label">Equipos actuales</legend><p className="mb-2 text-xs text-muted-foreground">Revisa las afiliaciones importadas del historial. La convocatoria no cambia esta afiliación.</p><div className="flex flex-wrap gap-2">{teams.map(team => <label key={team.id} className="flex min-h-11 items-center gap-2 rounded-xl bg-muted px-3 text-sm"><input name="team_ids" value={team.id} type="checkbox" defaultChecked={player?.player_team.some(item => item.team_id === team.id)} className="h-5 w-5" />{team.name}</label>)}</div></fieldset>
    </fieldset>
    {error && <p role="alert" className="text-sm text-banner">{error}</p>}
    {success && <p role="status" className="text-sm text-foreground">{success}</p>}
    <div className="flex flex-wrap gap-2"><button disabled={pending || occupied} className="btn-primary min-h-11">{pending ? 'Guardando…' : player ? 'Guardar cambios' : 'Registrar jugador'}</button>{onCancel && <button type="button" onClick={onCancel} disabled={pending} className="btn-ghost min-h-11">Cancelar</button>}</div>
  </form>
}
