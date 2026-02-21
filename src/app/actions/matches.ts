'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Traer partidos con sus convocados y goles para mostrar stats
export async function getMatches() {
  return await prisma.match.findMany({
    orderBy: { date: 'desc' },
    include: {
      squad: {
        include: {
          player: true
        }
      },
      goals: {
        include: {
          player: true
        }
      }
    }
  })
}

// Guardar Partido + Convocatoria
export async function saveMatch(formData: FormData) {
  const id = formData.get('id') as string
  
  // Datos básicos
  const data = {
    myTeam: formData.get('myTeam') as string,
    rivalTeam: formData.get('rivalTeam') as string,
    myPos: parseInt(formData.get('myPos') as string) || 0,
    rivalPos: parseInt(formData.get('rivalPos') as string) || 0,
    date: new Date(formData.get('date') as string),
    location: formData.get('location') as string,
    scoreHome: parseInt(formData.get('scoreHome') as string) || 0,
    scoreAway: parseInt(formData.get('scoreAway') as string) || 0,
  }

  // LA MAGIA: Obtener los IDs de los jugadores seleccionados
  // En el form, los checkboxes tendrán name="players"
  const selectedPlayerIds = formData.getAll('players') as string[]

  if (id) {
    // UPDATE: Usamos una transacción para limpiar y rellenar la convocatoria
    await prisma.$transaction([
      // 1. Borrar convocatoria vieja
      prisma.matchSquad.deleteMany({ where: { matchId: id } }),
      // 2. Actualizar datos del partido
      prisma.match.update({
        where: { id },
        data: {
          ...data,
          // 3. Crear nueva convocatoria
          squad: {
            create: selectedPlayerIds.map(pid => ({ playerId: pid }))
          }
        }
      })
    ])
  } else {
    // CREATE: Todo de un jalón
    await prisma.match.create({
      data: {
        ...data,
        squad: {
          create: selectedPlayerIds.map(pid => ({ playerId: pid }))
        }
      }
    })
  }

  revalidatePath('/admin/matches')
  // Opcional: Si quieres que redirija o cierre un modal, manéjalo aquí
}

// Alias para compatibilidad con MatchForm
export async function createMatch(formData: FormData) {
  const myTeam = formData.get('myTeam') as string
  const rivalTeam = formData.get('rivalTeam') as string
  const date = new Date(formData.get('date') as string)
  const location = formData.get('location') as string
  const myPos = parseInt(formData.get('myPos') as string) || 1
  const rivalPos = parseInt(formData.get('rivalPos') as string) || 1
  const scoreHome = parseInt(formData.get('scoreHome') as string) || 0
  const scoreAway = parseInt(formData.get('scoreAway') as string) || 0
  const squadIds = formData.getAll('squad') as string[]

  await prisma.match.create({
    data: {
      myTeam,
      rivalTeam,
      date,
      location,
      myPos,
      rivalPos,
      scoreHome,
      scoreAway,
      squad: {
        create: squadIds.map(playerId => ({
          playerId
        }))
      }
    }
  })

  revalidatePath('/admin/matches')
}

export async function deleteMatch(id: string) {
  // Con onDelete: Cascade, Prisma eliminará automáticamente goles y convocados
  await prisma.match.delete({ where: { id } })
  revalidatePath('/admin/matches')
}

// Actualizar marcador del partido
export async function updateMatchScore(matchId: string, scoreHome: number, scoreAway: number) {
  await prisma.match.update({
    where: { id: matchId },
    data: { scoreHome, scoreAway }
  })
  revalidatePath('/admin/matches')
  revalidatePath('/admin/goals')
}