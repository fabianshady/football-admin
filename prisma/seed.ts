import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Sembrando la base de datos... Aguanta vara.')

  // 1. Limpieza general (Borramos todo para no duplicar si lo corres dos veces)
  // El orden importa por las llaves foráneas
  await prisma.goal.deleteMany()
  await prisma.matchSquad.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.match.deleteMany()
  await prisma.event.deleteMany()
  await prisma.player.deleteMany()

  console.log('🧹 Base de datos limpiecita.')

  // 2. Creando a los Galácticos (Jugadores)
  const player1 = await prisma.player.create({
    data: { name: 'Juancho', dorsal: 1, positions: ['Portero'], active: true }
  })

  const player2 = await prisma.player.create({
      data: { name: 'Carmona', dorsal: 3, positions: ['Defensa'], active: false }
  })

  const player3 = await prisma.player.create({
      data: { name: 'Navarro', dorsal: 5, positions: ['Mediocentro'], active: true }
  })

  const player4 = await prisma.player.create({
      data: { name: 'Niebla', dorsal: 6, positions: ['Delantero'], active: false }
  })

  const player5 = await prisma.player.create({
      data: { name: 'Ponky', dorsal: 7, positions: ['Defensa'], active: true }
  })

  const player6 = await prisma.player.create({
      data: { name: 'Ledezma', dorsal: 8, positions: ['Mediocentro'], active: true }
  })

  const player7 = await prisma.player.create({
      data: { name: 'Nelson', dorsal: 9, positions: ['Delantero'], active: true }
  })

  const player8 = await prisma.player.create({
      data: { name: 'Salazar', dorsal: 10, positions: ['Mediocentro'], active: true }
  })

  const player9 = await prisma.player.create({
      data: { name: 'Luis García', dorsal: 11, positions: ['Lateral'], active: true }
  })

  const player10 = await prisma.player.create({
      data: { name: 'Rodri', dorsal: 17, positions: ['Mediocentro'], active: true }
  })

  const player11 = await prisma.player.create({
      data: { name: 'Gutierrez', dorsal: 18, positions: ['Delantero'], active: true }
  })

  const player12 = await prisma.player.create({
      data: { name: 'Yahir', dorsal: 19, positions: ['Lateral'], active: false }
  })

  const player13 = await prisma.player.create({
      data: { name: 'Torres', dorsal: 20, positions: ['Defensa'], active: true }
  })

  const player14 = await prisma.player.create({
      data: { name: 'Lira', dorsal: 21, positions: ['Lateral'], active: true }
  })

  const player15 = await prisma.player.create({
      data: { name: 'Corneas', dorsal: 22, positions: ['Defensa'], active: true }
  })

  const player16 = await prisma.player.create({
      data: { name: 'Jordo', dorsal: 23, positions: ['Portero'], active: true }
  })

  const player17 = await prisma.player.create({
      data: { name: 'Melchor', dorsal: 26, positions: ['Delantero'], active: true }
  })

  const player18 = await prisma.player.create({
      data: { name: 'J. Gonzalez', dorsal: 27, positions: ['Lateral'], active: true }
  })

  const player19 = await prisma.player.create({
      data: { name: 'Alvarez', dorsal: 29, positions: ['Defensa'], active: true }
  })

  const player20 = await prisma.player.create({
      data: { name: 'Mendoza', dorsal: 47, positions: ['Lateral'], active: true }
  })

  const player21 = await prisma.player.create({
    data: { name: 'C. Bañuelos', dorsal: 14, positions: ['Defensa'], active: true }
  })
  
  // Jugador banca o inactivo
  await prisma.player.create({
    data: { name: 'Darlene', dorsal: 0, positions: ['Aguadora'], active: false }
  })

  console.log('⚽ Jugadores fichados.')

  // 3. Creando Eventos de Cobro (La dolorosa)
  const event1 = await prisma.event.create({
    data: { name: 'Entrenamiento', cost: 180, date: new Date('2025-12-21') }
  })
  const event2 = await prisma.event.create({
    data: { name: 'Inscripcion', cost: 120, date: new Date('2026-01-06') }
  })
  const event3 = await prisma.event.create({
    data: { name: 'Jornada 1', cost: 120, date: new Date('2026-01-13') }
  })
  const event4 = await prisma.event.create({
    data: { name: 'Jornada 2', cost: 120, date: new Date('2026-01-20') }
  })
  const event5 = await prisma.event.create({
    data: { name: 'Jornada 3', cost: 120, date: new Date('2026-01-27') }
  })

  // 4. Generando Deudas y Pagos
  const players = [player1, player2, player3, player4, player5, player6, player7, player8, player9, player10, player11, player12, player13, player14, player15, player16, player17, player18, player19, player20, player21]
  
  // Evento 1: Casi todos pagaron
  for (const p of players) {
    await prisma.payment.create({
      data: {
        playerId: p.id,
        eventId: event1.id,
        paid: p.id !== player11.id
      }
    })
  }

  // Evento 2: Algunos no han pagado la inscripción
  for (const p of players) {
    await prisma.payment.create({
      data: {
        playerId: p.id,
        eventId: event2.id,
        paid: p.id !== player8.id && p.id !== player11.id
      }
    })
  }

  // Evento 3: Algunos no han pagado la primera jornada
  for (const p of players) {
    await prisma.payment.create({
      data: {
        playerId: p.id,
        eventId: event3.id,
        paid: p.id !== player19.id && p.id !== player11.id && p.id !== player1.id && p.id !== player7.id && p.id !== player17.id
      }
    })
  }

  // Evento 4: Algunos no han pagado la segunda jornada
  for (const p of players) {
    await prisma.payment.create({
      data: {
        playerId: p.id,
        eventId: event4.id,
        paid: p.id !== player19.id && p.id !== player11.id && p.id !== player1.id && p.id !== player7.id && p.id !== player17.id && p.id !== player21.id && p.id !== player13.id
      }
    })
  }

  console.log('💸 Deudas generadas (El Jordi ya debe lana).')

  // 5. Partidos Históricos
  
  // Partido 1: Ganamos (Ya se jugó)
  const match1 = await prisma.match.create({
    data: {
      myTeam: 'Fsociety FC',
      rivalTeam: 'Evil Corp',
      myPos: 1,
      rivalPos: 2,
      date: new Date('2026-01-10T20:00:00Z'),
      location: 'Estadio Olímpico (Cancha 7)',
      scoreHome: 3,
      scoreAway: 1,
      squad: {
        create: [
          { playerId: player1.id },
          { playerId: player2.id },
          { playerId: player3.id },
          { playerId: player4.id },
          { playerId: player5.id }
        ]
      }
    }
  })

  // Goles del Partido 1
  await prisma.goal.createMany({
    data: [
      { matchId: match1.id, playerId: player1.id }, // Gol de Ye
      { matchId: match1.id, playerId: player1.id }, // Doblete de Ye
      { matchId: match1.id, playerId: player5.id }, // Gol de Rocky
    ]
  })

  // Partido 2: Perdimos (Ya se jugó)
  const match2 = await prisma.match.create({
    data: {
      myTeam: 'Fsociety FC',
      rivalTeam: 'Ecatepec United',
      myPos: 1,
      rivalPos: 5,
      date: new Date('2026-01-17T20:00:00Z'),
      location: 'Deportivo Pelusa',
      scoreHome: 0,
      scoreAway: 2,
      squad: {
        create: [
          { playerId: player1.id },
          { playerId: player2.id }, // Elliot portero coladera
          { playerId: player6.id },
          { playerId: player3.id }
        ]
      }
    }
  })

  // Partido 3: Futuro (La próxima semana)
  await prisma.match.create({
    data: {
      myTeam: 'Fsociety FC',
      rivalTeam: 'Los Hijos de Dios',
      myPos: 2,
      rivalPos: 1,
      date: new Date('2026-01-24T20:00:00Z'),
      location: 'Cancha Rápida 1',
      scoreHome: 0,
      scoreAway: 0
    }
  })

  console.log('🏟️ Partidos y Goles registrados.')
  console.log('🚀 ¡Todo listo, carnal! Ya puedes levantar el server.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })