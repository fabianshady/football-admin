'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Obtener todos los cracks
export async function getPlayers() {
  return await prisma.player.findMany({
    orderBy: { dorsal: 'asc' } // Ordenaditos por número
  })
}

// Crear o Editar Jugador (Upsert logic simplificada)
export async function savePlayer(formData: FormData) {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const dorsal = parseInt(formData.get('dorsal') as string)
  
  // Ojo aquí: Las posiciones vienen separadas por comas en el form
  // Ej: "Defensa,Medio" -> ["Defensa", "Medio"]
  const positionsRaw = formData.get('positions') as string
  const positions = positionsRaw.split(',').map(p => p.trim()).filter(p => p !== '')

  const data = { name, dorsal, positions, active: true }

  if (id) {
    // Editar existente
    await prisma.player.update({
      where: { id },
      data
    })
  } else {
    // Crear nuevo fichaje
    await prisma.player.create({ data })
  }

  revalidatePath('/admin/players') // Refresca la pantalla sin recargar
}

// Cambiar estado (Activo/Inactivo)
export async function togglePlayerStatus(id: string, currentStatus: boolean) {
  await prisma.player.update({
    where: { id },
    data: { active: !currentStatus }
  })
  revalidatePath('/admin/players')
}

// Eliminar definitivo (por si se equivocaron de nombre alv)
export async function deletePlayer(id: string) {
  // Con onDelete: Cascade, Prisma eliminará automáticamente los registros relacionados
  await prisma.player.delete({ where: { id } })
  revalidatePath('/admin/players')
}