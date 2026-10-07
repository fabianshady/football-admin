'use server'

import { requireAdmin } from '@/lib/admin'
import { requiredText } from '@/lib/validation'
import { validateCalendarDate } from '@/lib/dateUtils'
import { revalidatePath } from 'next/cache'

export type Season = {
  id: string
  name: string
  startdate: string
  enddate: string
  active: boolean
}

export async function getSeasons(): Promise<Season[]> {
  const supabase = await requireAdmin()
  const { data, error } = await supabase
    .from('season')
    .select('*')
    .order('startdate', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as Season[]
}

export async function getActiveSeason(): Promise<Season | null> {
  const supabase = await requireAdmin()
  const { data, error } = await supabase
    .from('season')
    .select('*')
    .eq('active', true)
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data as Season | null
}

/** Resolve seasonId from query param or fall back to active season */
export async function resolveSeasonId(seasonId?: string | null): Promise<string | null> {
  await requireAdmin()
  if (seasonId) return seasonId
  const active = await getActiveSeason()
  return active?.id ?? null
}

export async function saveSeason(formData: FormData) {
  const supabase = await requireAdmin()
  const id = (formData.get('id') as string) || null
  const name = requiredText(formData.get('name'), 'Nombre')
  const startdate = validateCalendarDate(requiredText(formData.get('startdate'), 'Inicio'))
  const enddate = validateCalendarDate(requiredText(formData.get('enddate'), 'Fin'))
  const active = formData.get('active') === 'on' || formData.get('active') === 'true'
  const isEdit = Boolean(formData.get('id'))

  if (!name || !startdate || !enddate) {
    throw new Error('Nombre, fecha de inicio y fecha de fin son obligatorios')
  }
  if (new Date(startdate) > new Date(enddate)) {
    throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin')
  }

  // Only one active season at a time
  if (active) {
    let query = supabase
      .from('season')
      .update({ active: false })
    query = id ? query.neq('id', id) : query.eq('active', true)
    const { error: deactivateErr } = await query
    if (deactivateErr) throw new Error(deactivateErr.message)
  }

  const payload = { name, startdate, enddate, active }

  if (isEdit) {
    const { error } = await supabase.from('season').update(payload).eq('id', requiredText(id, 'Temporada'))
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('season').insert(payload)
    if (error) throw new Error(error.message)
  }

  revalidatePath('/admin/seasons')
  revalidatePath('/admin/payments')
  revalidatePath('/admin/matches')
  revalidatePath('/admin/goals')
}

export async function toggleSeasonActive(id: string, currentStatus: boolean) {
  const supabase = await requireAdmin()
  requiredText(id, 'Temporada')
  if (typeof currentStatus !== 'boolean') throw new Error('Estado inválido')

  // Activating one deactivates the rest
  if (!currentStatus) {
    const { error: deactivateErr } = await supabase
      .from('season')
      .update({ active: false })
      .neq('id', id)
    if (deactivateErr) throw new Error(deactivateErr.message)
  }

  const { error } = await supabase
    .from('season')
    .update({ active: !currentStatus })
    .eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/seasons')
  revalidatePath('/admin/payments')
  revalidatePath('/admin/matches')
  revalidatePath('/admin/goals')
}

export async function deleteSeason(id: string) {
  const supabase = await requireAdmin()
  requiredText(id, 'Temporada')

  const [events, matches] = await Promise.all([
    supabase.from('Event').select('id', { count: 'exact', head: true }).eq('seasonid', id),
    supabase.from('Match').select('id', { count: 'exact', head: true }).eq('seasonid', id),
  ])

  if (events.error) throw new Error(events.error.message)
  if (matches.error) throw new Error(matches.error.message)
  const relatedEvents = events.count ?? 0
  const relatedMatches = matches.count ?? 0

  if (relatedEvents > 0 || relatedMatches > 0) {
    const parts: string[] = []
    if (relatedEvents > 0) parts.push(`${relatedEvents} cobro(s)`)
    if (relatedMatches > 0) parts.push(`${relatedMatches} partido(s)`)
    throw new Error(
      `No se puede eliminar: la temporada tiene ${parts.join(' y ')} relacionados. Desactívala en su lugar.`
    )
  }

  const { error } = await supabase.from('season').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/seasons')
  revalidatePath('/admin/payments')
  revalidatePath('/admin/matches')
  revalidatePath('/admin/goals')
}
