'use server'

import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Obtener todos los cracks
export async function getPlayers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('Player')
    .select('*')
    .order('dorsal', { ascending: true })
  if (error) throw new Error(error.message)
  return data
}

// Obtener solo los activos (para convocatorias)
export async function getActivePlayers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('Player')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true })
  if (error) throw new Error(error.message)
  return data
}

// Crear o Editar Jugador
export async function savePlayer(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const dorsal = parseInt(formData.get('dorsal') as string)
  const positionsRaw = formData.get('positions') as string
  const positions = positionsRaw.split(',').map(p => p.trim()).filter(p => p !== '')

  if (!name?.trim()) throw new Error('El nombre es obligatorio')
  if (isNaN(dorsal)) throw new Error('El dorsal debe ser un número')
  if (positions.length === 0) throw new Error('Al menos una posición es obligatoria')

  const data = { name: name.trim(), dorsal, positions, active: true }

  if (id) {
    // Preserve active status on edit
    const { data: existing } = await supabase.from('Player').select('active').eq('id', id).maybeSingle()
    const { error } = await supabase
      .from('Player')
      .update({ ...data, active: existing?.active ?? true })
      .eq('id', id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('Player').insert({ id: uuidv4(), ...data })
    if (error) throw new Error(error.message)
  }

  revalidatePath('/admin/players')
}

// Inline update: name, position (positions), number (dorsal)
export async function updatePlayerInline(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const name = (formData.get('name') as string)?.trim()
  const dorsal = parseInt(formData.get('dorsal') as string)
  const positionsRaw = formData.get('positions') as string
  const positions = positionsRaw.split(',').map(p => p.trim()).filter(p => p !== '')

  if (!id) throw new Error('ID de jugador requerido')
  if (!name) throw new Error('El nombre es obligatorio')
  if (isNaN(dorsal)) throw new Error('El dorsal debe ser un número')
  if (positions.length === 0) throw new Error('Al menos una posición es obligatoria')

  const { error } = await supabase
    .from('Player')
    .update({ name, dorsal, positions })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/players')
}

// Cambiar estado Activo/Inactivo
export async function togglePlayerStatus(id: string, currentStatus: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('Player')
    .update({ active: !currentStatus })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/players')
}

// Eliminar jugador (las relaciones con ON DELETE CASCADE se eliminan automáticamente)
export async function deletePlayer(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('Player').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/players')
}
