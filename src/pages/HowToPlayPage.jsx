import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import Burst from '../features/game/components/Burst'
import Chhavi from '../features/game/components/Chhavi'
import Stars from '../features/game/components/Stars'
import { track } from '../features/game/utils/analytics'
import letsGo from '../assets/ui/lets-go.webp'

// Artboard 2 (landscape: 1920×1080 artboard 5): instructions. Positions are artboard pixels ÷ 16.
// LET'S GO bursts and swells the page before moving on, like the start screen.
export default function HowToPlayPage() {
  const navigate = useNavigate()
  const [tap, setTap] = useState(null) // where LET'S GO was hit; set once, then we're leaving
  const leaving = tap !== null
  return (
    <motion.div
      animate={{ scale: leaving ? 1.1 : 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      onAnimationComplete={() => leaving && navigate('/play')}
      className="absolute inset-0 text-center"
    >
      <h1 className="absolute top-[29.9rem] w-full text-[5.5rem] leading-none font-bold landscape:top-[8.2rem] landscape:text-[6.25rem]">SPOT IT. TAP IT.</h1>
      <p className="absolute top-[36.5rem] w-full text-[2.5rem] leading-tight landscape:top-[17.8rem] landscape:text-[2.2rem] landscape:leading-[1.2]">
        Tap messages that show suspicious behaviour.
        <br />
        The faster you spot them, the higher you score.
      </p>
      <Stars className="absolute top-[45.5rem] left-1/2 -translate-x-1/2 landscape:top-[23.9rem] landscape:w-[9.4rem]" />
      <p className="absolute top-[49.5rem] w-full text-[2.5rem] leading-tight landscape:top-[27.9rem] landscape:text-[2.2rem]">
        Don’t tap genuine messages &amp; alerts. <br className="landscape:hidden" />
        Let them pass!
      </p>
      <button
        type="button"
        onClick={(e) => {
          if (leaving) return
          track('game_start')
          setTap({ clientX: e.clientX, clientY: e.clientY })
        }}
        className="absolute top-[61.1rem] left-1/2 -translate-x-1/2 active:translate-y-2 landscape:top-[38.25rem] landscape:left-[41.4rem] landscape:translate-x-0"
      >
        <img src={letsGo} alt="Let’s go!" draggable={false} className="w-[38rem] landscape:w-[37.7rem]" />
        {tap && <Burst {...tap} />}
      </button>
      <Chhavi
        pose="cheer"
        className="absolute bottom-0 left-1/2 w-[30.7rem] -translate-x-1/2 landscape:right-[3.8rem] landscape:left-auto landscape:w-[29.7rem] landscape:translate-x-0"
      />
    </motion.div>
  )
}
