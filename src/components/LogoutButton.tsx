'use client'

import { logout } from '@/app/actions/auth'

export default function LogoutButton() {
    return (
        <form action={logout}>
            <button
                type="submit"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 transition-all text-slate-400 hover:text-rose-400 w-full"
            >
                <span className="text-base">🚪</span>
                <span className="font-medium text-sm">Cerrar Sesión</span>
            </button>
        </form>
    )
}
