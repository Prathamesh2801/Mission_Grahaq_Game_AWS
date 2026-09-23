import { motion } from 'framer-motion'
import Sprite from './Sprite'
import CoinPopup from './CoinPopup'
import shieldOk from '../../../assets/ui/shield-ok.webp'
import shieldBad from '../../../assets/ui/shield-bad.webp'

// Card geometry measured off the artboards / final_v1.mp4 (artboard px ÷ 16 = rem).
const LEFT_REM = 13.9
const WIDTH_REM = 39.8
const SLOT_TOP_REM = [23.7, 44.25, 64.3]

// One shopping message, parked in its slot for the round.
// Tapped: the icon becomes a ✓ / ✗ shield and the coins fly up. Then the card fades out.
export default function FeedItem({ item, result, onTap }) {
  const status = result?.status
  const tapped = status === 'hit' || status === 'wrong'

  return (
    <motion.button
      type="button"
      onPointerDown={() => onTap(item)}
      disabled={!!result}
      initial={{ opacity: 0, scale: 0.85, y: 30 }}
      animate={
        result
          ? { opacity: [1, 1, 0], scale: 1, y: 0, x: status === 'wrong' ? ['0rem', '-0.8rem', '0.8rem', '0rem'] : 0 }
          : { opacity: 1, scale: 1, y: 0, x: ['0rem', '0.5rem', '0rem', '-0.5rem', '0rem'] }
      }
      transition={
        result
          ? { duration: 1.2, times: [0, 0.6, 1] }
          : {
              opacity: { duration: 0.3, delay: item.slot * 0.12 },
              scale: { type: 'spring', stiffness: 400, damping: 22, delay: item.slot * 0.12 },
              y: { type: 'spring', stiffness: 400, damping: 22, delay: item.slot * 0.12 },
              x: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
            }
      }
      className="card-panel absolute flex items-center py-[0.9rem] pr-[1.5rem] pl-[0.9rem] text-left"
      style={{ left: `${LEFT_REM}rem`, top: `${SLOT_TOP_REM[item.slot]}rem`, width: `${WIDTH_REM}rem` }}
    >
      <span className="grid size-[8rem] shrink-0 place-items-center">
        {tapped ? (
          <motion.img
            src={status === 'hit' ? shieldOk : shieldBad}
            alt={status === 'hit' ? 'Correct' : 'Wrong'}
            initial={{ scale: 0.3 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            className="w-[7.5rem]"
          />
        ) : (
          <Sprite name={item.icon} size={8} />
        )}
      </span>
      <span className="ml-[3.2rem] leading-tight">
        {item.lines.map(([text, bold]) => (
          <span key={text} className={`block whitespace-nowrap ${bold ? 'text-[1.8rem] font-bold' : 'text-[1.4rem]'}`}>
            {text}
          </span>
        ))}
      </span>
      {result?.awards.length > 0 && <CoinPopup awards={result.awards} className="bottom-full left-[5rem] mb-2" />}
    </motion.button>
  )
}
