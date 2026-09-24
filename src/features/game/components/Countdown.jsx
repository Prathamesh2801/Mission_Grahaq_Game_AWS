import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Chhavi from './Chhavi'
import startsIn from '../../../assets/ui/starts-in.webp'
import digit1 from '../../../assets/ui/digit-1.webp'
import digit2 from '../../../assets/ui/digit-2.webp'
import digit3 from '../../../assets/ui/digit-3.webp'

const STEP_MS = 1400
// Artboard sizes: the numerals are 221×269, except "1" at 137×269. Width is set on the
// image itself — a percentage height against an implicit grid row falls back to natural size.
const STEPS = {
  3: { digit: digit3, pose: 'three', width: 'w-[13.8rem]' },
  2: { digit: digit2, pose: 'two', width: 'w-[13.8rem]' },
  1: { digit: digit1, pose: 'one', width: 'w-[8.6rem]' },
}
for (const src of [digit3, digit2, digit1]) {
  const img = new Image()
  img.src = src
  img.decode().catch(() => {})
}
// 16.8rem tall, centred at 54rem down the stage.
const DIGIT_BOX = 'absolute top-[45.6rem] left-1/2 flex h-[16.8rem] -translate-x-1/2 items-center'

// "Starts in 3… 2… 1…" (artboards 7–9), Chhavi counting on her fingers.
// Each numeral drops in oversized and springs to rest while the last one shrinks out
// (popLayout: the two overlap, so the box is never empty). Chhavi's three poses share one crop,
// placed where artboards 7–9 put it (x 301–765, down to the bottom edge), so swapping the image
// flips only her hand. No cross-fade: the faces differ slightly between drawings and would ghost.
export default function Countdown({ onDone }) {
  const [count, setCount] = useState(3)
  const step = STEPS[count]

  useEffect(() => {
    const id = setTimeout(() => (count > 1 ? setCount(count - 1) : onDone()), STEP_MS)
    return () => clearTimeout(id)
  }, [count, onDone])

  return (
    <div className="absolute inset-0">
      <img src={startsIn} alt="Starts in" className="absolute top-[29.9rem] left-1/2 w-[58.8rem] -translate-x-1/2" />
      <div className={DIGIT_BOX}>
        <AnimatePresence mode="popLayout">
          <motion.img
            key={count}
            src={step.digit}
            alt={String(count)}
            initial={{ scale: 1.25, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ scale: { type: 'spring', stiffness: 320, damping: 18 }, opacity: { duration: 0.15 } }}
            className={step.width}
          />
        </AnimatePresence>
      </div>
      <Chhavi pose={step.pose} className="absolute bottom-0 left-[18.8rem] w-[29rem]" />
    </div>
  )
}
