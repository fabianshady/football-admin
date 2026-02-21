import { getMatches, deleteMatch } from '@/app/actions/matches'
import { prisma } from '@/lib/prisma'
import MatchForm from '@/components/MatchForm'
import ScoreEditor from '@/components/ScoreEditor'

export default async function MatchesPage() {
  const matches = await getMatches()
  const activePlayers = await prisma.player.findMany({ where: { active: true }, orderBy: { name: 'asc' } })

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 sm:mb-8">Partidos 🏟️</h1>

      {/* Formulario para nuevo partido - Componente Cliente */}
      <MatchForm players={activePlayers} />

      {/* Lista de partidos */}
      <div className="space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300">Historial de Partidos</h3>

        {matches.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8 text-center text-gray-500 dark:text-gray-400">
            <p className="text-4xl mb-2">⚽</p>
            <p>No hay partidos registrados aún</p>
            <p className="text-sm">Usa el formulario de arriba para agregar el primer partido</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((match) => {
              const isWin = match.scoreHome > match.scoreAway
              const isLoss = match.scoreHome < match.scoreAway
              const isDraw = match.scoreHome === match.scoreAway

              return (
                <div key={match.id} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4 p-4 sm:p-5 ${
                  isWin ? 'border-green-500' : isLoss ? 'border-red-500' : 'border-gray-400'
                }`}>
                  {/* Header con fecha y hora */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 block">
                        {match.date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                        🕐 {match.date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <form action={deleteMatch.bind(null, match.id)}>
                      <button className="text-red-400 hover:text-red-600 text-xs">✕</button>
                    </form>
                  </div>

                  {/* Marcador */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 text-right pr-3">
                      <p className="font-bold text-sm sm:text-base text-gray-800 dark:text-gray-200 truncate">{match.myTeam}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">Pos: {match.myPos}°</p>
                    </div>
                    <ScoreEditor
                      matchId={match.id}
                      initialHome={match.scoreHome}
                      initialAway={match.scoreAway}
                      isWin={isWin}
                      isLoss={isLoss}
                    />
                    <div className="flex-1 pl-3">
                      <p className="font-bold text-sm sm:text-base text-gray-800 dark:text-gray-200 truncate">{match.rivalTeam}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">Pos: {match.rivalPos}°</p>
                    </div>
                  </div>

                  {/* Ubicación */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">📍 {match.location}</p>

                  {/* Convocados */}
                  {match.squad && match.squad.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Convocados ({match.squad.length})</p>
                      <div className="flex flex-wrap gap-1">
                        {match.squad.map((s) => (
                          <span key={s.id} className="text-[10px] bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                            {s.player.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Goles */}
                  {match.goals && match.goals.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">⚽ Goles</p>
                      <div className="flex flex-wrap gap-1">
                        {match.goals.map((g) => (
                          <span key={g.id} className="text-[10px] bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full">
                            {g.player.name} {g.minute ? `(${g.minute}')` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
