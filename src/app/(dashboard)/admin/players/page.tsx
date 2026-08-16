import { getPlayers, savePlayer } from '@/app/actions/players'
import { AnimatedPage, AnimatedList, AnimatedItem } from '@/components/AnimatedContainer'
import PlayerCard from '@/components/PlayerCard'

const POSITION_GROUPS = ['Portero', 'Defensa', 'Mediocentro', 'Lateral', 'Delantero', 'Cuerpo Técnico']

export default async function PlayersPage() {
  const players = await getPlayers()

  return (
    <AnimatedPage>
      <div className="mb-8">
        <h1 className="page-title">Plantilla</h1>
        <p className="page-subtitle">
          Gestiona los cracks del equipo · clic en Editar para cambiar nombre, posición o dorsal
        </p>
      </div>

      <div className="glass-card mb-8 rounded-2xl p-5 sm:p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-base font-bold tracking-wide text-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy text-xs text-navy-foreground dark:bg-gold dark:text-navy">+</span>
          Nuevo Fichaje
        </h2>
        <form action={savePlayer} className="flex flex-col flex-wrap gap-3 sm:flex-row sm:items-end">
          <div className="w-full sm:w-auto">
            <label className="field-label">Nombre</label>
            <input
              name="name" type="text" placeholder="Ej: Jack Grealish" required
              className="field-input sm:w-64"
            />
          </div>
          <div className="w-24">
            <label className="field-label">Dorsal</label>
            <input
              name="dorsal" type="number" placeholder="11" required
              className="field-input"
            />
          </div>
          <div className="min-w-0 flex-1">
            <label className="field-label">Posiciones (sep. por comas)</label>
            <input
              name="positions" type="text" placeholder="Delantero, Extremo" required
              className="field-input"
            />
          </div>
          <button type="submit" className="btn-primary w-full sm:w-auto">
            Registrar
          </button>
        </form>
      </div>

      <div className="space-y-8">
        {POSITION_GROUPS.map((group) => {
          const groupPlayers = players.filter(p => p.positions[0] === group)
          if (groupPlayers.length === 0) return null

          return (
            <section key={group}>
              <div className="mb-4 flex items-center gap-3">
                <h3 className="font-display text-lg font-bold tracking-wide text-foreground">{group}s</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                  {groupPlayers.length}
                </span>
              </div>

              <AnimatedList className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      {players.filter(p => !POSITION_GROUPS.includes(p.positions[0] || '')).length > 0 && (
        <div className="mt-10">
          <div className="mb-4 flex items-center gap-3">
            <h3 className="font-display text-base font-bold text-muted-foreground">Sin clasificación</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {players.filter(p => !POSITION_GROUPS.includes(p.positions[0] || '')).map(p => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>
        </div>
      )}
    </AnimatedPage>
  )
}
