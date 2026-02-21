import { getPaymentMatrix, createEvent, togglePayment, deleteEvent } from '@/app/actions/payments'

export default async function PaymentsPage() {
  const { events, players } = await getPaymentMatrix()
  // players ya viene con payments incluidos desde getPaymentMatrix
  const activePlayers = players.filter(p => p.active)

  // Calcular totales para el resumen
  const totalDebt = activePlayers.reduce((acc, player) => {
    const playerDebt = player.payments
      .filter(p => !p.paid)
      .reduce((sum, curr) => {
        const event = events.find(e => e.id === curr.eventId)
        return sum + (event ? event.cost : 0)
      }, 0)
    return acc + playerDebt
  }, 0)

  const totalPaid = activePlayers.reduce((acc, player) => {
    const playerPaid = player.payments
      .filter(p => p.paid)
      .reduce((sum, curr) => {
        const event = events.find(e => e.id === curr.eventId)
        return sum + (event ? event.cost : 0)
      }, 0)
    return acc + playerPaid
  }, 0)

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 sm:mb-8">Pagos y Deudas 💸</h1>

      {/* Resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Jugadores Activos</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">{activePlayers.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Por Cobrar</p>
          <p className="text-2xl sm:text-3xl font-bold text-red-600">${totalDebt}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Cobrado</p>
          <p className="text-2xl sm:text-3xl font-bold text-green-600">${totalPaid}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total Eventos</p>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">{events.length}</p>
        </div>
      </div>

      {/* FORMULARIO PARA CREAR COBRO */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow mb-6 sm:mb-8 border-l-4 border-green-500">
        <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-gray-100">Nuevo Cobro</h3>
        <form action={createEvent} className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end flex-wrap">
          <div className="w-full sm:w-auto">
            <label className="block text-sm text-gray-500 dark:text-gray-400">Concepto</label>
            <input name="name" type="text" placeholder="Ej. Arbitraje J3" required className="border dark:border-gray-600 p-2 rounded w-full sm:w-48 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          </div>
          <div className="w-full sm:w-auto">
            <label className="block text-sm text-gray-500 dark:text-gray-400">Costo ($)</label>
            <input name="cost" type="number" step="0.5" placeholder="50" required className="border dark:border-gray-600 p-2 rounded w-full sm:w-24 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          </div>
          <div className="w-full sm:w-auto">
            <label className="block text-sm text-gray-500 dark:text-gray-400">Fecha</label>
            <input name="date" type="date" required className="border dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          </div>
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold transition w-full sm:w-auto">
            Crear Deuda
          </button>
        </form>
      </div>

      {/* LA MATRIZ DE PAGOS */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-200">Estado de Pagos</h2>
        </div>

        {/* Tabla responsive */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px] text-sm text-left">
            <thead className="bg-gray-800 text-gray-100 uppercase">
              <tr>
                <th className="px-3 sm:px-4 py-3 sm:py-4 sticky left-0 bg-gray-800 z-10 w-32 sm:w-48">Jugador</th>
                <th className="px-3 sm:px-4 py-3 sm:py-4 text-center bg-red-900 w-24 sm:w-32">Deuda</th>
                {events.map(event => (
                  <th key={event.id} className="px-3 sm:px-4 py-3 sm:py-4 min-w-[100px] sm:min-w-[120px] text-center border-l border-gray-700 relative group">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-yellow-400">${event.cost}</span>
                      <span className="text-xs opacity-75 truncate">{event.name}</span>
                      <span className="text-[10px] opacity-50">{event.date.toLocaleDateString()}</span>
                    </div>
                    <form action={deleteEvent.bind(null, event.id)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition">
                        <button className="text-red-400 hover:text-red-200 text-xs">✕</button>
                    </form>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {activePlayers.map(player => {
                const playerDebt = player.payments
                  .filter(p => !p.paid)
                  .reduce((acc, curr) => {
                    const event = events.find(e => e.id === curr.eventId)
                    return acc + (event ? event.cost : 0)
                  }, 0)

                return (
                  <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="px-3 sm:px-4 py-2 sm:py-3 font-medium text-gray-900 dark:text-gray-100 sticky left-0 bg-white dark:bg-gray-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      <span className="text-sm sm:text-base">{player.name}</span>
                      <span className="block text-xs text-gray-400 dark:text-gray-500">#{player.dorsal}</span>
                    </td>

                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-center bg-gray-50 dark:bg-gray-700 font-bold text-base sm:text-lg">
                      <span className={playerDebt > 0 ? "text-red-600" : "text-green-500"}>
                        ${playerDebt}
                      </span>
                    </td>

                    {events.map(event => {
                      const payment = player.payments.find(p => p.eventId === event.id)

                      if (!payment) return <td key={event.id} className="bg-gray-100 dark:bg-gray-700 text-center text-gray-300 dark:text-gray-500">-</td>

                      return (
                        <td key={event.id} className="p-1 sm:p-2 text-center border-l border-gray-100 dark:border-gray-700">
                          <form action={togglePayment.bind(null, payment.id, payment.paid)}>
                            <button className={`w-full py-1 px-1 sm:px-2 rounded text-xs font-bold transition-all shadow-sm ${
                              payment.paid
                                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 border border-green-200 dark:border-green-700'
                                : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 border border-red-200 dark:border-red-700'
                            }`}>
                              {payment.paid ? '✓' : 'DEBE'}
                            </button>
                          </form>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {activePlayers.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No hay jugadores activos registrados
          </div>
        )}
      </div>
    </div>
  )
}
