import { getPlayers, savePlayer, togglePlayerStatus, deletePlayer } from '@/app/actions/players'
import { AnimatedPage, AnimatedList, AnimatedItem } from '@/components/AnimatedContainer'

const POSITION_GROUPS = ['Portero', 'Defensa', 'Mediocentro', 'Lateral', 'Delantero', 'Cuerpo Técnico']

const POSITION_COLORS: Record<string, string> = {
  'Portero':        'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 ring-1 ring-yellow-300/50',
  'Defensa':        'bg-blue-100   dark:bg-blue-900/40   text-blue-800   dark:text-blue-300   ring-1 ring-blue-300/50',
  'Mediocentro':    'bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-300 ring-1 ring-violet-300/50',
  'Lateral':        'bg-cyan-100   dark:bg-cyan-900/40   text-cyan-800   dark:text-cyan-300   ring-1 ring-cyan-300/50',
  'Delantero':      'bg-rose-100   dark:bg-rose-900/40   text-rose-800   dark:text-rose-300   ring-1 ring-rose-300/50',
  'Cuerpo Técnico': 'bg-slate-100  dark:bg-slate-700     text-slate-700  dark:text-slate-300  ring-1 ring-slate-300/50',
}

function getPositionColor(pos: string) {
  return POSITION_COLORS[pos] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 ring-1 ring-gray-300/50'
}

export default async function PlayersPage() {
  const players = await getPlayers()

  return (
    <AnimatedPage className="p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Plantilla 🏃
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gestiona los cracks del equipo</p>
      </div>

      {/* Formulario nuevo fichaje */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 sm:p-6 mb-8">
        <h2 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
          <span className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs">+</span>
          Nuevo Fichaje
        </h2>
        <form action={savePlayer} className="flex flex-col sm:flex-row gap-3 sm:items-end flex-wrap">
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Nombre</label>
            <input
              name="name" type="text" placeholder="Ej: Jack Grealish" required
              className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-full sm:w-64 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div className="w-24">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Dorsal</label>
            <input
              name="dorsal" type="number" placeholder="11" required
              className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-full bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Posiciones (sep. por comas)</label>
            <input
              name="positions" type="text" placeholder="Delantero, Extremo" required
              className="border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl w-full bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md hover:-translate-y-px w-full sm:w-auto"
          >
            Registrar
          </button>
        </form>
      </div>

      {/* Jugadores por posición */}
      <div className="space-y-8">
        {POSITION_GROUPS.map((group) => {
          const groupPlayers = players.filter(p => p.positions[0] === group)
          if (groupPlayers.length === 0) return null

          return (
            <section key={group}>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{group}s</h3>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  {groupPlayers.length}
                </span>
              </div>

              <AnimatedList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupPlayers.map((player) => (
                  <AnimatedItem
                    key={player.id}
                    className={`relative rounded-2xl border transition-all duration-200 overflow-hidden ${
                      player.active
                        ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5'
                        : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60'
                    }`}
                  >
                    {/* Top accent bar */}
                    <div className={`h-1 w-full ${player.active ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-slate-300 dark:bg-slate-600'}`} />

                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 pr-3">
                          <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">{player.name}</h4>
                          {!player.active && (
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Inactivo</span>
                          )}
                        </div>
                        {/* Jersey badge */}
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-700 text-white flex items-center justify-center rounded-xl font-black text-sm shadow-md flex-shrink-0">
                          {player.dorsal}
                        </div>
                      </div>

                      {/* Position badges */}
                      <div className="flex flex-wrap gap-1.5">
                        {player.positions.map((pos: string, i: number) => (
                          <span
                            key={i}
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${getPositionColor(i === 0 ? pos : pos)}`}
                          >
                            {pos}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-4 sm:px-5 pb-4 flex gap-3 border-t border-slate-100 dark:border-slate-700 pt-3">
                      <form action={togglePlayerStatus.bind(null, player.id, player.active)}>
                        <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                          player.active
                            ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                            : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                        }`}>
                          {player.active ? 'Dar de baja' : 'Reactivar'}
                        </button>
                      </form>
                      <form action={deletePlayer.bind(null, player.id)}>
                        <button className="text-xs font-semibold px-3 py-1.5 rounded-lg text-rose-500 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all">
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </AnimatedItem>
                ))}
              </AnimatedList>
            </section>
          )
        })}
      </div>

      {/* Sin clasificación */}
      {players.filter(p => !POSITION_GROUPS.includes(p.positions[0] || '')).length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-base font-bold text-slate-400">Sin clasificación</h3>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70">
            {players.filter(p => !POSITION_GROUPS.includes(p.positions[0] || '')).map(p => (
              <div key={p.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">{p.name}</span>
                  <span className="w-8 h-8 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center rounded-lg font-bold text-xs">
                    {p.dorsal}
                  </span>
                </div>
                <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <form action={togglePlayerStatus.bind(null, p.id, p.active)}>
                    <button className="text-xs font-medium text-amber-600 hover:underline">{p.active ? 'Dar de baja' : 'Reactivar'}</button>
                  </form>
                  <form action={deletePlayer.bind(null, p.id)}>
                    <button className="text-xs font-medium text-rose-500 hover:underline">Eliminar</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AnimatedPage>
  )
}
