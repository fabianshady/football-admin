'use client'

import { logout } from '@/app/actions/auth'

export default function LogoutButton() {
    return (
        <form action={logout}>
            <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-navy-foreground/70 transition-all hover:bg-banner/15 hover:text-banner"
            >
                <span className="text-base">🚪</span>
                <span className="text-sm font-medium">Cerrar Sesión</span>
            </button>
        </form>
    )
}
