/**
 * Detecta la zona horaria del usuario
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Convierte una fecha local (string) + hora (string) a ISO UTC
 * @param dateStr - fecha en formato "YYYY-MM-DD"
 * @param timeStr - hora en formato "HH:MM"
 * @returns ISO string en UTC
 */
export function convertLocalToUTC(dateStr: string, timeStr: string = "00:00"): string {
  // Parsear la fecha
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hour, minute] = timeStr.split(':').map(Number)

  // Crear una fecha objeto usando el constructor que interpreta como HORA LOCAL
  // new Date(year, month, day, hour, minute, second) siempre usa hora local del usuario
  const localDate = new Date(year, month - 1, day, hour, minute, 0)

  // Convertir a ISO string (automáticamente convierte a UTC)
  return localDate.toISOString()
}
