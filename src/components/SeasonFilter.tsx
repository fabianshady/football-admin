'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import type { Season } from '@/app/actions/seasons'

type Props = {
  seasons: Season[]
  selectedId: string | null
  label?: string
}

export default function SeasonFilter({ seasons, selectedId, label = 'Temporada' }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('season', value)
    } else {
      params.delete('season')
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const selected = seasons.find(s => s.id === selectedId)

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <label className="whitespace-nowrap text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <div className="relative flex-1 sm:flex-initial">
        <select
          value={selectedId ?? ''}
          onChange={(e) => handleChange(e.target.value)}
          disabled={isPending || seasons.length === 0}
          className={`field-input appearance-none pr-9 font-semibold sm:min-w-[180px] ${
            isPending ? 'opacity-70' : ''
          }`}
        >
          {seasons.length === 0 && <option value="">Sin temporadas</option>}
          {seasons.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}{s.active ? ' ●' : ''}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {isPending ? '…' : '▼'}
        </span>
      </div>
      {selected?.active && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-banner/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-banner ring-1 ring-banner/20">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-banner" />
          Activa
        </span>
      )}
    </div>
  )
}
