import 'server-only'
import { cache } from 'react'
import { requireAdmin } from '@/lib/admin'
import { queryClubSettings, queryKickoffSlots, queryTeams } from '@/lib/pure/adminQueries'

export const getTeams = cache(async () => queryTeams(await requireAdmin()))
export const getKickoffSlots = cache(async () => queryKickoffSlots(await requireAdmin()))
export const getClubSettings = cache(async () => queryClubSettings(await requireAdmin()))

export async function getClubData() {
  const [teams, slots, settings] = await Promise.all([getTeams(), getKickoffSlots(), getClubSettings()])
  return { teams, slots, settings }
}
