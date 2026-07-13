'use server'

import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Traer partidos con convocados y goles
export async function getMatches(seasonId?: string | null) {
  const supabase = await createClient()
  let query = supabase
    .from('Match')
    .select('*, squad:MatchSquad(*, player:Player(*)), goals:Goal(*, player:Player(*)), season:season(*)')
    .order('date', { ascending: false })

  if (seasonId) {
    query = query.eq('seasonid', seasonId)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

// Guardar Partido + Convocatoria
export async function saveMatch(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const matchData = {
    myTeam: formData.get('myTeam') as string,
    rivalTeam: formData.get('rivalTeam') as string,
    myPos: parseInt(formData.get('myPos') as string) || 0,
    rivalPos: parseInt(formData.get('rivalPos') as string) || 0,
    date: formData.get('date') as string,
    location: formData.get('location') as string,
    scoreHome: parseInt(formData.get('scoreHome') as string) || 0,
    scoreAway: parseInt(formData.get('scoreAway') as string) || 0,
    kit: parseInt(formData.get('kit') as string) || 1,
    seasonid: (formData.get('seasonid') as string) || null,
  }

  const selectedPlayerIds = formData.getAll('players') as string[]

  if (id) {
    const { error: updateErr } = await supabase
      .from('Match')
      .update(matchData)
      .eq('id', id)
    if (updateErr) throw new Error(updateErr.message)

    await supabase.from('MatchSquad').delete().eq('matchId', id)

    if (selectedPlayerIds.length > 0) {
      const { error: squadErr } = await supabase
        .from('MatchSquad')
        .insert(selectedPlayerIds.map(playerId => ({ id: uuidv4(), matchId: id, playerId })))
      if (squadErr) throw new Error(squadErr.message)
    }
  } else {
    const { data: match, error: insertErr } = await supabase
      .from('Match')
      .insert(matchData)
      .select()
      .single()
    if (insertErr) throw new Error(insertErr.message)

    if (selectedPlayerIds.length > 0) {
      const { error: squadErr } = await supabase
        .from('MatchSquad')
        .insert(selectedPlayerIds.map(playerId => ({ id: uuidv4(), matchId: match.id, playerId })))
      if (squadErr) throw new Error(squadErr.message)
    }
  }

  revalidatePath('/admin/matches')
}

// Crear partido (alias para MatchForm)
export async function createMatch(formData: FormData) {
  const supabase = await createClient()
  const squadIds = formData.getAll('squad') as string[]
  const matchId = uuidv4()
  const seasonid = (formData.get('seasonid') as string) || null

  if (!seasonid) throw new Error('Debes seleccionar una temporada')

  const matchData = {
    id: matchId,
    myTeam: formData.get('myTeam') as string,
    rivalTeam: formData.get('rivalTeam') as string,
    date: formData.get('date') as string,
    location: formData.get('location') as string,
    myPos: parseInt(formData.get('myPos') as string) || 1,
    rivalPos: parseInt(formData.get('rivalPos') as string) || 1,
    scoreHome: parseInt(formData.get('scoreHome') as string) || 0,
    scoreAway: parseInt(formData.get('scoreAway') as string) || 0,
    kit: parseInt(formData.get('kit') as string) || 1,
    seasonid,
  }

  const { data: match, error } = await supabase
    .from('Match')
    .insert(matchData)
    .select()
    .single()
  if (error) throw new Error(error.message)

  if (squadIds.length > 0) {
    const { error: squadErr } = await supabase
      .from('MatchSquad')
      .insert(squadIds.map(playerId => ({ id: uuidv4(), matchId: match.id, playerId })))
    if (squadErr) throw new Error(squadErr.message)
  }

  revalidatePath('/admin/matches')
  revalidatePath('/admin/goals')
}

export async function updateMatch(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const squadIds = formData.getAll('squad') as string[]
  const seasonid = (formData.get('seasonid') as string) || null

  const matchData = {
    myTeam: formData.get('myTeam') as string,
    rivalTeam: formData.get('rivalTeam') as string,
    date: formData.get('date') as string,
    location: formData.get('location') as string,
    myPos: parseInt(formData.get('myPos') as string) || 1,
    rivalPos: parseInt(formData.get('rivalPos') as string) || 1,
    kit: parseInt(formData.get('kit') as string) || 1,
    seasonid,
  }

  const { error } = await supabase
    .from('Match')
    .update(matchData)
    .eq('id', id)
  if (error) throw new Error(error.message)

  // Update squad
  await supabase.from('MatchSquad').delete().eq('matchId', id)

  if (squadIds.length > 0) {
    const { error: squadErr } = await supabase
      .from('MatchSquad')
      .insert(squadIds.map(playerId => ({ id: uuidv4(), matchId: id, playerId })))
    if (squadErr) throw new Error(squadErr.message)
  }

  revalidatePath('/admin/matches')
  revalidatePath('/admin/goals')
}

export async function deleteMatch(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('Match').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/matches')
  revalidatePath('/admin/goals')
}

export async function updateMatchScore(matchId: string, scoreHome: number, scoreAway: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('Match')
    .update({ scoreHome, scoreAway })
    .eq('id', matchId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/matches')
  revalidatePath('/admin/goals')
}
