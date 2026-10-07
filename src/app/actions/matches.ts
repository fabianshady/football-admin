'use server'

import { requireAdmin } from '@/lib/admin'
import { integer, parseMatch, requiredText, validateSchedule } from '@/lib/validation'
import type { Team } from '@/lib/club'
import { revalidatePath } from 'next/cache'

export async function getMatches(seasonId?: string | null) {
  const supabase = await requireAdmin()
  let query = supabase.from('Match')
    .select('*, team:team(*), squad:MatchSquad(*, player:Player(*)), goals:Goal(*, player:Player(*)), season:season(*)')
    .order('date', { ascending: false })
  if (seasonId) query = query.eq('seasonid', seasonId)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

async function persistMatch(formData: FormData, updating: boolean) {
  const supabase = await requireAdmin()
  const { payload, players } = parseMatch(formData, updating)
  const [teamResult, slotResult] = await Promise.all([
    supabase.from('team').select('*').eq('id', payload.teamId).single(),
    supabase.from('kickoff_slot').select('time'),
  ])
  if (teamResult.error) throw new Error(teamResult.error.message)
  if (slotResult.error) throw new Error(slotResult.error.message)
  validateSchedule(payload.date, teamResult.data as Team, (slotResult.data ?? []).map(slot => slot.time), payload.schedule_override)
  // Invoker RPC: match write and squad replacement succeed or roll back together.
  // Omitted score keys on edit deliberately preserve the existing scoreboard.
  const { error } = await supabase.rpc('save_match', { p_match: payload, p_player_ids: players })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/matches')
  revalidatePath('/admin/goals')
  revalidatePath('/')
}

export async function createMatch(formData: FormData) { await persistMatch(formData, false) }
export async function updateMatch(formData: FormData) { await persistMatch(formData, true) }

export async function deleteMatch(id: string) {
  const supabase = await requireAdmin()
  const { error } = await supabase.from('Match').delete().eq('id', requiredText(id, 'Partido'))
  if (error) throw new Error(error.message)
  revalidatePath('/admin/matches')
  revalidatePath('/admin/goals')
  revalidatePath('/')
}

export async function updateMatchScore(matchId: string, scoreHome: number, scoreAway: number) {
  const supabase = await requireAdmin()
  const { error } = await supabase.from('Match')
    .update({ scoreHome: integer(scoreHome, 'Goles de nosotros'), scoreAway: integer(scoreAway, 'Goles del rival') })
    .eq('id', requiredText(matchId, 'Partido')).select('id').single()
  if (error) throw new Error(error.message)
  revalidatePath('/admin/matches')
  revalidatePath('/admin/goals')
  revalidatePath('/')
}
