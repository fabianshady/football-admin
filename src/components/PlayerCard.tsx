'use client'

import { useState, useTransition } from 'react'
import { updatePlayerInline, togglePlayerStatus, deletePlayer } from '@/app/actions/players'

const POSITION_COLORS: Record<string, string> = {
  'Portero':        'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 ring-1 ring-yellow-300/50',
  'Defensa':        'bg-blue-100   dark:bg-blue-900/40   text-blue-800   dark:text-blue-300   ring-1 ring-blue-300/50',
  'Mediocentro':    'bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-300 ring-1 ring-violet-300/50',
  'Lateral':        'bg-cyan-100   dark:bg-cyan-900/40   text-cyan-800   dark:text-cyan-300   ring-1 ring-cyan-300/50',
  'Delantero':      'bg-rose-100   dark:bg-rose-900/40   text-rose-800   dark:text-rose-300   ring-1 ring-rose-300/50',
  'Cuerpo Técnico': 'bg-slate-100  dark:bg-slate-700     text-slate-700  dark:text-slate-300  ring-1 ring-slate-300/50',
}

function getPositionColor(pos: string) {
  return POSITION_COLORS[pos] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 ring-1 ring-gray-300/50'
}

type Player = {
  id: string
  name: string
  dorsal: number
  positions: string[]
  active: boolean
}

export default function PlayerCard({ player }: { player: Player }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(player.name)
  const [dorsal, setDorsal] = useState(String(player.dorsal))
  const [positions, setPositions] = useState(player.positions.join(', '))
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const reset = () => {
    setName(player.name)
    setDorsal(String(player.dorsal))
    setPositions(player.positions.join(', '))
    setError(null)
    setEditing(false)
  }

  const handleSave = () => {
    setError(null)
    const formData = new FormData()
    formData.set('id', player.id)
    formData.set('name', name)
    formData.set('dorsal', dorsal)
    formData.set('positions', positions)

    startTransition(async () => {
      try {
        await updatePlayerInline(formData)
        setEditing(false)
      } catch (e: any) {
        setError(e?.message || 'Error al guardar')
      }
    })
  }

  return (
    <div
      className={`relative rounded-2xl border transition-all duration-200 overflow-hidden ${
        player.active
          ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5'
          : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60'
      }`}
    >
      <div className={`h-1 w-full ${player.active ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-slate-300 dark:bg-slate-600'}`} />

      <div className="p-4 sm:p-5">
        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Nombre</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={isPending}
                autoFocus
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Dorsal</label>
                <input
                  type="number"
                  value={dorsal}
                  onChange={(e) => setDorsal(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={isPending}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Posiciones</label>
                <input
                  value={positions}
                  onChange={(e) => setPositions(e.target.value)}
                  placeholder="Delantero, Extremo"
                  className="w-full border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={isPending}
                />
              </div>
            </div>
            {error && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isPending}
                className="flex-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg disabled:opacity-50 transition"
              >
                {isPending ? 'Guardando…' : 'Guardar'}
              </button>
              <button
                onClick={reset}
                disabled={isPending}
                className="text-xs font-semibold px-3 py-2 rounded-lg text-slate-500 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 pr-3 min-w-0">
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{player.name}</h4>
                {!player.active && (
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Inactivo</span>
                )}
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-700 text-white flex items-center justify-center rounded-xl font-black text-sm shadow-md flex-shrink-0">
                {player.dorsal}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {player.positions.map((pos: string, i: number) => (
                <span
                  key={i}
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${getPositionColor(pos)}`}
                >
                  {pos}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {!editing && (
        <div className="px-4 sm:px-5 pb-4 flex flex-wrap gap-2 border-t border-slate-100 dark:border-slate-700 pt-3">
          <button
            onClick={() => setEditing(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg text-blue-600 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all"
          >
            Editar
          </button>
          <form action={togglePlayerStatus.bind(null, player.id, player.active)}>
            <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
              player.active
                ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
            }`}>
              {player.active ? 'Dar de baja' : 'Reactivar'}
            </button>
          </form>
          <form action={deletePlayer.bind(null, player.id)}>
            <button className="text-xs font-semibold px-3 py-1.5 rounded-lg text-rose-500 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all">
              Eliminar
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
