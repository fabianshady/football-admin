'use client'

import { useState } from 'react'
import { addGoal, removeGoal } from '@/app/actions/goals'

export default function GoalLogger({ matches }: { matches: any[] }) {
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null)

  const toggleMatch = (id: string) => {
    setExpandedMatch(expandedMatch === id ? null : id)
  }

  if (matches.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-10 text-center">
        <p className="text-4xl mb-2">⚽</p>
        <p className="text-slate-400 font-medium">No hay partidos registrados aún</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {matches.map(match => {
        const totalTeamGoals = match.goals.length
        const isExpanded = expandedMatch === match.id
        const matchDate = new Date(match.date)

        return (
          <div key={match.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">

            {/* Cabecera */}
            <button
              onClick={() => toggleMatch(match.id)}
              className="w-full flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
            >
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">vs {match.rivalTeam}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {matchDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })} &bull; {match.location}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Goles</span>
                  <span className={`text-xl font-black ${totalTeamGoals > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'}`}>
                    {totalTeamGoals}
                  </span>
                </div>
                <span className={`w-6 h-6 flex items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400 text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </div>
            </button>

            {/* Contenido */}
            {isExpanded && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                {match.squad.length === 0 ? (
                  <p className="text-center text-slate-400 dark:text-slate-500 italic text-sm py-3">Sin convocatoria registrada.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {match.squad.map((sq: any) => {
                      const playerGoals = match.goals.filter((g: any) => g.playerId === sq.playerId).length

                      return (
                        <div
                          key={sq.playerId}
                          className={`flex justify-between items-center p-3 rounded-xl border transition-colors ${
                            playerGoals > 0
                              ? 'border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          <div>
                            <p className="font-bold text-sm text-slate-800 dark:text-slate-200 leading-tight">{sq.player.name}</p>
                            <p className="text-[10px] text-slate-400">{sq.player.positions?.[0] || 'Jugador'}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => removeGoal(match.id, sq.playerId)}
                              disabled={playerGoals === 0}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-black hover:bg-rose-200 dark:hover:bg-rose-900/60 disabled:opacity-25 disabled:cursor-not-allowed transition-all text-sm"
                            >
                              −
                            </button>

                            <span className={`w-6 text-center font-black text-base ${playerGoals > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'}`}>
                              {playerGoals}
                            </span>

                            <button
                              onClick={() => addGoal(match.id, sq.playerId)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 font-black hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-all active:scale-90 text-sm"
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
