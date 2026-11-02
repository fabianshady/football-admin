export function SectionSkeleton({ title, variant = 'cards' }: { title: string; variant?: 'cards' | 'table' | 'form' }) {
  return (
    <section aria-busy="true" aria-label={`Cargando ${title}`}>
      <h1 className="page-title">{title}</h1>
      <p role="status" className="page-subtitle">Cargando información…</p>
      <div aria-hidden="true" className="mt-8 space-y-4 animate-pulse">
        <div className="h-12 w-48 rounded-full bg-muted" />
        {variant === 'table' ? (
          <div className="overflow-hidden rounded-3xl border border-border p-5 space-y-4">
            {Array.from({ length: 7 }, (_, index) => <div key={index} className="h-10 rounded-xl bg-muted" />)}
          </div>
        ) : (
          <div className={variant === 'cards' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
            {Array.from({ length: variant === 'form' ? 2 : 6 }, (_, index) => <div key={index} className="h-44 rounded-3xl bg-muted" />)}
          </div>
        )}
      </div>
    </section>
  )
}
