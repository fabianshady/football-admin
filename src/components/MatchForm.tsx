'use client'

import { useState } from 'react'
import { createMatch } from '@/app/actions/matches'

type Player = {
  id: string
  name: string
  dorsal: number
  positions: string[]
}

export default function MatchForm({ players }: { players: Player[] }) {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])

  const togglePlayer = (playerId: string) => {
    setSelectedPlayers(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    )
  }

  const handleSubmit = async (formData: FormData) => {
    // Combinar fecha y hora
    const dateValue = formData.get('date') as string
    const timeValue = formData.get('time') as string || '20:00'
    const combinedDateTime = `${dateValue}T${timeValue}:00`
    formData.set('date', combinedDateTime)

    // Agregar los jugadores seleccionados al formData
    selectedPlayers.forEach(id => {
      formData.append('squad', id)
    })
    await createMatch(formData)
    setSelectedPlayers([])
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md mb-6 sm:mb-10 border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Registrar Partido</h2>

      <form action={handleSubmit} className="space-y-4">
        {/* Datos del partido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Mi Equipo</label>
            <input name="myTeam" type="text" placeholder="Ej: Filial Sub-20" required
              className="border dark:border-gray-600 p-2 rounded w-full text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Rival</label>
            <input name="rivalTeam" type="text" placeholder="Ej: Real Madrid" required
              className="border dark:border-gray-600 p-2 rounded w-full text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Fecha</label>
            <input name="date" type="date" required
              className="border dark:border-gray-600 p-2 rounded w-full text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Hora</label>
            <input name="time" type="time" defaultValue="20:00" required
              className="border dark:border-gray-600 p-2 rounded w-full text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Ubicación</label>
            <input name="location" type="text" placeholder="Ej: Estadio Azteca" required
              className="border dark:border-gray-600 p-2 rounded w-full text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Mi Pos. Tabla</label>
              <input name="myPos" type="number" min="1" placeholder="1" required
                className="border dark:border-gray-600 p-2 rounded w-full text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Pos. Rival</label>
              <input name="rivalPos" type="number" min="1" placeholder="1" required
                className="border dark:border-gray-600 p-2 rounded w-full text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Goles Local</label>
              <input name="scoreHome" type="number" min="0" defaultValue="0"
                className="border dark:border-gray-600 p-2 rounded w-full text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Goles Visitante</label>
              <input name="scoreAway" type="number" min="0" defaultValue="0"
                className="border dark:border-gray-600 p-2 rounded w-full text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            </div>
          </div>
        </div>

        {/* Selección de convocados */}
        <div className="border-t dark:border-gray-700 pt-4">
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Convocatoria ({selectedPlayers.length} seleccionados)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {players.map(player => (
              <button
                key={player.id}
                type="button"
                onClick={() => togglePlayer(player.id)}
                className={`p-2 rounded-lg text-left transition-all text-xs sm:text-sm ${
                  selectedPlayers.includes(player.id)
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="font-bold">#{player.dorsal}</span>
                <span className="block truncate">{player.name}</span>
              </button>
            ))}
          </div>
          {players.length === 0 && (
            <p className="text-gray-400 dark:text-gray-500 text-sm">No hay jugadores activos para convocar</p>
          )}
        </div>

        {/* Botón submit */}
        <div className="pt-4 border-t dark:border-gray-700">
          <button type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition w-full sm:w-auto">
            Guardar Partido
          </button>
        </div>
      </form>
    </div>
  )
}
