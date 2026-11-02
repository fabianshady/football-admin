import type { ReactNode } from 'react'

export function AnimatedList({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

export function AnimatedItem({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

export function AnimatedPage({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}
