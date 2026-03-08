'use server'

import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// 1. Top Goleadores
export async function getTopScorers() {
  const supabase = await createClient()
  const { data: players, error } = await supabase
    .from('Player')
    .select('*, goals:Goal(*), matchSquads:MatchSquad(*)')
    .eq('active', true)
  if (error) throw new Error(error.message)

  return (players ?? [])
    .map(p => ({
      name: p.name,
      dorsal: p.dorsal,
      goals: (p.goals as any[]).length,
      matchesPlayed: (p.matchSquads as any[]).length,
    }))
    .filter(p => p.goals > 0)
    .sort((a, b) => b.goals - a.goals)
}

// 2. Partidos con goles desglosados
export async function getMatchesWithGoals() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('Match')
    .select('*, squad:MatchSquad(*, player:Player(*)), goals:Goal(*)')
    .order('date', { ascending: false })
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
