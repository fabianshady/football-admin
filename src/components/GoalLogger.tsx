'use client'

import { useState } from 'react'
import { addGoal, removeGoal } from '@/app/actions/goals'

// Recibimos los partidos "hydrated" con toda la info desde el server
export default function GoalLogger({ matches }: { matches: any[] }) {
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null)

  const toggleMatch = (id: string) => {
    setExpandedMatch(expandedMatch === id ? null : id)
  }

  return (
    <div className="space-y-4">
      {matches.map(match => {
        // Calculamos goles totales del equipo en base a los registros individuales
        const totalTeamGoals = match.goals.length

        return (
          <div key={match.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm transition-all">

            {/* CABECERA DEL ACORDEÓN (Click para abrir) */}
            <button
                onClick={() => toggleMatch(match.id)}
                className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition text-left"
            >
                <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-200">{match.rivalTeam}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(match.date).toLocaleDateString()} - {match.location}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <span className="block text-xs font-bold text-gray-400 dark:text-gray-500">GOLES REGISTRADOS</span>
                        <span className="text-xl font-mono font-bold text-blue-600 dark:text-blue-400">{totalTeamGoals}</span>
                    </div>
                    <span className="text-gray-400 dark:text-gray-500">{expandedMatch === match.id ? '▲' : '▼'}</span>
                </div>
            </button>

            {/* CONTENIDO (Lista de jugadores) */}
            {expandedMatch === match.id && (
                <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800 animate-in slide-in-from-top-2 fade-in duration-200">
                    {match.squad.length === 0 ? (
                        <p className="text-center text-gray-400 dark:text-gray-500 italic py-2">No hay convocatoria registrada para este partido.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {match.squad.map((sq: any) => {
                                // Cuántos goles metió este crack en este partido
                                const playerGoals = match.goals.filter((g: any) => g.playerId === sq.playerId).length

                                return (
                                    <div key={sq.playerId} className="flex justify-between items-center p-3 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 transition group">
                                        <div>
                                            <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{sq.player.name}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">{sq.player.positions[0]}</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Botón Restar */}
                                            <button
                                                onClick={() => removeGoal(match.id, sq.playerId)}
                                                disabled={playerGoals === 0}
                                                className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 font-bold hover:bg-red-200 dark:hover:bg-red-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                            >
                                                -
                                            </button>

                                            {/* Contador */}
                                            <span className={`w-6 text-center font-bold ${playerGoals > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-300 dark:text-gray-600'}`}>
                                                {playerGoals}
                                            </span>

                                            {/* Botón Sumar */}
                                            <button
                                                onClick={() => addGoal(match.id, sq.playerId)}
                                                className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 font-bold hover:bg-green-200 dark:hover:bg-green-800 shadow-sm transition transform active:scale-90"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
