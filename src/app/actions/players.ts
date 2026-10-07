'use server'

import { requireAdmin } from '@/lib/admin'
import { integer, requiredText } from '@/lib/validation'
import { revalidatePath } from 'next/cache'

// Obtener todos los cracks
export async function getPlayers() {
  const supabase = await requireAdmin()
  const { data, error } = await supabase
    .from('Player')
    .select('*')
    .order('dorsal', { ascending: true })
  if (error) throw new Error(error.message)
  return data.map(player => ({ ...player, positions: player.positions ?? [] }))
}

// Obtener solo los activos (para convocatorias)
export async function getActivePlayers() {
  const supabase = await requireAdmin()
  const { data, error } = await supabase
    .from('Player')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true })
  if (error) throw new Error(error.message)
  return data.map(player => ({ ...player, positions: player.positions ?? [] }))
}

// Crear o Editar Jugador
export async function savePlayer(formData: FormData) {
  const supabase = await requireAdmin()
  const id = formData.get('id') as string
  const name = requiredText(formData.get('name'), 'Nombre')
  const dorsal = integer(formData.get('dorsal'), 'Dorsal')
  const positionsRaw = requiredText(formData.get('positions'), 'Posiciones')
  const positions = positionsRaw.split(',').map(p => p.trim()).filter(p => p !== '')

  if (!name?.trim()) throw new Error('El nombre es obligatorio')
  if (isNaN(dorsal)) throw new Error('El dorsal debe ser un número')
  if (positions.length === 0) throw new Error('Al menos una posición es obligatoria')

  const data = { name: name.trim(), dorsal, positions, active: true }

  if (id) {
    const { error } = await supabase
      .from('Player')
      .update({ name: data.name, dorsal, positions })
      .eq('id', id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('Player').insert(data)
    if (error) throw new Error(error.message)
  }

  revalidatePath('/admin/players')
}

// Inline update: name, position (positions), number (dorsal)
export async function updatePlayerInline(formData: FormData) {
  const supabase = await requireAdmin()
  const id = formData.get('id') as string
  const name = requiredText(formData.get('name'), 'Nombre')
  const dorsal = integer(formData.get('dorsal'), 'Dorsal')
  const positionsRaw = requiredText(formData.get('positions'), 'Posiciones')
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
  const supabase = await requireAdmin()
  if (typeof currentStatus !== 'boolean') throw new Error('Estado inválido')
  const { data, error } = await supabase
    .from('Player')
    .update({ active: !currentStatus })
    .eq('id', requiredText(id, 'Jugador'))
    .eq('active', currentStatus).select('id')
  if (error) throw new Error(error.message)
  if (!data?.length) throw new Error('El jugador cambió. Actualiza la página.')
  revalidatePath('/admin/players')
}

// Eliminar jugador (las relaciones con ON DELETE CASCADE se eliminan automáticamente)
export async function deletePlayer(id: string) {
  const supabase = await requireAdmin()
  const { error } = await supabase.from('Player').delete().eq('id', requiredText(id, 'Jugador'))
  if (error) throw new Error(error.message)
  revalidatePath('/admin/players')
}
