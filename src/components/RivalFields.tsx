'use client'

import { useId, useState } from 'react'
import type { Tables } from '@/lib/database.types'
import { normalizeRivalName } from '@/lib/phase2'

export default function RivalFields({ rivals, rivalId, pending }: { rivals: Tables<'rival'>[]; rivalId?: string; pending: boolean }) {
  const prefix = useId()
  const [mode, setMode] = useState('existing')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(rivalId ?? '')
  const [name, setName] = useState('')
  const filtered = rivals.filter(rival => rival.id === selected || normalizeRivalName(rival.name).includes(normalizeRivalName(search)))
  const sameName = rivals.find(rival => rival.normalized_name === normalizeRivalName(name))
  return <div className="space-y-2 sm:col-span-2">
    <label htmlFor={`${prefix}-mode`} className="field-label">Rival</label>
    <select id={`${prefix}-mode`} value={mode} onChange={e => setMode(e.target.value)} disabled={pending} className="field-input"><option value="existing">Seleccionar del catálogo</option><option value="new">Crear nuevo rival por nombre</option></select>
    {mode === 'existing' ? <>
      <label htmlFor={`${prefix}-search`} className="field-label">Buscar en el catálogo</label><input id={`${prefix}-search`} type="search" value={search} onChange={e => setSearch(e.target.value)} disabled={pending} className="field-input" />
      <label htmlFor={`${prefix}-rival`} className="field-label">Rival existente</label><select id={`${prefix}-rival`} name="rivalId" value={selected} onChange={e => setSelected(e.target.value)} required disabled={pending} className="field-input"><option value="">Selecciona un rival</option>{filtered.map(rival => <option key={rival.id} value={rival.id}>{rival.name}</option>)}</select>
    </> : <><label htmlFor={`${prefix}-new`} className="field-label">Nombre explícito del nuevo rival</label><input id={`${prefix}-new`} name="rivalTeam" value={name} onChange={e => setName(e.target.value)} required maxLength={200} disabled={pending} className="field-input" />{sameName && <p className="text-xs text-muted-foreground">Ya existe {sameName.name}; se utilizará ese registro.</p>}<p className="text-xs text-muted-foreground">Solo se normalizan espacios y mayúsculas. FC, acentos y puntuación identifican rivales distintos.</p></>}
  </div>
}
