'use server'

import { requireAdmin } from '@/lib/admin'
import { nonnegativeAmount } from '@/lib/validation'
import { revalidatePath } from 'next/cache'

export async function saveClubSettings(form: FormData) {
  const supabase = await requireAdmin()
  const text = (key: string, max: number) => {
    const value = form.get(key)
    if (typeof value !== 'string' || value.trim().length > max) throw new Error(`${key}: valor inválido`)
    return value.trim() || null
  }
  const phone = text('phone', 30)
  const clabe = text('clabe', 18)
  const account = text('account', 40)
  const bank = text('bank', 100)
  if (phone && !/^\+?[\d\s()-]{7,30}$/.test(phone)) throw new Error('Teléfono inválido')
  if (clabe && !/^\d{18}$/.test(clabe)) throw new Error('La CLABE debe tener 18 dígitos')
  const weekly_fee = nonnegativeAmount(form.get('weekly_fee'))
  const { error } = await supabase.from('club_settings').update({ phone, clabe, account, bank, weekly_fee }).eq('id', 1).select('id').single()
  if (error) throw new Error(error.message)
  revalidatePath('/admin/club')
  revalidatePath('/admin/payments')
}
