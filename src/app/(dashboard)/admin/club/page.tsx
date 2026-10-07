import { getClubData } from '@/app/actions/club'
import ClubSettingsForm from '@/components/ClubSettingsForm'
import { WEEKDAYS } from '@/lib/club'

export default async function ClubPage() {
  const { teams, slots, settings } = await getClubData()
  return <div className="space-y-8">
    <header><p className="eyebrow">Administración</p><h1 className="page-title mt-3">Nuestro club</h1><p className="page-subtitle">Contacto, cuota semanal y calendario de los equipos.</p></header>
    <ClubSettingsForm settings={settings} />
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Equipos y calendario</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {teams.map(team => <article key={team.id} className="glass-card rounded-3xl p-6">
          <p className="eyebrow">{WEEKDAYS[team.match_weekday]}</p>
          <h3 className="mt-3 text-xl font-semibold">{team.name}</h3>
          {team.league_name && <p className="mt-2 text-sm text-muted-foreground">{team.league_name}</p>}
          <p className="mt-4 text-sm text-muted-foreground">{slots.map(slot => slot.time.slice(0, 5)).join(' · ')} · Tijuana</p>
        </article>)}
      </div>
      {!teams.length && <p className="rounded-3xl bg-muted p-6 text-muted-foreground">No hay equipos configurados.</p>}
    </section>
  </div>
}
