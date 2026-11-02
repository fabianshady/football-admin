'use server'

import { requireAdmin } from '@/lib/admin'
import { requiredText } from '@/lib/validation'
import { parseGoal } from '@/lib/phase2'
import type { GoalKind } from '@/lib/database.types'
import { revalidatePath } from 'next/cache'
import { actionResult } from '@/lib/actionResult'

// 3. ¡GOL!
async function persistGoal(matchId: string, playerId: string | null, kind: GoalKind, minute: number | null) {
  const supabase = await requireAdmin()
  const { data, error } = await supabase.rpc('add_goal', parseGoal(matchId, playerId, kind, minute))
  if (error) throw new Error(/score|limit|exceed/i.test(error.message)
    ? 'Ya se alcanzó el marcador de nosotros. Actualiza el partido; corrige el marcador o quita un gol antes de registrar otro.' : error.message)
  revalidatePath('/admin/goals')
  revalidatePath('/admin/matches')
  return data
}

// 4. VAR (Quitar gol)
async function persistGoalRemoval(goalId: string) {
  const supabase = await requireAdmin()
  const { error } = await supabase.rpc('remove_goal', { p_goal_id: requiredText(goalId, 'Gol') })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/goals')
  revalidatePath('/admin/matches')
}

export async function addGoal(matchId: string, playerId: string | null, kind: GoalKind = 'player', minute: number | null = null) { return actionResult(() => persistGoal(matchId, playerId, kind, minute)) }
export async function removeGoal(goalId: string) { return actionResult(() => persistGoalRemoval(goalId)) }
