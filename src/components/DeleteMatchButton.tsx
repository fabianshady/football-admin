'use client'
import { useState, useTransition } from 'react'
import { deleteMatch } from '@/app/actions/matches'
import { errorMessage } from '@/lib/phase2'
import { unwrapResult } from '@/lib/actionResult'

export default function DeleteMatchButton({ id, rival }: { id: string; rival: string }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  return <div><button disabled={pending} aria-label={`Eliminar partido contra ${rival}`} className="btn-ghost min-h-11 min-w-11" onClick={() => { setError(''); startTransition(async () => { try { unwrapResult(await deleteMatch(id)) } catch (error) { setError(errorMessage(error)) } }) }}>✕</button>{error && <p role="alert" className="text-xs text-banner">{error}</p>}</div>
}
