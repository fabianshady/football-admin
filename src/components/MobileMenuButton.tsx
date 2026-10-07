'use client'

import { useEffect, useState } from 'react'

export default function MobileMenuButton({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-[60] rounded-full border border-border bg-card p-3 text-foreground shadow-sm lg:hidden"
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={isOpen}
        aria-controls="dashboard-navigation"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        id="dashboard-navigation"
        className={`
          fixed z-50 h-full self-stretch transition-transform duration-300 ease-in-out
          lg:static lg:h-auto lg:translate-x-0
          ${isOpen ? 'visible translate-x-0' : 'invisible -translate-x-full lg:visible'}
        `}
        onClick={event => { if ((event.target as HTMLElement).closest('a')) setIsOpen(false) }}
      >
        {children}
      </div>
    </>
  )
}
