'use server'

import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

// Obtener todos los cracks
export async function getPlayers() {
  const { data, error } = await supabase
    .from('Player')
    .select('*')
    .order('dorsal', { ascending: true })
  if (error) throw new Error(error.message)
  return data
}

// Obtener solo los activos (para convocatorias)
export async function getActivePlayers() {
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
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const dorsal = parseInt(formData.get('dorsal') as string)
  const positionsRaw = formData.get('positions') as string
  const positions = positionsRaw.split(',').map(p => p.trim()).filter(p => p !== '')

  const data = { name, dorsal, positions, active: true }

  if (id) {
    const { error } = await supabase.from('Player').update(data).eq('id', id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('Player').insert({ id: uuidv4(), ...data })
    if (error) throw new Error(error.message)
  }

  revalidatePath('/admin/players')
}

// Cambiar estado Activo/Inactivo
export async function togglePlayerStatus(id: string, currentStatus: boolean) {
  const { error } = await supabase
    .from('Player')
    .update({ active: !currentStatus })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/players')
}

// Eliminar jugador (las relaciones con ON DELETE CASCADE se eliminan automáticamente)
export async function deletePlayer(id: string) {
  const { error } = await supabase.from('Player').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/players')
}
