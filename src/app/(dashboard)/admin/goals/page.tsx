import { getPlayers } from '@/app/actions/players'
import { getTopScorers, getMatchesWithGoals } from '@/app/actions/goals'
import GoalLogger from '@/components/GoalLogger'

export default async function GoalsPage() {
  const players = await getPlayers()
  const activePlayers = players.filter((p: any) => p.active)
  const topScorers = await getTopScorers()
  const matches = await getMatchesWithGoals()

  const first = topScorers[0] || null
  const second = topScorers[1] || null
  const third = topScorers[2] || null

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Tabla de Goleo 🥅
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {topScorers.reduce((a: number, s: any) => a + s.goals, 0)} goles en {matches.length} partido{matches.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Podio */}
      {topScorers.length > 0 && (
        <div className="max-w-lg mx-auto mb-10">
          <div className="flex items-end justify-center gap-2 sm:gap-4">
            {/* Segundo lugar */}
            <div className="flex-1 text-center">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-b-none pt-4 pb-3 px-3 shadow-sm">
                <div className="text-2xl sm:text-3xl mb-2">🥈</div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{second?.name || '—'}</p>
                <p className="text-2xl font-black text-slate-600 dark:text-slate-300">{second?.goals ?? 0}</p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">goles</p>
              </div>
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-b-xl" />
            </div>

            {/* Primer lugar */}
            <div className="flex-1 text-center">
              <div className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-yellow-900/30 dark:to-amber-900/20 border-2 border-amber-400 dark:border-amber-600 rounded-2xl rounded-b-none pt-5 pb-3 px-3 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/20">
                <div className="text-3xl sm:text-4xl mb-2">🥇</div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{first?.name || '—'}</p>
                <p className="text-3xl font-black text-amber-600 dark:text-amber-400">{first?.goals ?? 0}</p>
                <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-wide">goles</p>
              </div>
              <div className="h-12 bg-gradient-to-b from-amber-300 to-amber-400 dark:from-amber-700 dark:to-amber-800 rounded-b-xl" />
            </div>

            {/* Tercer lugar */}
            <div className="flex-1 text-center">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-b-none pt-4 pb-3 px-3 shadow-sm">
                <div className="text-2xl sm:text-3xl mb-2">🥉</div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{third?.name || '—'}</p>
                <p className="text-2xl font-black text-orange-600 dark:text-orange-400">{third?.goals ?? 0}</p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">goles</p>
              </div>
              <div className="h-6 bg-orange-200 dark:bg-orange-900 rounded-b-xl" />
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard + Registro */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Clasificación */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden sticky top-4">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-amber-50 to-white dark:from-amber-900/10 dark:to-slate-800">
              <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>🏆</span> Clasificación
              </h2>
            </div>
            {topScorers.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-3xl mb-2">⚽</p>
                <p className="text-slate-400 text-sm">Aún no cae el primero.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {topScorers.map((scorer: any, index: number) => (
                  <div key={scorer.name} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-black ${
                        index === 0 ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400' :
                        index === 1 ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' :
                        index === 2 ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400' :
                        'bg-slate-50 dark:bg-slate-800 text-slate-400'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-bold text-sm text-slate-800 dark:text-slate-200 leading-tight">{scorer.name}</p>
                        <p className="text-[10px] text-slate-400">#{scorer.dorsal} &bull; {scorer.matchesPlayed} PJ</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-lg text-blue-700 dark:text-blue-300">{scorer.goals}</span>
                      <p className="text-[10px] text-slate-400">
                        {scorer.matchesPlayed > 0 ? (scorer.goals / scorer.matchesPlayed).toFixed(2) : '0.00'}/PJ
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Registro por partido */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Registro por Partido</h2>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>
          <GoalLogger matches={matches} />
        </div>

      </div>
    </div>
  )
}
