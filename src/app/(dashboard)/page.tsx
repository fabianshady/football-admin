import Link from 'next/link'
import { AnimatedPage, AnimatedList, AnimatedItem } from '@/components/AnimatedContainer'

const cards = [
  {
    href: '/admin/payments',
    emoji: '💸',
    title: 'Cobrar Cuotas',
    desc: 'Revisa quién no ha pagado el arbitraje.',
    color: 'emerald',
    hover: 'hover:border-emerald-500/40 hover:shadow-emerald-500/10',
    iconBg: 'bg-emerald-500/20 group-hover:bg-emerald-500/30',
    titleHover: 'group-hover:text-emerald-400',
  },
  {
    href: '/admin/matches',
    emoji: '🏟️',
    title: 'Partidos',
    desc: 'Registra el resultado del fin de semana.',
    color: 'blue',
    hover: 'hover:border-blue-500/40 hover:shadow-blue-500/10',
    iconBg: 'bg-blue-500/20 group-hover:bg-blue-500/30',
    titleHover: 'group-hover:text-blue-400',
  },
  {
    href: '/admin/players',
    emoji: '🌟',
    title: 'Plantilla',
    desc: 'Agrega o baja jugadores, y sus posiciones.',
    color: 'amber',
    hover: 'hover:border-amber-500/40 hover:shadow-amber-500/10',
    iconBg: 'bg-amber-500/20 group-hover:bg-amber-500/30',
    titleHover: 'group-hover:text-amber-400',
  },
  {
    href: '/admin/goals',
    emoji: '⚽',
    title: 'Goleadores',
    desc: 'Lleva la cuenta de quién mete golazos.',
    color: 'rose',
    hover: 'hover:border-rose-500/40 hover:shadow-rose-500/10',
    iconBg: 'bg-rose-500/20 group-hover:bg-rose-500/30',
    titleHover: 'group-hover:text-rose-400',
  },
  {
    href: '/admin/seasons',
    emoji: '📅',
    title: 'Temporadas',
    desc: 'Administra temporadas y la temporada activa.',
    color: 'violet',
    hover: 'hover:border-violet-500/40 hover:shadow-violet-500/10',
    iconBg: 'bg-violet-500/20 group-hover:bg-violet-500/30',
    titleHover: 'group-hover:text-violet-400',
  },
]

export default function Home() {
  return (
    <AnimatedPage className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-6 sm:p-10 text-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center text-4xl shadow-2xl shadow-blue-500/40 mx-auto mb-6">
          ⚽
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
          Bienvenido al<br />
          <span className="text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">Vestidor, Capi</span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
          Aquí es donde se ganan los campeonatos. Gestiona la lana, la alineación y los goles.
        </p>
      </div>

      <AnimatedList className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-3xl">
        {cards.map((card) => (
          <AnimatedItem key={card.href}>
            <Link
              href={card.href}
              className={`group block p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl backdrop-blur-sm transition-all duration-300 text-left hover:shadow-xl hover:-translate-y-0.5 ${card.hover}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4 transition-colors ${card.iconBg}`}>
                {card.emoji}
              </div>
              <h3 className={`text-base font-bold text-white transition-colors mb-1 ${card.titleHover}`}>{card.title}</h3>
              <p className="text-slate-400 text-sm">{card.desc}</p>
            </Link>
          </AnimatedItem>
        ))}
      </AnimatedList>
    </AnimatedPage>
  )
}
