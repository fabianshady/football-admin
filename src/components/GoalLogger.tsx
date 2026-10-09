'use client'

import { useId, useState, useTransition } from 'react'
import { addGoal, removeGoal } from '@/app/actions/goals'
import { formatVenueDate } from '@/lib/dateUtils'
import { GOAL_LABELS, goalProgress, errorMessage, parseGoal, type AdminMatch } from '@/lib/phase2'
import type { GoalKind } from '@/lib/database.types'
import { unwrapResult, type ActionResult } from '@/lib/actionResult'

function MatchGoals({ match }: { match: AdminMatch }) {
  const prefix = useId()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [kind, setKind] = useState<GoalKind>('player')
  const [playerId, setPlayerId] = useState('')
  const [minute, setMinute] = useState('')
  const progress = goalProgress(match.goals.length, match.scoreHome)
  function write(action: () => Promise<ActionResult<unknown>>, message: string) {
    setError(''); setSuccess('')
    startTransition(async () => {
      try { unwrapResult(await action()); setSuccess(message) }
      catch (error) { setError(errorMessage(error, 'No se pudo actualizar el registro')) }
    })
  }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (progress.atCap) { setError('Ya se alcanzó el marcador de nosotros.'); return }
    try {
      const payload = parseGoal(match.id, kind === 'player' ? playerId : null, kind, minute)
      write(() => addGoal(payload.p_match_id, payload.p_player_id, payload.p_kind, payload.p_minute), 'Gol registrado')
    } catch (error) { setError(errorMessage(error)) }
  }
  return <div className="space-y-4 border-t border-border p-4">
    <p className="text-sm text-muted-foreground">Todos los tipos cuentan para nosotros. Autogol = gol del rival en su propia portería.</p>
    <div className="grid gap-2 sm:grid-cols-2">{match.squad.map(squad => <div key={squad.id} className="rounded-xl bg-muted p-3 text-sm"><span className="font-semibold">{squad.player?.name ?? 'Jugador registrado'}</span><span className="ml-2 text-gold">{match.goals.filter(goal => goal.kind === 'player' && goal.playerId === squad.playerId).length} goles</span></div>)}</div>
    <form onSubmit={submit} className="space-y-3">
      <fieldset disabled={pending || progress.atCap} className="grid gap-3 sm:grid-cols-3">
        <div><label htmlFor={`${prefix}-kind`} className="field-label">Tipo de gol</label><select id={`${prefix}-kind`} value={kind} onChange={e => setKind(e.target.value as GoalKind)} className="field-input">{Object.entries(GOAL_LABELS).map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></div>
        {kind === 'player' && <div><label htmlFor={`${prefix}-player`} className="field-label">Jugador convocado</label><select id={`${prefix}-player`} required value={playerId} onChange={e => setPlayerId(e.target.value)} className="field-input"><option value="">Selecciona jugador</option>{match.squad.map(squad => <option key={squad.id} value={squad.playerId}>{squad.player?.name ?? 'Jugador registrado'}</option>)}</select></div>}
        <div><label htmlFor={`${prefix}-minute`} className="field-label">Minuto (opcional · 0–120)</label><input id={`${prefix}-minute`} type="number" min={0} max={120} value={minute} onChange={e => setMinute(e.target.value)} className="field-input" /></div>
      </fieldset>
      <button disabled={pending || progress.atCap || (kind === 'player' && !match.squad.length)} className="btn-primary min-h-11">{pending ? 'Guardando…' : 'Registrar gol'}</button>
      {progress.atCap && <p className="text-sm text-muted-foreground">Marcador completo. Puedes quitar un registro para corregir su atribución, o editar el marcador.</p>}
    </form>
    <ul className="space-y-2" aria-label="Goles registrados">{match.goals.map((goal, index) => <li key={goal.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"><span className="text-sm">{index + 1}. {goal.kind === 'player' ? goal.player?.name ?? 'Jugador registrado' : GOAL_LABELS[goal.kind]}{goal.minute !== null ? ` · ${goal.minute}′` : ''}</span><button type="button" disabled={pending} onClick={() => write(() => removeGoal(goal.id), 'Gol eliminado del registro')} aria-label={`Quitar gol ${index + 1}${goal.minute !== null ? ` del minuto ${goal.minute}` : ''}`} className="btn-ghost min-h-11 text-banner">Quitar</button></li>)}</ul>
    {!match.goals.length && <p className="text-sm text-muted-foreground">Sin goles atribuidos todavía.</p>}
    {error && <p role="alert" className="text-sm text-banner">{error}</p>}
    {success && <p role="status" className="text-sm">{success}</p>}
  </div>
}

export default function GoalLogger({ matches, now }: { matches: AdminMatch[]; now: string }) {
  const [status, setStatus] = useState('pending')
  const [played, setPlayed] = useState('played')
  const visible = matches.filter(match => (played === 'all' || Date.parse(match.date) < Date.parse(now)) &&
    (status === 'all' || goalProgress(match.goals.length, match.scoreHome).complete === (status === 'complete')))
  return <div className="space-y-3">
    <div className="grid gap-3 rounded-2xl bg-muted p-4 sm:grid-cols-2"><label className="text-sm">Atribución<select value={status} onChange={e => setStatus(e.target.value)} className="field-input mt-1"><option value="pending">Pendiente</option><option value="complete">Completa</option><option value="all">Todas</option></select></label><label className="text-sm">Fecha<select value={played} onChange={e => setPlayed(e.target.value)} className="field-input mt-1"><option value="played">Partidos pasados</option><option value="all">Todos los partidos</option></select></label></div>
    <p role="status" className="text-xs text-muted-foreground">{visible.length} partidos. La fecha pasada no certifica que se haya jugado. La atribución completa admite correcciones.</p>
    {visible.map(match => { const progress = goalProgress(match.goals.length, match.scoreHome); return <details key={match.id} className="glass-card overflow-hidden rounded-2xl"><summary className="min-h-11 cursor-pointer p-4"><span className="font-bold">{match.team?.name ?? 'Nosotros'} vs {match.rival?.name ?? match.rivalTeam}</span><span className="mt-1 block text-xs text-muted-foreground">{formatVenueDate(match.date)} · {match.location}</span><span className="mt-2 block text-sm text-gold">{progress.assigned}/{match.scoreHome} registrados · {progress.pending} pendientes · marcador {match.scoreHome}–{match.scoreAway}</span><progress className="mt-2 w-full accent-[var(--gold)]" value={progress.assigned} max={Math.max(1, match.scoreHome)} aria-label="Goles registrados sobre marcador de nosotros" /></summary><MatchGoals match={match} /></details> })}
    {!visible.length && <p className="glass-card rounded-2xl p-6 text-muted-foreground">Sin partidos para estos filtros.</p>}
  </div>
}
