import Link from 'next/link'
import { AnimatedPage, AnimatedList, AnimatedItem } from '@/components/AnimatedContainer'
import { ClubLogo } from '@/components/ClubLogo'

const cards = [
  {
    href: '/admin/payments',
    emoji: '💸',
    title: 'Cobrar Cuotas',
    desc: 'Revisa quién no ha pagado el arbitraje.',
    icon: 'bg-emerald-500/10 text-emerald-500',
  },
  {
    href: '/admin/matches',
    emoji: '🏟️',
    title: 'Partidos',
    desc: 'Registra el resultado del fin de semana.',
    icon: 'bg-sky-500/10 text-sky-500',
  },
  {
    href: '/admin/players',
    emoji: '🌟',
    title: 'Plantilla',
    desc: 'Agrega o baja jugadores, y sus posiciones.',
    icon: 'bg-gold/15 text-gold',
  },
  {
    href: '/admin/goals',
    emoji: '⚽',
    title: 'Goleadores',
    desc: 'Lleva la cuenta de quién mete golazos.',
    icon: 'bg-banner/10 text-banner',
  },
  {
    href: '/admin/seasons',
    emoji: '📅',
    title: 'Temporadas',
    desc: 'Administra temporadas y la temporada activa.',
    icon: 'bg-violet-500/10 text-violet-500',
  },
]

export default function Home() {
  return (
    <AnimatedPage className="animate-fade-in">
      <header className="mb-10">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-gold/20 blur-xl animate-pulse-soft" />
            <ClubLogo size="md" className="relative glow-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
              Vestidor
            </p>
            <h1 className="font-display text-4xl font-bold tracking-wide sm:text-5xl">
              Bienvenido, <span className="gradient-text">Capi</span>
            </h1>
            <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
              Aquí es donde se ganan los campeonatos. Gestiona la lana, la alineación y los goles.
            </p>
          </div>
        </div>
        <div className="mt-6 h-px bg-gradient-to-r from-gold/70 via-banner/30 to-transparent" />
      </header>

      <AnimatedList className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <AnimatedItem key={card.href}>
            <Link
              href={card.href}
              className="glass-card hover-lift group block rounded-2xl p-6 text-left"
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-xl transition-transform group-hover:scale-105 ${card.icon}`}>
                {card.emoji}
              </div>
              <h3 className="font-display text-lg font-bold tracking-wide text-foreground group-hover:text-gold">
                {card.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{card.desc}</p>
            </Link>
          </AnimatedItem>
        ))}
      </AnimatedList>
    </AnimatedPage>
  )
}
