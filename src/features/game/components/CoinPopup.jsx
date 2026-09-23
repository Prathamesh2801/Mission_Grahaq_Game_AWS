import { motion } from 'framer-motion'
import coin from '../../../assets/ui/coin.webp'

// Coin + points above a card (artboards 10–17), one row per award, rising and fading out.
export default function CoinPopup({ awards, className = '', style }) {
  return (
    <div className={`pointer-events-none absolute flex flex-col-reverse gap-2 ${className}`} style={style}>
      {awards.map((a, i) => (
        <motion.div
          key={a.label}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: -30, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.4, delay: i * 0.15, times: [0, 0.15, 0.7, 1] }}
          className="flex items-center gap-4 whitespace-nowrap"
        >
          <img src={coin} alt="" className="w-[3.6rem]" />
          <span className="pixel-number text-[2.6rem]">{a.label}</span>
        </motion.div>
      ))}
    </div>
  )
}
