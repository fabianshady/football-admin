import { getPlayers, savePlayer } from '@/app/actions/players'
import { AnimatedPage, AnimatedList, AnimatedItem } from '@/components/AnimatedContainer'
import PlayerCard from '@/components/PlayerCard'

const POSITION_GROUPS = ['Portero', 'Defensa', 'Mediocentro', 'Lateral', 'Delantero', 'Cuerpo Técnico']

export default async function PlayersPage() {
  const players = await getPlayers()

  return (
    <AnimatedPage className="p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Plantilla 🏃
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Gestiona los cracks del equipo · clic en Editar para cambiar nombre, posición o dorsal
        </p>
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
                  <AnimatedItem key={player.id}>
                    <PlayerCard player={player} />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.filter(p => !POSITION_GROUPS.includes(p.positions[0] || '')).map(p => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>
        </div>
      )}
    </AnimatedPage>
  )
}
