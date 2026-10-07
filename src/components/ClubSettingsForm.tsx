'use client'

import { useState, useTransition } from 'react'
import { saveClubSettings } from '@/app/actions/club'
import type { ClubSettings } from '@/lib/club'

export default function ClubSettingsForm({ settings }: { settings: ClubSettings }) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  function submit(form: FormData) {
    setMessage(''); setError('')
    startTransition(async () => {
      try { await saveClubSettings(form); setMessage('Datos del club guardados') }
      catch (error) { setError(error instanceof Error ? error.message : 'No se pudieron guardar los datos') }
    })
  }
  return <form action={submit} className="glass-card rounded-3xl p-6 space-y-5">
    <h2 className="text-xl font-semibold">Contacto y pagos</h2>
    <div className="grid gap-5 sm:grid-cols-2">
      {([{ name: 'phone', label: 'Teléfono', max: 30 }, { name: 'bank', label: 'Banco', max: 100 }, { name: 'clabe', label: 'CLABE (18 dígitos)', max: 18 }, { name: 'account', label: 'Cuenta', max: 40 }] as const).map(field => <div key={field.name}>
        <label htmlFor={`club-${field.name}`} className="field-label">{field.label}</label>
        <input id={`club-${field.name}`} name={field.name} type={field.name === 'phone' ? 'tel' : 'text'} inputMode={field.name === 'clabe' ? 'numeric' : undefined} maxLength={field.max} defaultValue={settings[field.name] || ''} disabled={pending} className="field-input" />
      </div>)}
      <div>
        <label htmlFor="club-fee" className="field-label">Cuota semanal (MXN)</label>
        <input id="club-fee" name="weekly_fee" type="number" min="0" step="0.01" required defaultValue={settings.weekly_fee} disabled={pending} className="field-input" />
      </div>
    </div>
    {error && <p role="alert" className="text-banner text-sm">{error}</p>}
    {message && <p role="status" className="text-sm text-foreground">{message}</p>}
    <button className="btn-primary" disabled={pending}>{pending ? 'Guardando…' : 'Guardar datos del club'}</button>
  </form>
}
