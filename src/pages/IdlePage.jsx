import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { Chhavi, SpeechBubble, Stars } from '../features/game'
import { startMusic } from '../features/game/utils/sound'
import tapToPlay from '../assets/ui/tap-to-play.webp'

// Artboard 1: idle / attract screen. Whole screen is the tap target, and that tap is
// also the gesture browsers require before any audio can play.
export default function IdlePage() {
  const navigate = useNavigate()

  const play = () => {
    startMusic()
    navigate('/how-to-play')
  }

  return (
    <button type="button" onClick={play} className="absolute inset-0 text-center">
      <h1 className="absolute top-[32.5rem] w-full text-[5.1rem] leading-none font-bold">Tap the Red Flag!</h1>
      <p className="absolute top-[38.6rem] w-full text-[2.5rem]">Think you can spot a scam before it gets you?</p>
      <Stars className="absolute top-[42.3rem] left-1/2 -translate-x-1/2" />
      <p className="absolute top-[47.4rem] left-1/2 w-[52rem] -translate-x-1/2 text-[2rem] leading-snug">
        Shopping scams can look surprisingly real. Test your scam-spotting skills and see if you are a Viksit GraHAQ.
      </p>
      <motion.img
        src={tapToPlay}
        alt="Tap to play"
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        className="absolute top-[60.3rem] left-1/2 w-[28rem] -translate-x-1/2"
      />
      <SpeechBubble className="absolute top-[87.8rem] left-[6.4rem] w-[28rem] text-[3.09rem] font-bold">
        Ready? Keep your
        <br />
        eyes sharp!
      </SpeechBubble>
      <Chhavi pose="trophy" className="absolute right-0 bottom-0 w-[34.7rem]" />
    </button>
  )
}
