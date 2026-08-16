import { Suspense } from 'react'
import { getTopScorers, getMatchesWithGoals } from '@/app/actions/goals'
import { getSeasons, resolveSeasonId } from '@/app/actions/seasons'
import GoalLogger from '@/components/GoalLogger'
import SeasonFilter from '@/components/SeasonFilter'
import { AnimatedPage, AnimatedList, AnimatedItem } from '@/components/AnimatedContainer'

type Props = {
  searchParams: Promise<{ season?: string }>
}

export default async function GoalsPage({ searchParams }: Props) {
  const params = await searchParams
  const seasons = await getSeasons()
  const seasonId = await resolveSeasonId(params.season)
  const topScorers = await getTopScorers(seasonId)
  const matches = await getMatchesWithGoals(seasonId)
  const currentSeason = seasons.find(s => s.id === seasonId)

  const first = topScorers[0] || null
  const second = topScorers[1] || null
  const third = topScorers[2] || null

  return (
    <AnimatedPage>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="page-title">Tabla de Goleo</h1>
          <p className="page-subtitle">
            {topScorers.reduce((a: number, s: any) => a + s.goals, 0)} goles en {matches.length} partido{matches.length !== 1 ? 's' : ''}
            {currentSeason ? ` · ${currentSeason.name}` : ''}
          </p>
        </div>
        <div className="glass-card rounded-xl px-4 py-3">
          <Suspense fallback={<div className="text-xs text-muted-foreground">Cargando…</div>}>
            <SeasonFilter seasons={seasons} selectedId={seasonId} />
          </Suspense>
        </div>
      </div>

      {topScorers.length > 0 && (
        <AnimatedItem className="mx-auto mb-10 max-w-lg">
          <div className="flex items-end justify-center gap-2 sm:gap-4">
            <div className="flex-1 text-center">
              <div className="glass-card rounded-2xl rounded-b-none px-3 pb-3 pt-4">
                <div className="mb-2 text-2xl sm:text-3xl">🥈</div>
                <p className="truncate text-xs font-bold text-foreground">{second?.name || '—'}</p>
                <p className="font-display text-2xl font-bold tabular-nums text-muted-foreground">{second?.goals ?? 0}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">goles</p>
              </div>
              <div className="h-8 rounded-b-xl bg-muted" />
            </div>

            <div className="flex-1 text-center">
              <div className="rounded-2xl rounded-b-none border-2 border-gold bg-gold/10 px-3 pb-3 pt-5 shadow-lg shadow-gold/20">
                <div className="mb-2 text-3xl sm:text-4xl">🥇</div>
                <p className="truncate text-sm font-bold text-foreground">{first?.name || '—'}</p>
                <p className="font-display text-3xl font-bold tabular-nums text-gold">{first?.goals ?? 0}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gold">goles</p>
              </div>
              <div className="h-12 rounded-b-xl bg-gradient-to-b from-gold to-[hsl(42_73%_38%)]" />
            </div>

            <div className="flex-1 text-center">
              <div className="glass-card rounded-2xl rounded-b-none px-3 pb-3 pt-4">
                <div className="mb-2 text-2xl sm:text-3xl">🥉</div>
                <p className="truncate text-xs font-bold text-foreground">{third?.name || '—'}</p>
                <p className="font-display text-2xl font-bold tabular-nums text-banner">{third?.goals ?? 0}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">goles</p>
              </div>
              <div className="h-6 rounded-b-xl bg-banner/40" />
            </div>
          </div>
        </AnimatedItem>
      )}

      <AnimatedList className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AnimatedItem className="lg:col-span-1">
          <div className="glass-card sticky top-4 overflow-hidden rounded-2xl">
            <div className="border-b border-border/50 bg-gold/5 px-5 py-4">
              <h2 className="flex items-center gap-2 font-display font-bold tracking-wide text-foreground">
                <span>🏆</span> Clasificación
              </h2>
            </div>
            {topScorers.length === 0 ? (
              <div className="p-8 text-center">
                <p className="mb-2 text-3xl">⚽</p>
                <p className="text-sm text-muted-foreground">Aún no cae el primero en esta temporada.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {topScorers.map((scorer: any, index: number) => (
                  <div key={scorer.name} className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/40">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                        index === 0 ? 'bg-gold/20 text-gold' :
                        index === 1 ? 'bg-muted text-muted-foreground' :
                        index === 2 ? 'bg-banner/15 text-banner' :
                        'bg-muted/50 text-muted-foreground'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-bold leading-tight text-foreground">{scorer.name}</p>
                        <p className="text-[10px] text-muted-foreground">#{scorer.dorsal} &bull; {scorer.matchesPlayed} PJ</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-display text-lg font-bold tabular-nums text-gold">{scorer.goals}</span>
                      <p className="text-[10px] text-muted-foreground">
                        {scorer.matchesPlayed > 0 ? (scorer.goals / scorer.matchesPlayed).toFixed(2) : '0.00'}/PJ
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </AnimatedItem>

        <AnimatedItem className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="font-display text-base font-bold tracking-wide text-foreground">Registro por Partido</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
          </div>
          <GoalLogger matches={matches} />
        </AnimatedItem>
      </AnimatedList>
    </AnimatedPage>
  )
}
