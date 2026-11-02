import 'server-only'
import { cache } from 'react'
import { requireAdmin } from '@/lib/admin'
import { querySeasons } from '@/lib/pure/adminQueries'
import { resolveSeasonFromList, type Season } from '@/lib/pure/seasons'

export type { Season } from '@/lib/pure/seasons'
export { resolveSeason, resolveSeasonFromList } from '@/lib/pure/seasons'

export const getSeasons = cache(async (): Promise<Season[]> => querySeasons(await requireAdmin()))

export async function getActiveSeason(): Promise<Season | null> {
  return (await getSeasons()).find(s => s.active) ?? null
}

/** Unknown explicit ids fall back to the active season; use resolveSeason for the `invalid` flag. */
export async function resolveSeasonId(seasonId?: string | null): Promise<string | null> {
  return resolveSeasonFromList(await getSeasons(), seasonId)
}
