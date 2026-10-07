import { Suspense } from 'react'
import { getPaymentMatrix, deleteEvent } from '@/app/actions/payments'
import PaymentToggle from '@/components/PaymentToggle'
import { getSeasons, resolveSeasonId } from '@/app/actions/seasons'
import EventForm from '@/components/EventForm'
import SeasonFilter from '@/components/SeasonFilter'
import { AnimatedPage, AnimatedList, AnimatedItem } from '@/components/AnimatedContainer'
import { formatCalendarDate } from '@/lib/dateUtils'

type Props = {
  searchParams: Promise<{ season?: string }>
}

export default async function PaymentsPage({ searchParams }: Props) {
  const params = await searchParams
  const seasons = await getSeasons()
  const seasonId = await resolveSeasonId(params.season)
  const { events, players } = await getPaymentMatrix(seasonId)
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

  const currentSeason = seasons.find(s => s.id === seasonId)

  return (
    <AnimatedPage>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="page-title">Pagos y Deudas</h1>
          <p className="page-subtitle">
            Control de cuotas y cobros
            {currentSeason ? ` · ${currentSeason.name}` : ''}
          </p>
        </div>
        <div className="glass-card rounded-xl px-4 py-3">
          <Suspense fallback={<div className="text-xs text-muted-foreground">Cargando…</div>}>
            <SeasonFilter seasons={seasons} selectedId={seasonId} />
          </Suspense>
        </div>
      </div>

      <AnimatedList className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <AnimatedItem className="glass-card rounded-2xl p-4 sm:p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Jugadores activos</p>
          <p className="font-display text-3xl font-bold tabular-nums text-foreground">{activePlayers.length}</p>
        </AnimatedItem>
        <AnimatedItem className="glass-card rounded-2xl border-banner/30 p-4 sm:p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-banner">Por cobrar</p>
          <p className="font-display text-3xl font-bold tabular-nums text-banner">${totalDebt.toFixed(0)}</p>
        </AnimatedItem>
        <AnimatedItem className="glass-card rounded-2xl border-emerald-500/30 p-4 sm:p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-500">Cobrado</p>
          <p className="font-display text-3xl font-bold tabular-nums text-emerald-600">${totalPaid.toFixed(0)}</p>
        </AnimatedItem>
        <AnimatedItem className="glass-card rounded-2xl p-4 sm:p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gold">Cobranza</p>
          <p className="font-display text-3xl font-bold tabular-nums text-gold">{collectionRate}%</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-gradient-to-r from-gold to-banner" style={{ width: `${collectionRate}%` }} />
          </div>
        </AnimatedItem>
      </AnimatedList>

      <EventForm seasons={seasons} defaultSeasonId={seasonId} />

      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="border-b border-border/50 px-5 py-4">
          <h2 className="font-display font-bold tracking-wide text-foreground">Estado de Pagos</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {events.length} evento{events.length !== 1 ? 's' : ''} &bull; {activePlayers.length} jugador{activePlayers.length !== 1 ? 'es' : ''}
            {currentSeason ? ` · Temp. ${currentSeason.name}` : ''}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px] text-left text-sm">
            <thead>
              <tr className="bg-secondary text-secondary-foreground">
                <th className="sticky left-0 z-10 w-36 bg-secondary px-4 py-3.5 text-xs font-semibold uppercase tracking-wide sm:w-48">
                  Jugador
                </th>
                <th className="w-28 bg-secondary px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-banner">
                  Deuda
                </th>
                {events.map((event: any) => (
                  <th key={event.id} className="group relative min-w-[110px] border-l border-white/10 px-3 py-3.5 text-center">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-gold">${event.cost}</span>
                      <span className="max-w-[90px] truncate text-[11px] text-secondary-foreground">{event.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatCalendarDate(event.date, { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <form action={deleteEvent.bind(null, event.id)} className="mt-2">
                      <button aria-label={`Eliminar cobro ${event.name}`} className="rounded-full px-3 text-xs text-banner hover:bg-banner/10">Eliminar</button>
                    </form>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {activePlayers.map((player: any) => {
                const playerDebt = player.payments
                  .filter((p: any) => !p.paid)
                  .reduce((acc: number, curr: any) => {
                    const event = events.find((e: any) => e.id === curr.eventId)
                    return acc + (event ? event.cost : 0)
                  }, 0)

                return (
                  <tr key={player.id} className="transition-colors hover:bg-muted/40">
                    <td className="sticky left-0 bg-card/90 px-4 py-3 font-semibold shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)] backdrop-blur">
                      <span className="block text-sm text-foreground">{player.name}</span>
                      <span className="text-[11px] text-muted-foreground">#{player.dorsal}</span>
                    </td>
                    <td className="bg-muted/30 px-4 py-3 text-center font-display text-lg font-bold">
                      <span className={playerDebt > 0 ? 'text-banner' : 'text-emerald-500'}>
                        ${playerDebt.toFixed(0)}
                      </span>
                    </td>
                    {events.map((event: any) => {
                      const payment = player.payments.find((p: any) => p.eventId === event.id)
                      if (!payment) return (
                        <td key={event.id} className="border-l border-border/30 p-2 text-center">
                          <span className="text-xs text-muted-foreground">—</span>
                        </td>
                      )
                      return (
                        <td key={event.id} className="border-l border-border/30 p-1.5 text-center">
                          <PaymentToggle id={payment.id} paid={payment.paid} />
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {events.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            <p className="mb-3 text-4xl">💸</p>
            <p className="font-medium">No hay cobros en esta temporada</p>
            <p className="mt-1 text-sm">Crea un nuevo cobro o cambia el filtro de temporada</p>
          </div>
        )}
        {events.length > 0 && activePlayers.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            <p className="mb-3 text-4xl">💸</p>
            <p className="font-medium">No hay jugadores activos registrados</p>
          </div>
        )}
      </div>
    </AnimatedPage>
  )
}
