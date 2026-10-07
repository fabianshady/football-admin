/** Explicit DTOs for the coordinated database contract. */
export type Team = {
  id: string
  slug: string
  name: string
  match_weekday: number
  league_name: string | null
  sort_order: number
}
export type KickoffSlot = { time: string }
export type ClubSettings = {
  id: number
  phone: string | null
  clabe: string | null
  account: string | null
  bank: string | null
  weekly_fee: number
}
export const KICKOFF_TIMES = ['18:50', '19:40', '20:30', '21:20', '22:10'] as const
export const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
