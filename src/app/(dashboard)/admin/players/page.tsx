import { getPlayers } from '@/lib/data/players'
import { getTeams } from '@/lib/data/club'
import PlayerRoster from '@/components/PlayerRoster'
import { AnimatedPage } from '@/components/AnimatedContainer'

export default async function PlayersPage() {
  const [players, teams] = await Promise.all([getPlayers(), getTeams()])
  return <AnimatedPage><div className="mb-8"><h1 className="page-title">Plantilla</h1><p className="page-subtitle">Posiciones, dorsales y afiliaciones actuales. Desactiva para conservar el historial.</p></div><PlayerRoster players={players} teams={teams} /></AnimatedPage>
}
