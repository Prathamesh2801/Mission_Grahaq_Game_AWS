import { motion } from 'framer-motion'

// Chhavi's pixel speech bubble. `tail` is the side pointing at her.
const TAIL = {
  right: 'top-1/2 -right-[2.6rem] -translate-y-1/2',
  left: 'top-1/2 -left-[2.6rem] -translate-y-1/2 -scale-x-100',
  bottom: 'left-[72%] -bottom-[2.9rem] rotate-90',
}

export default function SpeechBubble({ children, tail = 'right', className = '' }) {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      // the tail needs a positioned bubble, but Tailwind would let this `relative` beat a caller's `absolute`
      className={`pixel-bubble ${/(^|\s)(absolute|fixed|sticky)/.test(className) ? '' : 'relative'} px-8 py-5 text-center leading-tight ${className}`}
    >
      {children}
      {/* stepped pixel tail */}
      <svg viewBox="0 0 6 6" className={`absolute size-[3rem] ${TAIL[tail]}`} shapeRendering="crispEdges" aria-hidden>
        <path d="M0 1h1v1h1v1h1v1h-1v1h-1v1h-1z" fill="var(--color-ink)" />
        <path d="M0 2h1v1h1v1h-1v1h-1z" fill="var(--color-cream)" />
      </svg>
    </motion.div>
  )
}
