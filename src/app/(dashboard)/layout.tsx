import Link from "next/link";
import MobileMenuButton from "@/components/MobileMenuButton";
import LogoutButton from "@/components/LogoutButton";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            <MobileMenuButton>
                {/* SIDEBAR */}
                <aside className="w-64 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col h-full shadow-2xl border-r border-slate-800/50">
                    {/* Brand */}
                    <div className="p-5 border-b border-slate-800/60">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-blue-500/30 flex-shrink-0">
                                ⚽
                            </div>
                            <div>
                                <div className="text-lg font-black tracking-tight leading-none">
                                    CLUB<span className="text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">ADMIN</span>
                                </div>
                                <p className="text-slate-500 text-[10px] font-semibold tracking-widest uppercase mt-0.5">Panel de Control</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                        <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 transition-all text-slate-400 hover:text-white">
                            <span className="text-base">🏠</span>
                            <span className="font-medium text-sm">Dashboard</span>
                        </Link>

                        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-5 mb-2 px-4">Gestión</div>

                        <Link href="/admin/players" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 transition-all text-slate-400 hover:text-white">
                            <span className="text-base">🏃</span>
                            <span className="font-medium text-sm">Jugadores</span>
                        </Link>
                        <Link href="/admin/payments" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 transition-all text-slate-400 hover:text-white">
                            <span className="text-base">💸</span>
                            <span className="font-medium text-sm">Pagos y Deudas</span>
                        </Link>

                        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-5 mb-2 px-4">Cancha</div>

                        <Link href="/admin/matches" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 transition-all text-slate-400 hover:text-white">
                            <span className="text-base">🏟️</span>
                            <span className="font-medium text-sm">Partidos</span>
                        </Link>
                        <Link href="/admin/goals" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 transition-all text-slate-400 hover:text-white">
                            <span className="text-base">🥅</span>
                            <span className="font-medium text-sm">Goleo</span>
                        </Link>
                    </nav>

                    <div className="p-3 border-t border-slate-800/60">
                        <LogoutButton />
                        <p className="text-xs text-slate-600 text-center mt-2">fabianshady &copy; {new Date().getFullYear()}</p>
                    </div>
                </aside>
            </MobileMenuButton>

            {/* MAIN CONTENT */}
            <main className="flex-1 min-h-screen overflow-y-auto bg-slate-50 dark:bg-slate-900 lg:ml-0 pt-16 lg:pt-0">
                {children}
            </main>
        </div>
    );
}
