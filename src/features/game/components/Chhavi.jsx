import { motion } from 'framer-motion'

// Poses exported from the master .ai links (scripts/prepare-assets.py).
const poses = import.meta.glob('../../../assets/chhavi/*.webp', { eager: true, import: 'default' })

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
