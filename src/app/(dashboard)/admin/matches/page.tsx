import { getMatches, deleteMatch } from '@/app/actions/matches'
import { getActivePlayers } from '@/app/actions/players'
import MatchForm from '@/components/MatchForm'
import ScoreEditor from '@/components/ScoreEditor'

export default async function MatchesPage() {
  const matches = await getMatches()
  const activePlayers = await getActivePlayers()

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Partidos 🏟️
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Historial y resultados del equipo</p>
      </div>

      {/* Formulario nuevo partido */}
      <MatchForm players={activePlayers} />

      {/* Lista de partidos */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Historial</h3>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            {matches.length} partido{matches.length !== 1 ? 's' : ''}
          </span>
        </div>

        {matches.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <p className="text-5xl mb-3">🏟️</p>
            <p className="font-semibold text-slate-600 dark:text-slate-300">No hay partidos registrados</p>
            <p className="text-sm text-slate-400 mt-1">Usa el formulario de arriba para agregar el primer partido</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((match: any) => {
              const isWin = match.scoreHome > match.scoreAway
              const isLoss = match.scoreHome < match.scoreAway
              const matchDate = new Date(match.date)

              return (
                <div
                  key={match.id}
                  className={`bg-white dark:bg-slate-800 rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${
                    isWin
                      ? 'border-emerald-200 dark:border-emerald-800/50'
                      : isLoss
                      ? 'border-rose-200 dark:border-rose-800/50'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {/* Result accent bar */}
                  <div className={`h-1 w-full ${
                    isWin
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                      : isLoss
                      ? 'bg-gradient-to-r from-rose-400 to-red-500'
                      : 'bg-gradient-to-r from-slate-300 to-slate-400'
                  }`} />

                  <div className="p-4 sm:p-5">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize">
                          {matchDate.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400 font-semibold mt-0.5">
                          🕐 {matchDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isWin
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                            : isLoss
                            ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        }`}>
                          {isWin ? 'VICTORIA' : isLoss ? 'DERROTA' : 'EMPATE'}
                        </span>
                        <form action={deleteMatch.bind(null, match.id)}>
                          <button className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-slate-400 hover:text-rose-500 flex items-center justify-center text-xs transition-all">
                            ✕
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Marcador */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1 text-right pr-3">
                        <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{match.myTeam}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Pos {match.myPos}°</p>
                      </div>
                      <ScoreEditor
                        matchId={match.id}
                        initialHome={match.scoreHome}
                        initialAway={match.scoreAway}
                        isWin={isWin}
                        isLoss={isLoss}
                      />
                      <div className="flex-1 pl-3">
                        <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{match.rivalTeam}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Pos {match.rivalPos}°</p>
                      </div>
                    </div>

                    {/* Ubicación */}
                    <p className="text-xs text-slate-400 dark:text-slate-500 text-center font-medium">
                      📍 {match.location}
                    </p>

                    {/* Convocados */}
                    {match.squad && match.squad.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">
                          Convocados ({match.squad.length})
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {match.squad.map((s: any) => (
                            <span key={s.id} className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                              {s.player.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Goles */}
                    {match.goals && match.goals.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                          ⚽ Goleadores
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {match.goals.map((g: any) => (
                            <span key={g.id} className="text-[10px] bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">
                              {g.player.name}{g.minute ? ` (${g.minute}')` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
