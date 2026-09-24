import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import Burst from '../features/game/components/Burst'
import Chhavi from '../features/game/components/Chhavi'
import Stars from '../features/game/components/Stars'
import letsGo from '../assets/ui/lets-go.webp'

// Artboard 2: instructions. Positions are artboard pixels ÷ 16.
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
      <h1 className="absolute top-[29.9rem] w-full text-[5.5rem] leading-none font-bold">SPOT IT. TAP IT.</h1>
      <p className="absolute top-[36.5rem] w-full text-[2.5rem] leading-tight">
        Tap messages that show suspicious behaviour.
        <br />
        The faster you spot them, the higher you score.
      </p>
      <Stars className="absolute top-[45.5rem] left-1/2 -translate-x-1/2" />
      <p className="absolute top-[49.5rem] w-full text-[2.5rem] leading-tight">
        Don’t tap genuine messages &amp; alerts.
        <br />
        Let them pass!
      </p>
      <button
        type="button"
        onClick={(e) => leaving || setTap({ clientX: e.clientX, clientY: e.clientY })}
        className="absolute top-[61.1rem] left-1/2 -translate-x-1/2 active:translate-y-2"
      >
        <img src={letsGo} alt="Let’s go!" draggable={false} className="w-[38rem]" />
        {tap && <Burst {...tap} />}
      </button>
      <Chhavi pose="cheer" className="absolute bottom-0 left-1/2 w-[30.7rem] -translate-x-1/2" />
    </motion.div>
  )
}
