import type { AdminMatch, ActivePlayer, SquadPlayer } from '@/lib/phase2'
import { utcToVenueDateInput, utcToVenueTimeInput, venueWallclockToUtcIso } from '@/lib/dateUtils'

export type MatchEditData = {
  id: string
  date: string
  kit: number
  teamId: string
  rivalId: string
  location: string
  seasonid: string | null
  myPos: number
  rivalPos: number
  schedule_override: boolean
  squadIds: string[]
  retained: SquadPlayer[]
}

type EditSource = Pick<AdminMatch, 'id' | 'date' | 'kit' | 'teamId' | 'rivalId' | 'location' | 'seasonid' | 'myPos' | 'rivalPos' | 'schedule_override'> & {
  squad: Pick<AdminMatch['squad'][number], 'playerId' | 'player'>[]
}

/** Only the fields the editor needs; historical squad players absent from the active roster are kept. */
export function toMatchEditData(match: EditSource, activePlayers: Pick<ActivePlayer, 'id'>[]): MatchEditData {
  const active = new Set(activePlayers.map(p => p.id))
  return {
    id: match.id,
    date: match.date,
    kit: match.kit || 1,
    teamId: match.teamId,
    rivalId: match.rivalId,
    location: match.location,
    seasonid: match.seasonid,
    myPos: match.myPos,
    rivalPos: match.rivalPos,
    schedule_override: match.schedule_override,
    squadIds: match.squad.map(s => s.playerId),
    retained: match.squad.flatMap(s => s.player && !active.has(s.player.id) ? [s.player] : []),
  }
}

/** Keep the exact stored instant when kickoff inputs were not changed (preserves seconds and DST overlap side). */
export function resolveKickoffIso(storedIso: string, date: string, time: string) {
  return date === utcToVenueDateInput(storedIso) && time === utcToVenueTimeInput(storedIso)
    ? new Date(storedIso).toISOString()
    : venueWallclockToUtcIso(date, time)
}
