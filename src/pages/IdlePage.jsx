import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import Burst from '../features/game/components/Burst'
import Chhavi from '../features/game/components/Chhavi'
import SpeechBubble from '../features/game/components/SpeechBubble'
import Stars from '../features/game/components/Stars'
import { startMusic } from '../features/game/utils/sound'
import { track } from '../features/game/utils/analytics'
import tapToPlay from '../assets/ui/tap-to-play.webp'
import bubbleReady from '../assets/ui/bubble-ready.webp'
import bubbleReadyLandscape from '../assets/ui/bubble-ready-landscape.webp'

// Artboard 1 (landscape: 1920×1080 artboard 15): idle / attract screen. Only the TAP TO PLAY art starts the game (as in
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
    track('tap_to_play')
    setTap({ clientX: e.clientX, clientY: e.clientY })
  }

  return (
    <motion.div
      animate={{ scale: leaving ? 1.1 : 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      onAnimationComplete={() => leaving && navigate('/how-to-play')}
      className="absolute inset-0 text-center"
    >
      <h1 className="absolute top-[32.5rem] w-full text-[5.1rem] leading-none font-bold landscape:top-[8.2rem] landscape:text-[6.25rem]">
        Tap the Red Flag!
      </h1>
      <p className="absolute top-[38.6rem] w-full text-[2.5rem] landscape:top-[17.5rem]">
        Think you can spot a scam before it gets you?
      </p>
      <Stars className="absolute top-[42.3rem] left-1/2 -translate-x-1/2 landscape:top-[22.4rem] landscape:w-[9.2rem]" />
      <p className="absolute top-[47.4rem] left-1/2 w-[52rem] -translate-x-1/2 text-[2rem] leading-snug landscape:top-[26.1rem] landscape:w-[48rem] landscape:text-[1.95rem] landscape:leading-[1.15]">
        Shopping scams can look surprisingly real. Test your <br className="hidden landscape:inline" />
        scam-spotting skills and see if you are a Viksit GraHAQ.
      </p>
      <button
        type="button"
        onClick={play}
        className="absolute top-[60.3rem] left-1/2 w-[28rem] -translate-x-1/2 landscape:top-[36.1rem] landscape:w-[24.7rem]"
      >
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
        className="absolute top-[86.9rem] left-[11.4rem] w-[28.4rem] landscape:hidden"
      />
      {/* Landscape points the bubble down at Chhavi's head. */}
      <SpeechBubble
        src={bubbleReadyLandscape}
        alt="Ready? Keep your eyes sharp!"
        className="absolute top-[22.1rem] left-[88.4rem] hidden w-[25rem] landscape:block"
      />
      <Chhavi pose="trophy" className="absolute right-0 bottom-0 w-[34.7rem] landscape:right-[4rem] landscape:w-[35.2rem]" />
    </motion.div>
  )
}
