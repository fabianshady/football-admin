export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-6 sm:p-10 text-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Hero */}
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

      {/* Nav Cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        <a
          href="/admin/payments"
          className="group p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/40 rounded-2xl backdrop-blur-sm transition-all duration-300 text-left hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:bg-emerald-500/30 transition-colors">
            💸
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors mb-1">Cobrar Cuotas</h3>
          <p className="text-slate-400 text-sm">Revisa quién no ha pagado el arbitraje.</p>
        </a>

        <a
          href="/admin/matches"
          className="group p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/40 rounded-2xl backdrop-blur-sm transition-all duration-300 text-left hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:bg-blue-500/30 transition-colors">
            🏟️
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors mb-1">Partidos</h3>
          <p className="text-slate-400 text-sm">Registra el resultado del fin de semana.</p>
        </a>

        <a
          href="/admin/players"
          className="group p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 rounded-2xl backdrop-blur-sm transition-all duration-300 text-left hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:bg-amber-500/30 transition-colors">
            🌟
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors mb-1">Plantilla</h3>
          <p className="text-slate-400 text-sm">Agrega o baja jugadores, y sus posiciones.</p>
        </a>

        <a
          href="/admin/goals"
          className="group p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-rose-500/40 rounded-2xl backdrop-blur-sm transition-all duration-300 text-left hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:bg-rose-500/30 transition-colors">
            ⚽
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-rose-400 transition-colors mb-1">Goleadores</h3>
          <p className="text-slate-400 text-sm">Lleva la cuenta de quién mete golazos.</p>
        </a>
      </div>
    </div>
  )
}
