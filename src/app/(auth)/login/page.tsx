import { login } from '@/app/actions/auth'
import { ClubLogo } from '@/components/ClubLogo'
import { ThemeControl } from '@/components/ThemeControl'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const params = await searchParams
    const errorMessage = params?.error

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
            <div className="relative z-10 w-full max-w-md">
                <div className="mb-6 flex justify-end"><ThemeControl /></div>
                <div className="mb-8 text-center">
                    <div className="relative mx-auto mb-5 w-fit">
                        <div className="absolute -inset-2 rounded-full bg-gold/20 blur-xl animate-pulse-soft" />
                        <ClubLogo size="lg" className="relative glow-primary" />
                    </div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                        Panel de control
                    </p>
                    <h1 className="font-display text-4xl font-bold tracking-wide">
                        <span className="gradient-text">ITJAGUARS</span>
                    </h1>
                    <p className="mt-1.5 text-sm text-muted-foreground">Admin del vestidor</p>
                </div>

                <div className="glass-card rounded-3xl p-8 shadow-2xl">
                    <h2 className="font-display text-2xl font-bold text-foreground">Iniciar sesión</h2>
                    <p className="mb-6 mt-1 text-sm text-muted-foreground">
                        Ingresa tus credenciales para acceder al vestidor
                    </p>

                    {errorMessage && (
                        <div className="mb-5 flex items-start gap-3 rounded-xl border border-banner/30 bg-banner/10 px-4 py-3">
                            <span className="mt-0.5 text-lg leading-none text-banner">⚠️</span>
                            <p className="text-sm text-banner">{errorMessage}</p>
                        </div>
                    )}

                    <form action={login} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="field-label">
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="capi@tuequipo.com"
                                required
                                className="field-input"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="field-label">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                className="field-input"
                            />
                        </div>

                        <button type="submit" className="btn-primary mt-2 w-full py-3">
                            Entrar al vestidor
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                    fabianshady &copy; {new Date().getFullYear()}
                </p>
            </div>
        </div>
    )
}
