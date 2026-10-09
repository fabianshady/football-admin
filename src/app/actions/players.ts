'use server'

import { requireAdmin } from '@/lib/admin'
import { requiredText } from '@/lib/validation'
import { parsePlayer, freeDorsals } from '@/lib/phase2'
import { revalidatePath } from 'next/cache'
import { actionResult } from '@/lib/actionResult'

export async function getPlayers() {
  const supabase = await requireAdmin()
  const { data, error } = await supabase.from('Player')
    .select('*, player_team(team_id, team:team(*))').order('dorsal')
  if (error) throw new Error(error.message)
  return data
}
export async function getActivePlayers() {
  const supabase = await requireAdmin()
  const { data, error } = await supabase.from('Player')
    .select('*, player_team(team_id, team:team(*))').eq('active', true).order('name')
  if (error) throw new Error(error.message)
  return data
}
async function persistPlayer(form: FormData) {
  const supabase = await requireAdmin()
  const { payload, teams } = parsePlayer(form)
  const { data, error } = await supabase.rpc('save_player', { p_player: payload, p_team_ids: teams })
  if (error) {
    if (error.code === '23505') {
      const free = freeDorsals(await getPlayers(), payload.id).slice(0, 8)
      throw new Error(`Ese dorsal ya pertenece a un jugador activo. Dorsales disponibles: ${free.join(', ') || 'ninguno'}. Actualiza y elige otro.`)
    }
    throw new Error(error.message)
  }
  revalidatePath('/admin/players')
  revalidatePath('/admin/matches')
  return data
}
async function persistPlayerStatus(id: string, currentStatus: boolean) {
  const supabase = await requireAdmin()
  if (typeof currentStatus !== 'boolean') throw new Error('Estado inválido')
  const { error } = await supabase.rpc('save_player', { p_player: { id: requiredText(id, 'Jugador'), active: !currentStatus } })
  if (error) {
    if (error.code === '23505') throw new Error('No se puede reactivar: su dorsal está ocupado por un jugador activo. Edita el dorsal primero.')
    throw new Error(error.message)
  }
  revalidatePath('/admin/players')
  revalidatePath('/admin/matches')
}

export async function savePlayer(form: FormData) { return actionResult(() => persistPlayer(form)) }
export async function togglePlayerStatus(id: string, currentStatus: boolean) { return actionResult(() => persistPlayerStatus(id, currentStatus)) }
