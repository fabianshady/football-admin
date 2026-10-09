import type { Tables, PlayerPosition, PreferredSide, PlayerFoot, GoalKind } from './database.types'
import { integer, requiredText } from './validation'

export type AdminPlayer = Tables<'Player'> & { player_team: { team_id: string; team: Tables<'team'> | null }[] }
export type AdminMatch = Tables<'Match'> & {
  team: Tables<'team'> | null
  rival: Tables<'rival'> | null
  season: Tables<'season'> | null
  squad: (Tables<'MatchSquad'> & { player: Tables<'Player'> | null })[]
  goals: (Tables<'Goal'> & { player: Tables<'Player'> | null })[]
}
export const POSITIONS: Record<PlayerPosition, string> = {
  GK: 'Portero', CB: 'Central', WB: 'Carrilero', DM: 'Mediocentro defensivo',
  CM: 'Mediocentro', AM: 'Mediapunta', W: 'Extremo', ST: 'Delantero',
}
export const POSITION_CODES = Object.keys(POSITIONS) as PlayerPosition[]
export const SIDE_LABELS: Record<PreferredSide, string> = { L: 'Izquierda', R: 'Derecha', C: 'Centro', ANY: 'Cualquiera' }
export const FOOT_LABELS: Record<PlayerFoot, string> = { L: 'Izquierdo', R: 'Derecho', BOTH: 'Ambos' }
export const GOAL_LABELS: Record<GoalKind, string> = { player: 'Jugador', own_goal: 'Autogol rival', unknown: 'Sin atribución' }
export const LINES = ['Portería', 'Defensa', 'Carrileros', 'Medio', 'Ataque', 'Sin posición'] as const
export function primaryLine(position: PlayerPosition | null) {
  if (position === 'GK') return 'Portería'
  if (position === 'CB') return 'Defensa'
  if (position === 'WB') return 'Carrileros'
  if (position === 'DM' || position === 'CM' || position === 'AM') return 'Medio'
  if (position === 'W' || position === 'ST') return 'Ataque'
  return 'Sin posición'
}
function choice<T extends string>(value: unknown, choices: readonly T[], label: string): T {
  if (typeof value !== 'string' || !choices.includes(value as T)) throw new Error(`${label}: selección inválida`)
  return value as T
}
function nullableText(value: FormDataEntryValue | null, label: string) {
  return value === null || value === '' ? null : requiredText(value, label)
}
export function parsePlayer(form: FormData) {
  const dorsal = integer(form.get('dorsal'), 'Dorsal', 1)
  if (dorsal > 99) throw new Error('Dorsal: usa un número entre 1 y 99')
  const primary = form.get('primary_position')
  const primary_position = primary === '' ? null : choice(primary, POSITION_CODES, 'Posición principal')
  const secondary_positions = form.getAll('secondary_positions').map(value => choice(value, POSITION_CODES, 'Posición secundaria'))
  if (new Set(secondary_positions).size !== secondary_positions.length) throw new Error('Posiciones secundarias repetidas')
  if (secondary_positions.includes(primary_position as PlayerPosition) || (!primary_position && secondary_positions.length)) {
    throw new Error('Las secundarias requieren una principal distinta')
  }
  const active = choice(form.get('active'), ['true', 'false'], 'Estado') === 'true'
  const foot = form.get('foot')
  return {
    payload: {
      ...(form.get('id') ? { id: requiredText(form.get('id'), 'Jugador') } : {}),
      name: requiredText(form.get('name'), 'Nombre registrado'), dorsal, active,
      nickname: nullableText(form.get('nickname'), 'Apodo'), primary_position, secondary_positions,
      preferred_side: choice(form.get('preferred_side'), ['L', 'R', 'C', 'ANY'], 'Lado'),
      foot: foot === '' ? null : choice(foot, ['L', 'R', 'BOTH'], 'Pie'),
    },
    // Absent field preserves memberships; explicit marker permits an empty replacement.
    teams: form.has('memberships') ? [...new Set(form.getAll('team_ids').map(id => requiredText(id, 'Equipo')))] : null,
  }
}
export function freeDorsals(players: Pick<Tables<'Player'>, 'id' | 'active' | 'dorsal'>[], exceptId?: string) {
  const occupied = new Set(players.filter(p => p.active && p.id !== exceptId).map(p => p.dorsal))
  return Array.from({ length: 99 }, (_, i) => i + 1).filter(number => !occupied.has(number))
}
export function parseGoal(matchId: unknown, playerId: unknown, kind: unknown, minute: unknown) {
  const p_kind = choice(kind, ['player', 'own_goal', 'unknown'], 'Tipo de gol')
  const p_player_id = p_kind === 'player' ? requiredText(playerId, 'Jugador') : null
  if (p_kind !== 'player' && playerId !== null && playerId !== undefined && playerId !== '') throw new Error('Un autogol o gol sin atribución no lleva jugador')
  const p_minute = minute === null || minute === undefined || minute === '' ? null : integer(minute, 'Minuto')
  if (p_minute !== null && p_minute > 120) throw new Error('Minuto: usa un valor de 0 a 120')
  return { p_match_id: requiredText(matchId, 'Partido'), p_player_id, p_kind, p_minute }
}
export function goalProgress(assigned: number, score: number) {
  return { assigned, pending: Math.max(0, score - assigned), atCap: assigned >= score, complete: assigned === score }
}
export function goalLabel(goal: Pick<Tables<'Goal'>, 'kind' | 'playerId'>, players: Pick<Tables<'Player'>, 'id' | 'name'>[]) {
  return goal.kind === 'player' ? players.find(p => p.id === goal.playerId)?.name ?? 'Jugador registrado' : GOAL_LABELS[goal.kind]
}
export function normalizeRivalName(name: string) { return name.trim().replace(/\s+/g, ' ').toLowerCase() }
export function squadChoices(players: AdminPlayer[], retained: Tables<'Player'>[], teamId: string, selected: string[], onlyTeam: boolean) {
  const choices: AdminPlayer[] = [...players, ...retained.filter(player => !players.some(item => item.id === player.id)).map(player => ({ ...player, player_team: [] }))]
  const isMember = (player: AdminPlayer) => player.player_team.some(item => item.team_id === teamId)
  return {
    visible: choices.filter(player => !onlyTeam || isMember(player) || selected.includes(player.id)),
    crossTeam: choices.filter(player => selected.includes(player.id) && !isMember(player)),
  }
}
export function errorMessage(error: unknown, fallback = 'No se pudo guardar') { return error instanceof Error ? error.message : fallback }
