import { login } from '@/app/actions/auth'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const params = await searchParams
    const errorMessage = params?.error

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-3xl" />
            </div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md">
                {/* Brand */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center text-3xl shadow-2xl shadow-blue-500/40 mx-auto mb-5">
                        ⚽
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        CLUB<span className="text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">ADMIN</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1.5">Panel de Control</p>
                </div>

                {/* Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/20">
                    <h2 className="text-xl font-bold text-white mb-1">Iniciar Sesión</h2>
                    <p className="text-slate-400 text-sm mb-6">Ingresa tus credenciales para acceder al vestidor</p>

                    {/* Error */}
                    {errorMessage && (
                        <div className="mb-5 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 flex items-start gap-3">
                            <span className="text-rose-400 text-lg leading-none mt-0.5">⚠️</span>
                            <p className="text-rose-300 text-sm">{errorMessage}</p>
                        </div>
                    )}

                    <form action={login} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="capi@tuequipo.com"
                                required
                                className="w-full bg-white/5 border border-white/10 text-white placeholder:text-slate-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-white/20"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                className="w-full bg-white/5 border border-white/10 text-white placeholder:text-slate-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-white/20"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-px active:translate-y-0 mt-2"
                        >
                            Entrar al Vestidor
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-600 text-xs mt-6">
                    fabianshady &copy; {new Date().getFullYear()}
                </p>
            </div>
        </div>
    )
}
