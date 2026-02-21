import { getPlayers, savePlayer, togglePlayerStatus, deletePlayer } from '@/app/actions/players'

// Definimos las categorías para agrupar visualmente
const POSITION_GROUPS = ['Portero', 'Defensa', 'Mediocentro', 'Lateral', 'Delantero', 'Cuerpo Técnico']

export default async function PlayersPage() {
  const players = await getPlayers()

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 sm:mb-8">Gestión de Plantilla 🧢</h1>

      {/* Formulario rápido para agregar */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md mb-6 sm:mb-10 border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Nuevo Fichaje</h2>
        <form action={savePlayer} className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end flex-wrap">
          <div className="w-full sm:w-auto">
            <label className="block text-sm text-gray-500 dark:text-gray-400">Nombre</label>
            <input name="name" type="text" placeholder="Ej: Jack Grealish" required className="border dark:border-gray-600 p-2 rounded w-full sm:w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          </div>
          <div className="w-20">
            <label className="block text-sm text-gray-500 dark:text-gray-400">Dorsal</label>
            <input name="dorsal" type="number" placeholder="11" required className="border dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-sm text-gray-500 dark:text-gray-400">Posiciones (sep. por comas)</label>
            <input name="positions" type="text" placeholder="Delantero, Extremo" required className="border dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition w-full sm:w-auto">
            Registrar
          </button>
        </form>
      </div>

      {/* LISTADO CLASIFICADO POR POSICIÓN */}
      <div className="space-y-6 sm:space-y-10">
        {POSITION_GROUPS.map((group) => {
          const groupPlayers = players.filter(p => p.positions[0] === group)
          if (groupPlayers.length === 0) return null

          return (
            <section key={group}>
              <h3 className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-300 mb-3 sm:mb-4 border-b dark:border-gray-700 pb-2">{group}s</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {groupPlayers.map((player) => (
                  <div key={player.id} className={`relative p-4 sm:p-5 rounded-xl border transition-all ${player.active ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md' : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-75'}`}>

                    {/* Badge de Dorsal */}
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-gray-900 dark:bg-gray-600 text-white w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full font-bold text-sm sm:text-lg">
                      {player.dorsal}
                    </div>

                    <div className="pr-10 sm:pr-12">
                      <h4 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100">{player.name}</h4>
                      <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                        {player.positions.map((pos, index) => (
                          <span key={index} className={`text-xs px-2 py-1 rounded-full ${index === 0 ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-semibold' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                            {pos}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="mt-4 sm:mt-6 flex gap-3 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
                      <form action={togglePlayerStatus.bind(null, player.id, player.active)}>
                        <button className={`text-xs sm:text-sm font-medium ${player.active ? 'text-amber-600 hover:text-amber-700' : 'text-green-600 hover:text-green-700'}`}>
                          {player.active ? 'Bajear' : 'Reactivar'}
                        </button>
                      </form>

                      <form action={deletePlayer.bind(null, player.id)}>
                        <button className="text-xs sm:text-sm font-medium text-red-500 hover:text-red-700">
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {/* Sección para los inadaptados */}
      <div className="mt-8 sm:mt-12 opacity-60">
        <h3 className="text-lg sm:text-xl font-bold text-gray-500 dark:text-gray-400 mb-4">Sin clasificación / Otros</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
             {players.filter(p => !POSITION_GROUPS.includes(p.positions[0] || '')).map(p => (
                 <div key={p.id} className={`p-4 rounded ${p.active ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300' : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 opacity-75'}`}>
                   <div className="flex justify-between items-start">
                     <span className="text-sm sm:text-base">{p.name} ({p.positions[0] || '?'})</span>
                     <span className="bg-gray-900 dark:bg-gray-500 text-white w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full font-bold text-xs sm:text-sm">
                       {p.dorsal}
                     </span>
                   </div>
                   <div className="mt-3 flex gap-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                     <form action={togglePlayerStatus.bind(null, p.id, p.active)}>
                       <button className={`text-xs sm:text-sm font-medium ${p.active ? 'text-amber-600 hover:text-amber-700' : 'text-green-600 hover:text-green-700'}`}>
                         {p.active ? 'Bajear' : 'Reactivar'}
                       </button>
                     </form>
                     <form action={deletePlayer.bind(null, p.id)}>
                       <button className="text-xs sm:text-sm font-medium text-red-500 hover:text-red-700">
                         Eliminar
                       </button>
                     </form>
                   </div>
                 </div>
             ))}
        </div>
      </div>

    </div>
  )
}
