'use server'

import { requireAdmin } from '@/lib/admin'
import { requiredText } from '@/lib/validation'
import { parseGoal } from '@/lib/phase2'
import type { GoalKind } from '@/lib/database.types'
import { revalidatePath } from 'next/cache'
import { actionResult } from '@/lib/actionResult'

// 1. Top Goleadores (filtrable por temporada vía partidos de esa temporada)
export async function getTopScorers(seasonId?: string | null) {
  const supabase = await requireAdmin()

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
  if (error) throw new Error(error.message)

  return (players ?? [])
    .map(p => {
      const goals = seasonMatchIds
         ? p.goals.filter(g => g.kind === 'player' && seasonMatchIds.includes(g.matchId))
         : p.goals.filter(g => g.kind === 'player')
      const matchSquads = seasonMatchIds
         ? p.matchSquads.filter(s => seasonMatchIds.includes(s.matchId))
         : p.matchSquads

      return {
        id: p.id,
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
  const supabase = await requireAdmin()
  let query = supabase
    .from('Match')
    .select('*, rival:rival(*), team:team(*), squad:MatchSquad(*, player:Player(*)), goals:Goal(*, player:Player(*)), season:season(*)')
    .order('date', { ascending: false })

  if (seasonId) {
    query = query.eq('seasonid', seasonId)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

// 3. ¡GOL!
async function persistGoal(matchId: string, playerId: string | null, kind: GoalKind, minute: number | null) {
  const supabase = await requireAdmin()
  const { data, error } = await supabase.rpc('add_goal', parseGoal(matchId, playerId, kind, minute))
  if (error) throw new Error(/score|limit|exceed/i.test(error.message)
    ? 'Ya se alcanzó el marcador de nosotros. Actualiza el partido; corrige el marcador o quita un gol antes de registrar otro.' : error.message)
  revalidatePath('/admin/goals')
  revalidatePath('/admin/matches')
  revalidatePath('/')
  return data
}

// 4. VAR (Quitar gol)
async function persistGoalRemoval(goalId: string) {
  const supabase = await requireAdmin()
  const { error } = await supabase.rpc('remove_goal', { p_goal_id: requiredText(goalId, 'Gol') })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/goals')
  revalidatePath('/admin/matches')
  revalidatePath('/')
}

export async function addGoal(matchId: string, playerId: string | null, kind: GoalKind = 'player', minute: number | null = null) { return actionResult(() => persistGoal(matchId, playerId, kind, minute)) }
export async function removeGoal(goalId: string) { return actionResult(() => persistGoalRemoval(goalId)) }
