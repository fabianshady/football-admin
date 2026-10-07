'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { togglePayment } from '@/app/actions/payments'

export default function PaymentToggle({ id, paid }: { id: string; paid: boolean }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const router = useRouter()
  return <>
    <button type="button" disabled={pending} aria-pressed={paid} onClick={() => {
      setError('')
      startTransition(async () => {
        try { await togglePayment(id, paid) }
        catch (error) { setError(error instanceof Error ? error.message : 'No se pudo actualizar el pago') }
        finally { router.refresh() }
      })
    }} className={`w-full rounded-full px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${paid ? 'bg-secondary text-secondary-foreground' : 'bg-banner/10 text-banner'}`}>
      {pending ? 'Guardando…' : paid ? '✓ Pagó' : 'Debe'}
    </button>
    {error && <p role="alert" className="mt-2 max-w-48 text-xs text-banner">{error}</p>}
  </>
}
