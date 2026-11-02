import 'server-only'
import { cache } from 'react'
import { requireAdmin } from '@/lib/admin'
import { queryMatches, queryRivals } from '@/lib/pure/adminQueries'

const matchesFor = cache(async (seasonId: string | null) => queryMatches(await requireAdmin(), seasonId))

export const getMatches = (seasonId?: string | null) => matchesFor(seasonId ?? null)
export const getRivals = cache(async () => queryRivals(await requireAdmin()))

export type AdminMatchRow = Awaited<ReturnType<typeof getMatches>>[number]
export type RivalRow = Awaited<ReturnType<typeof getRivals>>[number]
