'use server'

import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type Season = {
  id: string
  name: string
  startdate: string
  enddate: string
  active: boolean
}

export async function getSeasons(): Promise<Season[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('season')
    .select('*')
    .order('startdate', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as Season[]
}

export async function getActiveSeason(): Promise<Season | null> {
  const supabase = await createClient()
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
  if (seasonId) return seasonId
  const active = await getActiveSeason()
  return active?.id ?? null
}

export async function saveSeason(formData: FormData) {
  const supabase = await createClient()
  const id = (formData.get('id') as string) || uuidv4()
  const name = (formData.get('name') as string)?.trim()
  const startdate = formData.get('startdate') as string
  const enddate = formData.get('enddate') as string
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
    const { error: deactivateErr } = await supabase
      .from('season')
      .update({ active: false })
      .neq('id', id)
    if (deactivateErr) throw new Error(deactivateErr.message)
  }

  const payload = { id, name, startdate, enddate, active }

  if (isEdit) {
    const { error } = await supabase.from('season').update(payload).eq('id', id)
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
  const supabase = await createClient()

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
  const supabase = await createClient()

  const [{ count: eventCount }, { count: matchCount }] = await Promise.all([
    supabase.from('Event').select('id', { count: 'exact', head: true }).eq('seasonid', id),
    supabase.from('Match').select('id', { count: 'exact', head: true }).eq('seasonid', id),
  ])

  const relatedEvents = eventCount ?? 0
  const relatedMatches = matchCount ?? 0

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
