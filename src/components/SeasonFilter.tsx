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
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">
        {label}
      </label>
      <div className="relative flex-1 sm:flex-initial">
        <select
          value={selectedId ?? ''}
          onChange={(e) => handleChange(e.target.value)}
          disabled={isPending || seasons.length === 0}
          className={`appearance-none border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-semibold rounded-xl pl-3 pr-9 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition w-full sm:min-w-[180px] disabled:opacity-50 ${
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
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
          {isPending ? '…' : '▼'}
        </span>
      </div>
      {selected?.active && (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Activa
        </span>
      )}
    </div>
  )
}
