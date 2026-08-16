'use client'

import { useState } from 'react'
import { addGoal, removeGoal } from '@/app/actions/goals'
import { formatVenueDate } from '@/lib/dateUtils'

export default function GoalLogger({ matches }: { matches: any[] }) {
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null)

  const toggleMatch = (id: string) => {
    setExpandedMatch(expandedMatch === id ? null : id)
  }

  if (matches.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center">
        <p className="mb-2 text-4xl">⚽</p>
        <p className="font-medium text-muted-foreground">No hay partidos registrados aún</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {matches.map(match => {
        const totalTeamGoals = match.goals.length
        const isExpanded = expandedMatch === match.id

        return (
          <div key={match.id} className="glass-card overflow-hidden rounded-2xl">
            <button
              onClick={() => toggleMatch(match.id)}
              className="flex w-full items-center justify-between bg-muted/30 p-4 text-left transition-colors hover:bg-muted/50"
            >
              <div>
                <h3 className="text-sm font-bold text-foreground">vs {match.rivalTeam}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatVenueDate(match.date)} &bull; {match.location}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Goles</span>
                  <span className={`font-display text-xl font-bold tabular-nums ${totalTeamGoals > 0 ? 'text-gold' : 'text-muted-foreground/40'}`}>
                    {totalTeamGoals}
                  </span>
                </div>
                <span className={`flex h-6 w-6 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-border/40 p-4">
                {match.squad.length === 0 ? (
                  <p className="py-3 text-center text-sm italic text-muted-foreground">Sin convocatoria registrada.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                    {match.squad.map((sq: any) => {
                      const playerGoals = match.goals.filter((g: any) => g.playerId === sq.playerId).length

                      return (
                        <div
                          key={sq.playerId}
                          className={`flex items-center justify-between rounded-xl border p-3 transition-colors ${
                            playerGoals > 0
                              ? 'border-gold/30 bg-gold/10'
                              : 'border-border/40 bg-muted/30 hover:bg-muted/50'
                          }`}
                        >
                          <div>
                            <p className="text-sm font-bold leading-tight text-foreground">{sq.player.name}</p>
                            <p className="text-[10px] text-muted-foreground">{sq.player.positions?.[0] || 'Jugador'}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => removeGoal(match.id, sq.playerId)}
                              disabled={playerGoals === 0}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-banner/15 text-sm font-black text-banner transition-all hover:bg-banner/25 disabled:cursor-not-allowed disabled:opacity-25"
                            >
                              −
                            </button>

                            <span className={`w-6 text-center font-display text-base font-bold tabular-nums ${playerGoals > 0 ? 'text-gold' : 'text-muted-foreground/40'}`}>
                              {playerGoals}
                            </span>

                            <button
                              onClick={() => addGoal(match.id, sq.playerId)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-sm font-black text-emerald-600 transition-all hover:bg-emerald-500/25 active:scale-90"
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
