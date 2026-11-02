import 'server-only'
import { cache } from 'react'
import { requireAdmin } from '@/lib/admin'
import { queryActivePlayers, queryPlayers } from '@/lib/pure/adminQueries'

export const getPlayers = cache(async () => queryPlayers(await requireAdmin()))
export const getActivePlayers = cache(async () => queryActivePlayers(await requireAdmin()))

export type AdminPlayerRow = Awaited<ReturnType<typeof getPlayers>>[number]
export type ActivePlayerRow = Awaited<ReturnType<typeof getActivePlayers>>[number]
