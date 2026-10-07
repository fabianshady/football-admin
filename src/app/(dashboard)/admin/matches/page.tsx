import { Suspense } from 'react'
import Image from 'next/image'
import { getMatches, deleteMatch } from '@/app/actions/matches'
import { getActivePlayers } from '@/app/actions/players'
import { getSeasons, resolveSeasonId } from '@/app/actions/seasons'
import MatchForm from '@/components/MatchForm'
import ScoreEditor from '@/components/ScoreEditor'
import MatchEditModal from '@/components/MatchEditModal'
import SeasonFilter from '@/components/SeasonFilter'
import { AnimatedPage, AnimatedList, AnimatedItem } from '@/components/AnimatedContainer'
import { formatVenueDateTime } from '@/lib/dateUtils'
import { getClubData } from '@/app/actions/club'

type Props = {
  searchParams: Promise<{ season?: string }>
}

export default async function MatchesPage({ searchParams }: Props) {
  const params = await searchParams
  const seasons = await getSeasons()
  const seasonId = await resolveSeasonId(params.season)
  const matches = await getMatches(seasonId)
  const activePlayers = await getActivePlayers()
  const { teams, slots } = await getClubData()
  const currentSeason = seasons.find(s => s.id === seasonId)

  return (
    <AnimatedPage>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="page-title">Partidos</h1>
          <p className="page-subtitle">
            Historial y resultados
            {currentSeason ? ` · ${currentSeason.name}` : ''}
          </p>
        </div>
        <div className="glass-card rounded-xl px-4 py-3">
          <Suspense fallback={<div className="text-xs text-muted-foreground">Cargando…</div>}>
            <SeasonFilter seasons={seasons} selectedId={seasonId} />
          </Suspense>
        </div>
      </div>

      <MatchForm players={activePlayers} seasons={seasons} teams={teams} slots={slots} defaultSeasonId={seasonId} />

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-base font-bold tracking-wide text-foreground">Historial</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            {matches.length} partido{matches.length !== 1 ? 's' : ''}
          </span>
        </div>

        {matches.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <p className="mb-3 text-5xl">🏟️</p>
            <p className="font-semibold text-foreground">No hay partidos en esta temporada</p>
            <p className="mt-1 text-sm text-muted-foreground">Registra un partido o cambia el filtro de temporada</p>
          </div>
        ) : (
          <AnimatedList className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match: any) => {
              const isWin = match.scoreHome > match.scoreAway
              const isLoss = match.scoreHome < match.scoreAway
              const venue = formatVenueDateTime(match.date)

              return (
                <AnimatedItem
                  key={match.id}
                  className={`glass-card hover-lift overflow-hidden rounded-2xl border-l-4 ${
                    isWin
                      ? 'border-l-emerald-500'
                      : isLoss
                      ? 'border-l-banner'
                      : 'border-l-gold'
                  }`}
                >
                  <div className="p-4 sm:p-5">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border/40 bg-muted/40 p-1 shadow-sm" title={`Uniforme ${match.kit || 1}`}>
                          <Image
                            width={36}
                            height={36}
                            src={match.kit === 2
                              ? "https://vpl0mb2pgnbucvy2.public.blob.vercel-storage.com/2u.png"
                              : "https://vpl0mb2pgnbucvy2.public.blob.vercel-storage.com/1u.png"
                            }
                            alt={`Uniforme ${match.kit || 1}`}
                            className="max-h-full max-w-full object-contain drop-shadow-sm"
                          />
                        </div>
                        <div>
                          <span className="block text-xs font-semibold capitalize text-muted-foreground">
                            {venue.date}
                          </span>
                          <span className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-gold">
                            🕐 {venue.time} Tijuana
                          </span>
                          {match.season?.name && (
                            <span className="mt-0.5 block text-[10px] font-semibold text-banner">
                              📅 {match.season.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isWin
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : isLoss
                            ? 'bg-banner/15 text-banner'
                            : 'bg-gold/15 text-gold'
                        }`}>
                          {isWin ? 'VICTORIA' : isLoss ? 'DERROTA' : 'EMPATE'}
                        </span>
                         <MatchEditModal match={match} players={activePlayers} seasons={seasons} teams={teams} slots={slots} />
                        <form action={deleteMatch.bind(null, match.id)}>
                          <button aria-label={`Eliminar partido contra ${match.rivalTeam}`} className="flex h-6 w-6 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground transition-all hover:bg-banner/15 hover:text-banner">
                            ✕
                          </button>
                        </form>
                      </div>
                    </div>

                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex-1 pr-3 text-right">
                        <p className="text-[10px] text-muted-foreground">Nosotros</p>
                        <p className="truncate text-sm font-bold text-foreground">{match.team?.name || match.myTeam}</p>
                        <p className="text-[10px] font-medium text-muted-foreground">Pos {match.myPos}°</p>
                      </div>
                      <ScoreEditor
                        matchId={match.id}
                        initialHome={match.scoreHome}
                        initialAway={match.scoreAway}
                        isWin={isWin}
                        isLoss={isLoss}
                      />
                      <div className="flex-1 pl-3">
                        <p className="text-[10px] text-muted-foreground">Rival</p>
                        <p className="truncate text-sm font-bold text-foreground">{match.rivalTeam}</p>
                        <p className="text-[10px] font-medium text-muted-foreground">Pos {match.rivalPos}°</p>
                      </div>
                    </div>

                    <p className="text-center text-xs font-medium text-muted-foreground">
                      📍 {match.location}
                    </p>

                    {match.squad && match.squad.length > 0 && (
                      <div className="mt-3 border-t border-border/40 pt-3">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                          Convocados ({match.squad.length})
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {match.squad.map((s: any) => (
                            <span key={s.id} className="rounded-full bg-navy/10 px-2 py-0.5 text-[10px] font-medium text-navy dark:bg-gold/15 dark:text-gold">
                              {s.player.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {match.goals && match.goals.length > 0 && (
                      <div className="mt-2 border-t border-border/40 pt-2">
                        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                          ⚽ Goleadores
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {match.goals.map((g: any) => (
                            <span key={g.id} className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-medium text-gold">
                              {g.player.name}{g.minute ? ` (${g.minute}')` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AnimatedItem>
              )
            })}
          </AnimatedList>
        )}
      </div>
    </AnimatedPage>
  )
}
