'use server'

import { cache } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// 1. Obtener la data para la matriz, cacheamos para deduplicar peticiones en SSR/RSC
export const getPaymentMatrix = cache(async () => {
  const supabase = await createClient()

  // Ejecutamos en paralelo para ser más rápidos
  const [eventsResult, playersResult] = await Promise.all([
    supabase.from('Event').select('*, payments:Payment(*)').order('date', { ascending: false }),
    supabase.from('Player').select('*, payments:Payment(*)').order('name', { ascending: true })
  ])

  if (eventsResult.error) throw new Error(eventsResult.error.message)
  if (playersResult.error) throw new Error(playersResult.error.message)

  return { 
    events: eventsResult.data ?? [], 
    players: playersResult.data ?? [] 
  }
})

// 2. Crear Evento y endeudar a todos los activos
export async function createEvent(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const cost = parseFloat(formData.get('cost') as string)
  const date = formData.get('date') as string
  const id = uuidv4()

  const { data: newEvent, error: eventErr } = await supabase
    .from('Event')
    .insert({ id, name, cost, date })
    .select()
    .single()
  if (eventErr) throw new Error(eventErr.message)

  const { data: activePlayers, error: playersErr } = await supabase
    .from('Player')
    .select('id')
    .eq('active', true)
  if (playersErr) throw new Error(playersErr.message)

  if (activePlayers && activePlayers.length > 0) {
    const { error: paymentsErr } = await supabase
      .from('Payment')
      .insert(activePlayers.map(p => ({
        id: uuidv4(),
        playerId: p.id,
        eventId: newEvent.id,
        paid: false,
      })))
    if (paymentsErr) throw new Error(paymentsErr.message)
  }

  revalidatePath('/admin/payments')
}

// 3. Toggle de pago
export async function togglePayment(paymentId: string, currentStatus: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('Payment')
    .update({ paid: !currentStatus })
    .eq('id', paymentId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/payments')
}

// 4. Borrar evento (pagos en cascada por FK en DB)
export async function deleteEvent(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('Event').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/payments')
}
