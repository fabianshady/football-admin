import { utcToVenueDateInput, utcToVenueTimeInput } from './dateUtils'
import type { Team } from './club'

export function requiredText(value: unknown, label: string, max = 200): string {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) {
    throw new Error(`${label}: valor obligatorio (máximo ${max} caracteres)`)
  }
  return value.trim()
}
export function integer(value: unknown, label: string, min = 0): number {
  if (typeof value !== 'number' && typeof value !== 'string') throw new Error(`${label}: número inválido`)
  if (typeof value === 'string' && !/^\d+$/.test(value)) throw new Error(`${label}: número entero requerido`)
  const number = Number(value)
  if (!Number.isSafeInteger(number) || number < min) throw new Error(`${label}: número entero mínimo ${min}`)
  return number
}
export function nonnegativeAmount(value: unknown): number {
  if (typeof value !== 'string' || !/^\d+(\.\d{1,2})?$/.test(value)) throw new Error('Importe inválido; usa hasta dos decimales')
  const amount = Number(value)
  if (!Number.isFinite(amount)) throw new Error('Importe inválido')
  return amount
}
export function utcInstant(value: unknown): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) || !Number.isFinite(Date.parse(value))) {
    throw new Error('Fecha UTC inválida')
  }
  const normalized = new Date(value).toISOString()
  if (normalized.slice(0, 19) !== value.slice(0, 19)) throw new Error('Fecha UTC inválida')
  return normalized
}
export function validateSchedule(date: string, team: Team, slots: string[], override: boolean) {
  if (override) return
  const localDate = utcToVenueDateInput(date)
  const weekday = new Date(`${localDate}T12:00:00Z`).getUTCDay()
  if (weekday !== team.match_weekday) throw new Error('El día no coincide con el calendario del equipo. Marca la excepción de calendario si corresponde.')
  if (!slots.some(time => time.slice(0, 5) === utcToVenueTimeInput(date))) {
    throw new Error('Hora fuera de los horarios permitidos. Marca la excepción de calendario si corresponde.')
  }
}
export function parseMatch(form: FormData, updating: boolean) {
  const payload = {
    ...(updating ? { id: requiredText(form.get('id'), 'Partido') } : {}),
    teamId: requiredText(form.get('teamId'), 'Nosotros'),
    rivalTeam: requiredText(form.get('rivalTeam'), 'Rival'),
    date: utcInstant(form.get('date')),
    location: requiredText(form.get('location'), 'Ubicación'),
    myPos: integer(form.get('myPos'), 'Posición de nosotros', 1),
    rivalPos: integer(form.get('rivalPos'), 'Posición del rival', 1),
    kit: integer(form.get('kit'), 'Uniforme', 1),
    seasonid: requiredText(form.get('seasonid'), 'Temporada'),
    schedule_override: form.get('schedule_override') === 'on' || form.get('schedule_override') === 'true',
    ...(form.has('scoreHome') ? { scoreHome: integer(form.get('scoreHome'), 'Goles de nosotros') } : {}),
    ...(form.has('scoreAway') ? { scoreAway: integer(form.get('scoreAway'), 'Goles del rival') } : {}),
  }
  if (payload.kit !== 1 && payload.kit !== 2) throw new Error('Uniforme inválido')
  const players = [...new Set(form.getAll('squad').map(id => requiredText(id, 'Jugador')))]
  return { payload, players }
}
