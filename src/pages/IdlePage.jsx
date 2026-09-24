import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import Burst from '../features/game/components/Burst'
import Chhavi from '../features/game/components/Chhavi'
import SpeechBubble from '../features/game/components/SpeechBubble'
import Stars from '../features/game/components/Stars'
import { startMusic } from '../features/game/utils/sound'
import tapToPlay from '../assets/ui/tap-to-play.webp'
import bubbleReady from '../assets/ui/bubble-ready.webp'

// Artboard 1: idle / attract screen. Only the TAP TO PLAY art starts the game (as in
// docs/final_v2_win.mp4), and that tap is also the gesture browsers need before audio plays.
// It bursts, the page swells to 1.1× over 0.4s, and only then do we move on; the layout's
// exit collapses it from there.
export default function IdlePage() {
  const navigate = useNavigate()
  const [tap, setTap] = useState(null) // where TAP TO PLAY was hit; set once, then we're leaving
  const leaving = tap !== null

  const play = (e) => {
    if (leaving) return
    startMusic()
    setTap({ clientX: e.clientX, clientY: e.clientY })
  }

  return (
    <motion.div
      animate={{ scale: leaving ? 1.1 : 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      onAnimationComplete={() => leaving && navigate('/how-to-play')}
      className="absolute inset-0 text-center"
    >
      <h1 className="absolute top-[32.5rem] w-full text-[5.1rem] leading-none font-bold">Tap the Red Flag!</h1>
      <p className="absolute top-[38.6rem] w-full text-[2.5rem]">Think you can spot a scam before it gets you?</p>
      <Stars className="absolute top-[42.3rem] left-1/2 -translate-x-1/2" />
      <p className="absolute top-[47.4rem] left-1/2 w-[52rem] -translate-x-1/2 text-[2rem] leading-snug">
        Shopping scams can look surprisingly real. Test your scam-spotting skills and see if you are a Viksit GraHAQ.
      </p>
      <button type="button" onClick={play} className="absolute top-[60.3rem] left-1/2 w-[28rem] -translate-x-1/2">
        <motion.img
          src={tapToPlay}
          alt="Tap to play"
          draggable={false}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="w-full"
        />
        {tap && <Burst {...tap} />}
      </button>
      <SpeechBubble
        src={bubbleReady}
        alt="Ready? Keep your eyes sharp!"
        className="absolute top-[86.9rem] left-[11.4rem] w-[28.4rem]"
      />
      <Chhavi pose="trophy" className="absolute right-0 bottom-0 w-[34.7rem]" />
    </motion.div>
  )
}
