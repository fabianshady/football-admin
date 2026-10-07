import { fromZonedTime, formatInTimeZone } from 'date-fns-tz'

/** Kickoff and calendar dates are always Tijuana wall-clock. */
export const VENUE_TZ = 'America/Tijuana'

function asDate(input: string | Date): Date {
  return input instanceof Date ? input : new Date(input)
}

/** Interpret a date+time the operator typed as Tijuana time, store UTC ISO. */
export function venueWallclockToUtcIso(dateStr: string, timeStr: string = '00:00'): string {
  validateCalendarDate(dateStr)
  if (!/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(timeStr)) throw new Error('Hora inválida')
  const time = timeStr.length === 5 ? `${timeStr}:00` : timeStr
  const instant = fromZonedTime(`${dateStr}T${time}`, VENUE_TZ)
  if (formatInTimeZone(instant, VENUE_TZ, 'yyyy-MM-dd\'T\'HH:mm:ss') !== `${dateStr}T${time}`) {
    throw new Error('Esta hora no existe en Tijuana por el cambio de horario')
  }
  return instant.toISOString()
}

export function validateCalendarDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(`${value}T12:00:00Z`)) || new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) !== value) {
    throw new Error('Fecha de calendario inválida')
  }
  return value
}

export function utcToVenueDateInput(input: string | Date): string {
  return formatInTimeZone(asDate(input), VENUE_TZ, 'yyyy-MM-dd')
}

export function utcToVenueTimeInput(input: string | Date): string {
  return formatInTimeZone(asDate(input), VENUE_TZ, 'HH:mm')
}

export function formatVenueDateTime(input: string | Date): { date: string; time: string } {
  const instant = asDate(input)
  const parts = new Intl.DateTimeFormat('es-MX', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: VENUE_TZ,
  }).formatToParts(instant)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value.replace(/\.$/, '') ?? ''

  const weekday = get('weekday')
  const day = get('day')
  const month = get('month')
  const hour = get('hour').padStart(2, '0')
  const minute = get('minute').padStart(2, '0')

  return {
    date: `${weekday} ${day} ${month}`,
    time: `${hour}:${minute}`,
  }
}

export function formatVenueDate(input: string | Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: VENUE_TZ,
  }).format(asDate(input))
}

/** Date-only values (cobros, temporadas): noon in Tijuana so the calendar day stays put. */
export function calendarDateToIso(dateStr: string): string {
  validateCalendarDate(dateStr)
  return fromZonedTime(`${dateStr}T12:00:00`, VENUE_TZ).toISOString()
}

export function formatCalendarDate(
  input: string | Date,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
): string {
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.trim())) {
    return new Intl.DateTimeFormat('es-MX', {
      ...options,
      timeZone: VENUE_TZ,
    }).format(fromZonedTime(`${input.trim()}T12:00:00`, VENUE_TZ))
  }
  return new Intl.DateTimeFormat('es-MX', {
    ...options,
    timeZone: VENUE_TZ,
  }).format(asDate(input))
}

export function toCalendarInput(d: string): string {
  if (!d) return ''
  const trimmed = d.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  return formatInTimeZone(new Date(trimmed), VENUE_TZ, 'yyyy-MM-dd')
}
