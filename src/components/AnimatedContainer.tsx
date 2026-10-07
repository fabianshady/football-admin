'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ReactNode } from 'react'

const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
}

export function AnimatedList({ children, className }: { children: ReactNode, className?: string }) {
  const reduced = useReducedMotion()
  return (
    <motion.div initial={reduced ? false : 'hidden'} animate="visible" variants={variants} className={className}>
      {children}
    </motion.div>
  )
}

export function AnimatedItem({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  )
}

export function AnimatedPage({ children, className }: { children: ReactNode, className?: string }) {
  const reduced = useReducedMotion()
  return (
    <motion.div initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.3 }} className={className}>
      {children}
    </motion.div>
  )
}
