export default function Home() {
  return (
    <div className="p-4 sm:p-6 lg:p-10 flex flex-col items-center justify-center min-h-[80vh] text-center">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Bienvenido al Vestidor, Capi 🧢
      </h1>
      <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-8 px-4">
        Aquí es donde se ganan los campeonatos. Gestiona la lana, la alineación y los goles desde el menú.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-3xl px-4">
        <a href="/admin/payments" className="p-4 sm:p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition text-left group">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 group-hover:text-green-600 transition">Cobrar Cuotas 💸</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Revisa quién no ha pagado el arbitraje.</p>
        </a>
        <a href="/admin/matches" className="p-4 sm:p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition text-left group">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 transition">Nuevo Partido 🏟️</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Registra el resultado del fin de semana.</p>
        </a>
        <a href="/admin/players" className="p-4 sm:p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition text-left group">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 group-hover:text-yellow-600 transition">Plantilla 🌟</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Agrega o baja jugadores, y sus posiciones.</p>
        </a>
        <a href="/admin/goals" className="p-4 sm:p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition text-left group">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 group-hover:text-red-600 transition">Goleadores ⚽</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Lleva la cuenta de quién mete golazos.</p>
        </a>
      </div>
    </div>
  );
}
