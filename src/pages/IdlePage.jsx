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
import amazonLogo from '../assets/ui/amazon-logo.webp'
import howToPlay from '../assets/ui/how-to-play.webp'
import tapScreen from '../assets/ui/tap-screen.webp'
import rulesPanel from '../assets/ui/rules-panel.webp'

// The start screen. Portrait is artboard 1: only the TAP TO PLAY art starts (as in
// docs/final_v2_win.mp4) and leads on to How to Play. Landscape is the Amazon artboard
// (docs/aws-game/…1920 X 1080 1.ai), which folds How to Play in: a tap anywhere starts the game.
// Either tap is also the gesture browsers need before audio plays. It bursts, the page swells
// to 1.1× over 0.4s, and only then do we move on; the layout's exit collapses it from there.
export default function IdlePage() {
  const navigate = useNavigate()
  const [tap, setTap] = useState(null) // where the start tap landed and where it leads; set once, then we're leaving
  const leaving = tap !== null

  const play = (to) => (e) => {
    if (leaving) return
    startMusic()
    track('tap_to_play')
    // no How to Play screen to press LET'S GO on, so this tap starts the game too
    if (to === '/play') track('game_start')
    setTap({ clientX: e.clientX, clientY: e.clientY, to })
  }

  return (
    <motion.div
      animate={{ scale: leaving ? 1.1 : 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      onAnimationComplete={() => leaving && navigate(tap.to)}
      className="absolute inset-0 text-center"
    >
      <div className="absolute inset-0 landscape:hidden">
        {/* No portrait Amazon artboard yet: centred in the gap between the stage logo (ends ~20.4rem) and the headline */}
        <img src={amazonLogo} alt="Amazon" draggable={false} className="absolute top-[23.4rem] left-1/2 w-[15rem] -translate-x-1/2" />
        <h1 className="absolute top-[32.5rem] w-full text-[5.1rem] leading-none font-bold">Tap the Red Flag!</h1>
        <p className="absolute top-[38.6rem] w-full text-[2.5rem]">Think you can spot a scam before it gets you?</p>
        <Stars className="absolute top-[42.3rem] left-1/2 -translate-x-1/2" />
        <p className="absolute top-[47.4rem] left-1/2 w-[52rem] -translate-x-1/2 text-[2rem] leading-snug">
          Shopping scams can look surprisingly real. Test your scam-spotting skills and see if you are a Viksit GraHAQ.
        </p>
        <button type="button" onClick={play('/how-to-play')} className="absolute top-[60.3rem] left-1/2 w-[28rem] -translate-x-1/2">
          <motion.img
            src={tapToPlay}
            alt="Tap to play"
            draggable={false}
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="w-full"
          />
          {tap?.to === '/how-to-play' && <Burst {...tap} />}
        </button>
        <SpeechBubble src={bubbleReady} alt="Ready? Keep your eyes sharp!" className="absolute top-[86.9rem] left-[11.4rem] w-[28.4rem]" />
        <Chhavi pose="trophy" className="absolute right-0 bottom-0 w-[34.7rem]" />
      </div>

      {/* Landscape: the whole stage is the button. data-start sends the stage's logo top right (KioskLayout). */}
      <div data-start onClick={play('/play')} className="absolute inset-0 hidden landscape:block">
        <img src={amazonLogo} alt="Amazon" draggable={false} className="absolute top-[3.75rem] left-[3.75rem] w-[18.2rem]" />
        <h1 className="absolute top-[4.75rem] w-full text-[5.18rem] leading-none font-bold">Tap the Red Flag!</h1>
        <p className="absolute top-[10.95rem] w-full text-[2.42rem] leading-none font-bold">Put your scam-spotting skills to the test</p>
        <p className="absolute top-[13.85rem] w-full text-[2.01rem] leading-none">
          Online scams can look surprisingly real. Can you tell the difference?
        </p>
        <Stars className="absolute top-[16.5rem] left-1/2 -translate-x-1/2 landscape:w-[7.75rem]" />
        <img src={howToPlay} alt="How to play" draggable={false} className="absolute top-[26.6rem] left-[16.4rem] w-[23.1rem]" />
        <motion.img
          src={tapScreen}
          alt="Tap the screen to play"
          draggable={false}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="absolute top-[43.6rem] left-[11.6rem] w-[34.3rem]"
        />
        {/* SPOT / TAP / PASS / FOCUS, copy baked into the art */}
        <img
          src={rulesPanel}
          alt="Spot: watch the shopping messages, alerts and payment requests as they appear. Tap the ones that show suspicious behaviour. Pass: not every message is a scam, leave genuine messages untouched. Focus: the game gets faster as you progress, so stay sharp!"
          draggable={false}
          className="absolute top-[21.75rem] left-[48.2rem] w-[56.25rem]"
        />
        <div className="absolute top-[54.3rem] left-[28.6rem] w-max -translate-x-1/2">
          <h2 className="text-[3.14rem] leading-none font-bold">SCORING</h2>
          <p className="mt-[0.22rem] text-[2.66rem] leading-[3.26rem]">
            Earn points for tapping on red flags and avoid
            <br />
            losing points by tapping genuine messages.
          </p>
        </div>
        <p className="absolute top-[57.6rem] right-[25.5rem] w-max text-right text-[2.42rem] leading-[2.95rem] font-bold">
          Spot the red flags.
          <br />
          Earn your Viksit GraHAQ badge.
        </p>
        <Chhavi pose="trophy" className="absolute right-[0.56rem] bottom-[0.875rem] w-[26.9rem]" />
        {tap?.to === '/play' && <Burst {...tap} />}
      </div>
    </motion.div>
  )
}
