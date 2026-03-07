import { getPaymentMatrix, togglePayment, deleteEvent } from '@/app/actions/payments'
import EventForm from '@/components/EventForm'

export default async function PaymentsPage() {
  const { events, players } = await getPaymentMatrix()
  const activePlayers = players.filter((p: any) => p.active)

  const totalDebt = activePlayers.reduce((acc: number, player: any) => {
    return acc + player.payments
      .filter((p: any) => !p.paid)
      .reduce((sum: number, curr: any) => {
        const event = events.find((e: any) => e.id === curr.eventId)
        return sum + (event ? event.cost : 0)
      }, 0)
  }, 0)

  const totalPaid = activePlayers.reduce((acc: number, player: any) => {
    return acc + player.payments
      .filter((p: any) => p.paid)
      .reduce((sum: number, curr: any) => {
        const event = events.find((e: any) => e.id === curr.eventId)
        return sum + (event ? event.cost : 0)
      }, 0)
  }, 0)

  const collectionRate = totalDebt + totalPaid > 0
    ? Math.round((totalPaid / (totalDebt + totalPaid)) * 100)
    : 0

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Pagos y Deudas 💸
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Control de cuotas y cobros del equipo</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Jugadores activos</p>
          <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{activePlayers.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-rose-200 dark:border-rose-900/50 shadow-sm">
          <p className="text-xs font-semibold text-rose-400 uppercase tracking-wide mb-2">Por cobrar</p>
          <p className="text-3xl font-black text-rose-600">${totalDebt.toFixed(0)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-emerald-200 dark:border-emerald-900/50 shadow-sm">
          <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wide mb-2">Cobrado</p>
          <p className="text-3xl font-black text-emerald-600">${totalPaid.toFixed(0)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-blue-200 dark:border-blue-900/50 shadow-sm">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-2">Cobranza</p>
          <p className="text-3xl font-black text-blue-600">{collectionRate}%</p>
          <div className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: `${collectionRate}%` }} />
          </div>
        </div>
      </div>

      {/* Formulario nuevo cobro */}
      <EventForm />

      {/* Matriz de pagos */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-bold text-slate-800 dark:text-slate-100">Estado de Pagos</h2>
          <p className="text-xs text-slate-400 mt-0.5">{events.length} evento{events.length !== 1 ? 's' : ''} &bull; {activePlayers.length} jugador{activePlayers.length !== 1 ? 'es' : ''}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px] text-sm text-left">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                <th className="px-4 py-3.5 sticky left-0 bg-slate-900 dark:bg-slate-950 z-10 w-36 sm:w-48 font-semibold text-xs uppercase tracking-wide">
                  Jugador
                </th>
                <th className="px-4 py-3.5 text-center bg-rose-950 w-28 font-semibold text-xs uppercase tracking-wide text-rose-300">
                  Deuda
                </th>
                {events.map((event: any) => (
                  <th key={event.id} className="px-3 py-3.5 min-w-[110px] text-center border-l border-slate-700 relative group">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-amber-400 text-sm">${event.cost}</span>
                      <span className="text-[11px] text-slate-300 truncate max-w-[90px]">{event.name}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(event.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <form action={deleteEvent.bind(null, event.id)} className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition">
                      <button className="w-4 h-4 bg-rose-500/80 hover:bg-rose-500 text-white flex items-center justify-center rounded text-[9px]">✕</button>
                    </form>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {activePlayers.map((player: any) => {
                const playerDebt = player.payments
                  .filter((p: any) => !p.paid)
                  .reduce((acc: number, curr: any) => {
                    const event = events.find((e: any) => e.id === curr.eventId)
                    return acc + (event ? event.cost : 0)
                  }, 0)

                return (
                  <tr key={player.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3 font-semibold sticky left-0 bg-white dark:bg-slate-800 shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]">
                      <span className="text-slate-800 dark:text-slate-200 text-sm block">{player.name}</span>
                      <span className="text-[11px] text-slate-400">#{player.dorsal}</span>
                    </td>
                    <td className="px-4 py-3 text-center bg-slate-50/80 dark:bg-slate-900/30 font-black text-lg">
                      <span className={playerDebt > 0 ? 'text-rose-600' : 'text-emerald-500'}>
                        ${playerDebt.toFixed(0)}
                      </span>
                    </td>
                    {events.map((event: any) => {
                      const payment = player.payments.find((p: any) => p.eventId === event.id)
                      if (!payment) return (
                        <td key={event.id} className="p-2 text-center border-l border-slate-100 dark:border-slate-700">
                          <span className="text-slate-300 dark:text-slate-600 text-xs">—</span>
                        </td>
                      )
                      return (
                        <td key={event.id} className="p-1.5 text-center border-l border-slate-100 dark:border-slate-700">
                          <form action={togglePayment.bind(null, payment.id, payment.paid)}>
                            <button className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                              payment.paid
                                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 ring-1 ring-emerald-200 dark:ring-emerald-700'
                                : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 hover:bg-rose-200 ring-1 ring-rose-200 dark:ring-rose-700'
                            }`}>
                              {payment.paid ? '✓ Pagó' : 'DEBE'}
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
          <div className="py-16 text-center text-slate-400 dark:text-slate-500">
            <p className="text-4xl mb-3">💸</p>
            <p className="font-medium">No hay jugadores activos registrados</p>
          </div>
        )}
      </div>
    </div>
  )
}
