'use client'

import { useState, useTransition } from 'react'
import { createMatch } from '@/app/actions/matches'
import { convertLocalToUTC } from '@/lib/dateUtils'
import type { Season } from '@/app/actions/seasons'

type Player = {
  id: string
  name: string
  dorsal: number
  positions: string[]
}

type Props = {
  players: Player[]
  seasons: Season[]
  defaultSeasonId?: string | null
}

export default function MatchForm({ players, seasons, defaultSeasonId }: Props) {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [selectedKit, setSelectedKit] = useState<number>(1)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const defaultSeason = defaultSeasonId || seasons.find(s => s.active)?.id || seasons[0]?.id || ''

  const togglePlayer = (playerId: string) => {
    setSelectedPlayers(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    )
  }

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    const dateValue = formData.get('date') as string
    const timeValue = formData.get('time') as string || '20:00'

    const utcDateTime = convertLocalToUTC(dateValue, timeValue)
    formData.set('date', utcDateTime)
    formData.set('kit', selectedKit.toString())

    selectedPlayers.forEach(id => formData.append('squad', id))

    startTransition(async () => {
      try {
        await createMatch(formData)
        setSelectedPlayers([])
        setSelectedKit(1)
        setIsOpen(false)
      } catch (e: any) {
        setError(e?.message || 'Error al guardar el partido')
      }
    })
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full mb-8 p-5 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all text-slate-400 hover:text-blue-500 font-semibold flex items-center justify-center gap-2"
      >
        <span className="text-lg">+</span> Registrar nuevo partido
      </button>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-8 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <h2 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <span className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white text-xs font-black">+</span>
          Registrar Partido
        </h2>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
        >
          ✕
        </button>
      </div>

      <form action={handleSubmit} className="p-5 space-y-5">
        {/* Datos básicos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Mi Equipo</label>
            <input name="myTeam" type="text" placeholder="Ej: Filial Sub-20" required disabled={isPending}
              className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-full text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Rival</label>
            <input name="rivalTeam" type="text" placeholder="Ej: Real Madrid" required disabled={isPending}
              className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-full text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Fecha</label>
            <input name="date" type="date" required disabled={isPending}
              className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-full text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Hora</label>
            <input name="time" type="time" defaultValue="20:00" required disabled={isPending}
              className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-full text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Ubicación</label>
            <input name="location" type="text" placeholder="Ej: Estadio Azteca" required disabled={isPending}
              className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-full text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Temporada</label>
            <select
              name="seasonid"
              required
              defaultValue={defaultSeason}
              disabled={isPending || seasons.length === 0}
              className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-full text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50"
            >
              {seasons.length === 0 && <option value="">Sin temporadas</option>}
              {seasons.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}{s.active ? ' ●' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Mi Pos.</label>
              <input name="myPos" type="number" min="1" placeholder="1" required disabled={isPending}
                className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-full text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Pos. Rival</label>
              <input name="rivalPos" type="number" min="1" placeholder="1" required disabled={isPending}
                className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-full text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Local</label>
              <input name="scoreHome" type="number" min="0" defaultValue="0" disabled={isPending}
                className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-full text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Visitante</label>
              <input name="scoreAway" type="number" min="0" defaultValue="0" disabled={isPending}
                className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-full text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50" />
            </div>
          </div>
        </div>

        {/* Uniforme */}
        <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-3">
            Uniforme a utilizar 👕
          </label>
          <div className="flex gap-4 max-w-md">
            <button
              type="button"
              onClick={() => setSelectedKit(1)}
              className={`flex-1 flex flex-col items-center p-3 rounded-2xl border-2 transition-all relative overflow-hidden group ${
                selectedKit === 1
                  ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/10'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="w-20 h-20 mb-2 relative flex items-center justify-center">
                <img
                  src="https://vpl0mb2pgnbucvy2.public.blob.vercel-storage.com/1u.png"
                  alt="Uniforme 1"
                  className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-200"
                />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Uniforme 1</span>
              {selectedKit === 1 && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                  ✓
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setSelectedKit(2)}
              className={`flex-1 flex flex-col items-center p-3 rounded-2xl border-2 transition-all relative overflow-hidden group ${
                selectedKit === 2
                  ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/10'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="w-20 h-20 mb-2 relative flex items-center justify-center">
                <img
                  src="https://vpl0mb2pgnbucvy2.public.blob.vercel-storage.com/2u.png"
                  alt="Uniforme 2"
                  className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-200"
                />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Uniforme 2</span>
              {selectedKit === 2 && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                  ✓
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Convocatoria */}
        <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              Convocatoria
            </label>
            {selectedPlayers.length > 0 && (
              <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                {selectedPlayers.length} seleccionados
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {players.map(player => (
              <button
                key={player.id}
                type="button"
                onClick={() => togglePlayer(player.id)}
                className={`p-2.5 rounded-xl text-left transition-all text-xs group ${
                  selectedPlayers.includes(player.id)
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/30'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <span className={`font-black text-xs block ${selectedPlayers.includes(player.id) ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'}`}>
                  #{player.dorsal}
                </span>
                <span className="block truncate font-semibold">{player.name}</span>
              </button>
            ))}
          </div>
          {players.length === 0 && (
            <p className="text-slate-400 dark:text-slate-500 text-sm">No hay jugadores activos para convocar</p>
          )}
        </div>

        {error && (
          <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">{error}</p>
        )}

        {/* Submit */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex gap-3">
          <button
            type="submit"
            disabled={isPending || seasons.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-50"
          >
            {isPending ? 'Guardando…' : 'Guardar Partido'}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            disabled={isPending}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
