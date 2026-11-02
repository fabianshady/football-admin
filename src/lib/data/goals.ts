import 'server-only'
import { cache } from 'react'
import { requireAdmin } from '@/lib/admin'
import { queryTopScorers } from '@/lib/pure/adminQueries'
import { getMatches } from './matches'

const scorersFor = cache(async (seasonId: string | null) => queryTopScorers(await requireAdmin(), seasonId))

export const getTopScorers = (seasonId?: string | null) => scorersFor(seasonId ?? null)
/** Same request-cached payload as getMatches (squad + goals with player id/name). */
export const getMatchesWithGoals = (seasonId?: string | null) => getMatches(seasonId)

export type MatchWithGoals = Awaited<ReturnType<typeof getMatchesWithGoals>>[number]
