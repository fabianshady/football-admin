'use server'

import { requireAdmin } from '@/lib/admin'
import { nonnegativeAmount, requiredText, utcInstant } from '@/lib/validation'
import { revalidatePath } from 'next/cache'

// 2. Crear Evento y endeudar a todos los activos
export async function createEvent(formData: FormData) {
  const supabase = await requireAdmin()
  const { error } = await supabase.rpc('create_event_with_payments', {
    p_name: requiredText(formData.get('name'), 'Nombre'),
    p_cost: nonnegativeAmount(formData.get('cost')),
    p_date: utcInstant(formData.get('date')),
    p_season_id: requiredText(formData.get('seasonid'), 'Temporada'),
  })
  if (error) throw new Error(error.message)

  revalidatePath('/admin/payments')
}

// 3. Toggle de pago
export async function togglePayment(paymentId: string, currentStatus: boolean) {
  const supabase = await requireAdmin()
  if (typeof currentStatus !== 'boolean') throw new Error('Estado de pago inválido')
  const { data, error } = await supabase
    .from('Payment')
    .update({ paid: !currentStatus })
    .eq('id', requiredText(paymentId, 'Pago'))
    .eq('paid', currentStatus)
    .select('id')
  if (error) throw new Error(error.message)
  if (!data?.length) {
    revalidatePath('/admin/payments')
    throw new Error('El pago cambió o ya no existe. Actualiza la página antes de volver a intentarlo.')
  }
  revalidatePath('/admin/payments')
}

// 4. Borrar evento (pagos en cascada por FK en DB)
export async function deleteEvent(id: string) {
  const supabase = await requireAdmin()
  const { error } = await supabase.from('Event').delete().eq('id', requiredText(id, 'Cobro'))
  if (error) throw new Error(error.message)
  revalidatePath('/admin/payments')
}
