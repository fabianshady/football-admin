'use client'

import dynamic from 'next/dynamic'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { MatchEditData } from '@/lib/matchEdit'
import type { MatchEditCatalog } from './MatchEditModal'

const MatchEditModal = dynamic(() => import('./MatchEditModal'), {
  loading: () => <div role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground shadow-lg">Cargando editor…</div>,
})

const OpenContext = createContext<((matchId: string) => void) | null>(null)

type Props = {
  matches: MatchEditData[]
  catalog: MatchEditCatalog
  children: ReactNode
}

export default function MatchEditProvider({ matches, catalog, children }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const close = useCallback(() => setActiveId(null), [])
  const byId = useMemo(() => new Map(matches.map(m => [m.id, m])), [matches])
  const active = activeId ? byId.get(activeId) : undefined

  return (
    <OpenContext.Provider value={setActiveId}>
      {children}
      {active && <MatchEditModal key={active.id} match={active} catalog={catalog} onClose={close} />}
    </OpenContext.Provider>
  )
}

export function MatchEditTrigger({ matchId }: { matchId: string }) {
  const open = useContext(OpenContext)
  return (
    <button
      type="button"
      onClick={() => open?.(matchId)}
      aria-haspopup="dialog"
      aria-label="Editar detalles del partido"
      className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground transition-all hover:bg-gold/15 hover:text-gold"
      title="Editar detalles del partido"
    >
      ✎
    </button>
  )
}
