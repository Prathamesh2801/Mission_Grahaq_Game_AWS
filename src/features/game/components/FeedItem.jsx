import { motion } from 'framer-motion'
import Sprite from './Sprite'
import CoinPopup from './CoinPopup'
import shieldOk from '../../../assets/ui/shield-ok.webp'
import shieldBad from '../../../assets/ui/shield-bad.webp'

// Card geometry measured off the artboards / final_v1.mp4 (artboard px ÷ 16 = rem).
const LEFT_REM = 13.9
const WIDTH_REM = 39.8
const SLOT_TOP_REM = [23.7, 44.25, 64.3]
const STAGE_REM = 67.5
const STAGE_TALL_REM = 120

// Cards fly in from off-stage rather than fading up. The three slots take different
// sides, rotated each round, so a set never arrives the same way twice running.
const ENTRANCES = ['left', 'right', 'bottom', 'top']
function offStage(slot, round) {
  const top = SLOT_TOP_REM[slot]
  switch (ENTRANCES[(slot + round) % ENTRANCES.length]) {
    case 'left':
      return { x: `-${LEFT_REM + WIDTH_REM + 2}rem`, y: 0 }
    case 'right':
      return { x: `${STAGE_REM - LEFT_REM + 2}rem`, y: 0 }
    case 'top':
      return { x: 0, y: `-${top + 12}rem` }
    default:
      return { x: 0, y: `${STAGE_TALL_REM - top + 2}rem` }
  }
}

// One shopping message, parked in its slot for the round.
// Tapped: the icon becomes a ✓ / ✗ shield and the coins fly up. Then the card fades out.
export default function FeedItem({ item, result, onTap }) {
  const status = result?.status
  const tapped = status === 'hit' || status === 'wrong'
  const from = offStage(item.slot, item.round)

  return (
    <motion.button
      type="button"
      onPointerDown={() => onTap(item)}
      disabled={!!result}
      initial={{ opacity: 0, scale: 0.9, ...from }}
      animate={
        result
          ? { opacity: [1, 1, 0], scale: 1, y: 0, x: status === 'wrong' ? ['0rem', '-0.8rem', '0.8rem', '0rem'] : 0 }
          : { opacity: 1, scale: 1, x: 0, y: 0 }
      }
      transition={
        result
          ? { duration: 0.45, times: [0, 0.45, 1] }
          : {
              type: 'spring',
              stiffness: 260,
              damping: 26,
              delay: item.slot * 0.07,
              opacity: { duration: 0.18, delay: item.slot * 0.07 },
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
          <Sprite name={item.icon} />
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
