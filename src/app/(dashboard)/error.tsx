'use client'

export default function DashboardError({ reset }: { reset: () => void }) {
  return <section role="alert" className="glass-card rounded-2xl p-6 space-y-4">
    <h1 className="page-title">No se pudo cargar la sección</h1>
    <p className="text-muted-foreground">Revisa tu conexión y vuelve a cargar la sección. Si acababas de guardar un cambio, comprueba su estado antes de repetirlo.</p>
    <button type="button" className="btn-primary" onClick={reset}>Volver a intentar</button>
  </section>
}
