import { motion } from 'framer-motion'

// Chhavi's speech bubble, cut from the artboards by scripts/prepare-assets.py.
// Lettered bubbles carry their copy in the image. A blank bubble takes `children` as its line,
// laid over the bubble's body (`textClassName` places it clear of the tail).
// Size it with a `w-[…]` from the caller, like any image.
export default function SpeechBubble({ src, alt, children, textClassName = '', className = '' }) {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      // the overlaid line needs a positioned bubble, but Tailwind would let this `relative` beat a caller's `absolute`
      className={`${/(^|\s)(absolute|fixed|sticky)/.test(className) ? '' : 'relative'} ${className}`}
    >
      <img src={src} alt={children ? '' : alt} draggable={false} className="block w-full" />
      {children && (
        <span className={`absolute grid place-items-center text-center leading-none font-bold text-black ${textClassName}`}>
          {children}
        </span>
      )}
    </motion.div>
  )
}
