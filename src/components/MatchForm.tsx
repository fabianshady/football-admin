'use client'

import { useState } from 'react'
import { createMatch } from '@/app/actions/matches'
import { convertLocalToUTC } from '@/lib/dateUtils'

type Player = {
  id: string
  name: string
  dorsal: number
  positions: string[]
}

export default function MatchForm({ players }: { players: Player[] }) {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const togglePlayer = (playerId: string) => {
    setSelectedPlayers(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    )
  }

  const handleSubmit = async (formData: FormData) => {
    const dateValue = formData.get('date') as string
    const timeValue = formData.get('time') as string || '20:00'

    // Detectar timezone del usuario y convertir a UTC
    const utcDateTime = convertLocalToUTC(dateValue, timeValue)
    formData.set('date', utcDateTime)

    selectedPlayers.forEach(id => formData.append('squad', id))
    await createMatch(formData)
    setSelectedPlayers([])
    setIsOpen(false)
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
            <input name="myTeam" type="text" placeholder="Ej: Filial Sub-20" required
              className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-full text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Rival</label>
            <input name="rivalTeam" type="text" placeholder="Ej: Real Madrid" required
              className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-full text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Fecha</label>
            <input name="date" type="date" required
              className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-full text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Hora</label>
            <input name="time" type="time" defaultValue="20:00" required
              className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-full text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Ubicación</label>
            <input name="location" type="text" placeholder="Ej: Estadio Azteca" required
              className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-full text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Mi Pos.</label>
              <input name="myPos" type="number" min="1" placeholder="1" required
                className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-full text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Pos. Rival</label>
              <input name="rivalPos" type="number" min="1" placeholder="1" required
                className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-full text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Local</label>
              <input name="scoreHome" type="number" min="0" defaultValue="0"
                className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-full text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Visitante</label>
              <input name="scoreAway" type="number" min="0" defaultValue="0"
                className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-full text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
            </div>
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

        {/* Submit */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex gap-3">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md"
          >
            Guardar Partido
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
