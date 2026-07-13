'use server'

import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// 1. Top Goleadores (filtrable por temporada vía partidos de esa temporada)
export async function getTopScorers(seasonId?: string | null) {
  const supabase = await createClient()

  // If filtering by season, get match IDs for that season first
  let seasonMatchIds: string[] | null = null
  if (seasonId) {
    const { data: matches, error: matchErr } = await supabase
      .from('Match')
      .select('id')
      .eq('seasonid', seasonId)
    if (matchErr) throw new Error(matchErr.message)
    seasonMatchIds = (matches ?? []).map(m => m.id)
  }

  const { data: players, error } = await supabase
    .from('Player')
    .select('*, goals:Goal(*), matchSquads:MatchSquad(*)')
    .eq('active', true)
  if (error) throw new Error(error.message)

  return (players ?? [])
    .map(p => {
      const goals = seasonMatchIds
        ? (p.goals as any[]).filter(g => seasonMatchIds!.includes(g.matchId))
        : (p.goals as any[])
      const matchSquads = seasonMatchIds
        ? (p.matchSquads as any[]).filter(s => seasonMatchIds!.includes(s.matchId))
        : (p.matchSquads as any[])

      return {
        name: p.name,
        dorsal: p.dorsal,
        goals: goals.length,
        matchesPlayed: matchSquads.length,
      }
    })
    .filter(p => p.goals > 0)
    .sort((a, b) => b.goals - a.goals)
}

// 2. Partidos con goles desglosados
export async function getMatchesWithGoals(seasonId?: string | null) {
  const supabase = await createClient()
  let query = supabase
    .from('Match')
    .select('*, squad:MatchSquad(*, player:Player(*)), goals:Goal(*), season:season(*)')
    .order('date', { ascending: false })

  if (seasonId) {
    query = query.eq('seasonid', seasonId)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

// 3. ¡GOL!
export async function addGoal(matchId: string, playerId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('Goal').insert({ id: uuidv4(), matchId, playerId })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/goals')
}

// 4. VAR (Quitar gol)
export async function removeGoal(matchId: string, playerId: string) {
  const supabase = await createClient()
  const { data: goal, error: findErr } = await supabase
    .from('Goal')
    .select('id')
    .eq('matchId', matchId)
    .eq('playerId', playerId)
    .limit(1)
    .maybeSingle()
  if (findErr) throw new Error(findErr.message)

  if (goal) {
    const { error: deleteErr } = await supabase.from('Goal').delete().eq('id', goal.id)
    if (deleteErr) throw new Error(deleteErr.message)
    revalidatePath('/admin/goals')
  }
}
