import { getPlayers } from '@/app/actions/players'
import { getTopScorers, getMatchesWithGoals } from '@/app/actions/goals'
import GoalLogger from '@/components/GoalLogger'

export default async function GoalsPage() {
  const players = await getPlayers()
  const activePlayers = players.filter(p => p.active)
  const topScorers = await getTopScorers()
  const matches = await getMatchesWithGoals()

  // Preparar datos del podio
  const first = topScorers[0] || null
  const second = topScorers[1] || null
  const third = topScorers[2] || null

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 sm:mb-8">Tabla de Goleo 🥅</h1>

      {/* Podio de goleadores */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8 max-w-2xl mx-auto">
        {/* Segundo lugar */}
        <div className="bg-gray-200 dark:bg-gray-700 rounded-xl p-3 sm:p-4 text-center order-1 self-end">
          <div className="text-2xl sm:text-4xl mb-2">🥈</div>
          <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 truncate">{second?.name || '-'}</p>
          <p className="text-lg sm:text-2xl font-black text-gray-600 dark:text-gray-300">{second?.goals || 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">goles</p>
        </div>

        {/* Primer lugar */}
        <div className="bg-yellow-100 dark:bg-yellow-900 rounded-xl p-4 sm:p-6 text-center order-2 border-2 border-yellow-400">
          <div className="text-3xl sm:text-5xl mb-2">🥇</div>
          <p className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-100 truncate">{first?.name || '-'}</p>
          <p className="text-2xl sm:text-3xl font-black text-yellow-600 dark:text-yellow-400">{first?.goals || 0}</p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">goles</p>
        </div>

        {/* Tercer lugar */}
        <div className="bg-orange-100 dark:bg-orange-900 rounded-xl p-3 sm:p-4 text-center order-3 self-end">
          <div className="text-2xl sm:text-4xl mb-2">🥉</div>
          <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 truncate">{third?.name || '-'}</p>
          <p className="text-lg sm:text-2xl font-black text-orange-600 dark:text-orange-400">{third?.goals || 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">goles</p>
        </div>
      </div>

      {/* Tabla completa */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-200">Clasificación General</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[350px]">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">Pos</th>
                <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">Jugador</th>
                <th className="text-center p-3 sm:p-4 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">PJ</th>
                <th className="text-center p-3 sm:p-4 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">Goles</th>
                <th className="text-center p-3 sm:p-4 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">Promedio</th>
              </tr>
            </thead>
            <tbody>
              {topScorers.map((scorer, index) => (
                <tr key={scorer.name} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="p-3 sm:p-4">
                    <span className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full font-bold text-xs sm:text-sm ${
                      index === 0 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
                      index === 1 ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200' :
                      index === 2 ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="bg-gray-900 dark:bg-gray-600 text-white w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full font-bold text-xs">
                        {scorer.dorsal}
                      </span>
                      <span className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-200">{scorer.name}</span>
                    </div>
                  </td>
                  <td className="p-3 sm:p-4 text-center text-sm sm:text-base text-gray-600 dark:text-gray-300">{scorer.matchesPlayed || 0}</td>
                  <td className="p-3 sm:p-4 text-center">
                    <span className="font-bold text-sm sm:text-base text-gray-800 dark:text-gray-200">{scorer.goals}</span>
                  </td>
                  <td className="p-3 sm:p-4 text-center text-sm sm:text-base text-gray-500 dark:text-gray-400">
                    {scorer.matchesPlayed && scorer.matchesPlayed > 0
                      ? (scorer.goals / scorer.matchesPlayed).toFixed(2)
                      : '0.00'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {topScorers.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No hay goles registrados aún
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">

        {/* COLUMNA IZQUIERDA: LEADERBOARD */}
        <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-t-4 border-yellow-400 sticky top-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <span>🏆</span> Pichichis
                </h2>

                {topScorers.length === 0 ? (
                    <p className="text-gray-400 dark:text-gray-500 text-sm">Aún no cae el primero, carnal.</p>
                ) : (
                    <ul className="space-y-3">
                        {topScorers.map((scorer, index) => (
                            <li key={scorer.name} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                                        index === 0 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
                                        index === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' :
                                        index === 2 ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300' : 'text-gray-400'
                                    }`}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{scorer.name}</p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500">Dorsal #{scorer.dorsal}</p>
                                    </div>
                                </div>
                                <div className="font-mono font-bold text-lg text-blue-900 dark:text-blue-300">
                                    {scorer.goals} <span className="text-xs text-gray-300 dark:text-gray-500 font-sans">goles</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>

        {/* COLUMNA DERECHA: REGISTRO DE GOLES */}
        <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Registro por Partido</h2>
            <GoalLogger matches={matches} />
        </div>

      </div>
    </div>
  )
}
