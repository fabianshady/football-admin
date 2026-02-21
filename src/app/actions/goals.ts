'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// 1. Obtener Top Goleadores (Para el Leaderboard)
export async function getTopScorers() {
  const players = await prisma.player.findMany({
    where: { active: true },
    include: {
      goals: true,
      matchSquads: true, // Incluir partidos jugados
    }
  })

  const scorers = players
    .map(p => ({
      name: p.name,
      dorsal: p.dorsal,
      goals: p.goals.length,
      matchesPlayed: p.matchSquads.length, // Agregar partidos jugados
    }))
    .filter(p => p.goals > 0) // Solo mostrar jugadores con goles
    .sort((a, b) => b.goals - a.goals)

  return scorers
}

// 2. Obtener Partidos con sus goles desglosados
export async function getMatchesWithGoals() {
  return await prisma.match.findMany({
    orderBy: { date: 'desc' },
    include: {
      squad: {
        include: {
            player: true 
        }
      },
      goals: true // Traemos todos los goles del partido
    }
  })
}

// 3. ¡GOL! (Agregar)
export async function addGoal(matchId: string, playerId: string) {
  await prisma.goal.create({
    data: { matchId, playerId }
  })
  revalidatePath('/admin/goals')
}

// 4. VAR (Quitar gol)
export async function removeGoal(matchId: string, playerId: string) {
  // Buscamos UN gol de este vato en este partido (el primero que salga)
  const goal = await prisma.goal.findFirst({
    where: { matchId, playerId }
  })

  if (goal) {
    await prisma.goal.delete({ where: { id: goal.id } })
    revalidatePath('/admin/goals')
  }
}