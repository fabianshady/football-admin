'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// 1. Obtener la data para la matriz
export async function getPaymentMatrix() {
  // Traemos eventos ordenados del más reciente al más viejo
  const events = await prisma.event.findMany({
    orderBy: { date: 'desc' },
    include: { payments: true } 
  })

  // Traemos jugadores con sus pagos
  const players = await prisma.player.findMany({
    orderBy: { name: 'asc' },
    include: { payments: true }
  })

  return { events, players }
}

// 2. Crear Evento y endeudar a la raza
export async function createEvent(formData: FormData) {
  const name = formData.get('name') as string
  const cost = parseFloat(formData.get('cost') as string)
  const date = new Date(formData.get('date') as string)

  // Primero creamos el evento
  const newEvent = await prisma.event.create({
    data: { name, cost, date }
  })

  // Buscamos a los jugadores activos para cobrarles
  const activePlayers = await prisma.player.findMany({
    where: { active: true },
    select: { id: true }
  })

  // Bulk insert de los pagos (deudas)
  if (activePlayers.length > 0) {
    await prisma.payment.createMany({
      data: activePlayers.map(p => ({
        playerId: p.id,
        eventId: newEvent.id,
        paid: false // Nacen debiendo
      }))
    })
  }

  revalidatePath('/admin/payments')
}

// 3. Pagar o des-pagar (Toggle)
export async function togglePayment(paymentId: string, currentStatus: boolean) {
  await prisma.payment.update({
    where: { id: paymentId },
    data: { paid: !currentStatus }
  })
  revalidatePath('/admin/payments')
}

// 4. Borrar evento (y sus deudas asociadas por cascada)
export async function deleteEvent(id: string) {
  // Con onDelete: Cascade, Prisma eliminará automáticamente los pagos relacionados
  await prisma.event.delete({ where: { id } })
  revalidatePath('/admin/payments')
}