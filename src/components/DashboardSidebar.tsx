'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClubLogo } from '@/components/ClubLogo'
import LogoutButton from '@/components/LogoutButton'
import { cn } from '@/lib/utils'
import { ThemeControl } from '@/components/ThemeControl'

const gestion = [
  { href: '/admin/players', label: 'Jugadores', emoji: '🏃' },
  { href: '/admin/payments', label: 'Pagos y Deudas', emoji: '💸' },
  { href: '/admin/seasons', label: 'Temporadas', emoji: '📅' },
  { href: '/admin/club', label: 'Nuestro club', emoji: '⚙️' },
]

const cancha = [
  { href: '/admin/matches', label: 'Partidos', emoji: '🏟️' },
  { href: '/admin/goals', label: 'Goleo', emoji: '🥅' },
]

function NavLink({ href, label, emoji }: { href: string; label: string; emoji: string }) {
  const pathname = usePathname()
  const active = href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex min-h-12 items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-all',
        active
          ? 'bg-secondary text-secondary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <span className="text-base">{emoji}</span>
      <span>{label}</span>
    </Link>
  )
}

export default function DashboardSidebar() {
  return (
    <aside className="flex h-full min-h-screen w-64 shrink-0 flex-col border-r border-border bg-card text-foreground">
      <div className="border-b border-gold/15 p-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gold/25 blur-md animate-pulse-soft" />
            <ClubLogo size="sm" className="relative glow-primary" />
          </div>
          <div>
            <div className="font-display text-lg font-bold leading-none tracking-wide">
              ITJAGUARS
            </div>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
              Admin
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        <NavLink href="/" label="Dashboard" emoji="🏠" />

        <div className="mb-2 mt-5 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gold/50">
          Gestión
        </div>
        {gestion.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}

        <div className="mb-2 mt-5 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gold/50">
          Cancha
        </div>
        {cancha.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      <div className="border-t border-gold/15 p-3">
        <div className="mb-4"><ThemeControl /></div>
        <LogoutButton />
        <p className="mt-2 text-center text-xs text-muted-foreground">
          fabianshady &copy; {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  )
}
