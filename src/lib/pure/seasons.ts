export type Season = {
  id: string
  name: string
  startdate: string
  enddate: string
  active: boolean
}

export type ResolvedSeason = { seasonId: string | null; season: Season | null; invalid: boolean }

/** Pure season resolution. An unknown explicit id is flagged `invalid` and falls back to the active season. */
export function resolveSeason(seasons: readonly Season[], requestedId?: string | null): ResolvedSeason {
  const requested = requestedId ? seasons.find(s => s.id === requestedId) ?? null : null
  if (requested) return { seasonId: requested.id, season: requested, invalid: false }
  const active = seasons.find(s => s.active) ?? null
  return { seasonId: active?.id ?? null, season: active, invalid: Boolean(requestedId) }
}

export function resolveSeasonFromList(seasons: readonly Season[], requestedId?: string | null): string | null {
  return resolveSeason(seasons, requestedId).seasonId
}
