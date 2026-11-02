export type PlayerStatsRow = { player_id: string | null; goals: number | null; call_ups: number | null }
export type ScorerPlayer = { id: string; name: string; dorsal: number; nickname: string | null }
export type TopScorer = { id: string; name: string; dorsal: number; nickname: string | null; goals: number; matchesPlayed: number }

/** Sums per-team view rows per player. `matchesPlayed` is call-ups (squad rows), not appearances. */
export function totalsByPlayer(rows: readonly PlayerStatsRow[]) {
  const totals = new Map<string, { goals: number; callUps: number }>()
  for (const row of rows) {
    if (!row.player_id) continue
    const current = totals.get(row.player_id) ?? { goals: 0, callUps: 0 }
    current.goals += row.goals ?? 0
    current.callUps += row.call_ups ?? 0
    totals.set(row.player_id, current)
  }
  return totals
}

export function scorerIds(rows: readonly PlayerStatsRow[]) {
  return [...totalsByPlayer(rows)].filter(([, t]) => t.goals > 0).map(([id]) => id)
}

export function buildTopScorers(rows: readonly PlayerStatsRow[], players: readonly ScorerPlayer[]): TopScorer[] {
  const totals = totalsByPlayer(rows)
  return players
    .flatMap(p => {
      const t = totals.get(p.id)
      return t && t.goals > 0 ? [{ ...p, goals: t.goals, matchesPlayed: t.callUps }] : []
    })
    .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name))
}
