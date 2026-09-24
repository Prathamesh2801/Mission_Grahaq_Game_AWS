import { motion } from 'framer-motion'

// Poses exported from the master .ai links (scripts/prepare-assets.py).
const poses = import.meta.glob('../../../assets/chhavi/*.webp', { eager: true, import: 'default' })

// Fetch and decode every pose up front: a pose loading when it is first shown leaves a gap.
for (const src of Object.values(poses)) {
  const img = new Image()
  img.src = src
  img.decode().catch(() => {})
}

export default function Chhavi({ pose, className }) {
  return (
    <motion.img
      src={poses[`../../../assets/chhavi/${pose}.webp`]}
      alt="Chhavi"
      draggable={false}
      initial={{ y: 30, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={className}
    />
  )
}
