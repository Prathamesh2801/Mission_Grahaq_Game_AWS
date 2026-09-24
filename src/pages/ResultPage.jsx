import { useEffect, useRef } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import Chhavi from '../features/game/components/Chhavi'
import SpeechBubble from '../features/game/components/SpeechBubble'
import Stars from '../features/game/components/Stars'
import greatJob from '../assets/ui/great-job.webp'
import niceTry from '../assets/ui/nice-try.webp'
import passHeadline from '../assets/ui/pass-headline.webp'
import failHeadline from '../assets/ui/fail-headline.webp'
import yourScore from '../assets/ui/your-score.webp'
import qr from '../assets/ui/qr.webp'
import bubblePass from '../assets/ui/bubble-pass.webp'
import bubbleFail from '../assets/ui/bubble-fail.webp'

const IDLE_AFTER_MS = 20_000
// The score counts up from 0 at a steady rate, like docs/final_v2_win.mp4 but half again as
// fast (the video's 200/s kept people waiting): 300 points a second, so 2225 lands in ~7.4s.
// The idle countdown starts only once it lands.
const COUNT_PER_MS = 0.3

// Artboards 5 (qualified) and 6 (try again). Tap anywhere, or wait, to hand over to the next player.
const COPY = {
  pass: {
    title: greatJob,
    titleWidth: 'w-[21rem]',
    headline: passHeadline,
    headlineWidth: 'w-[48.6rem]',
    body: ['You spotted the red flags and showed that you’re', 'ready to shop smarter and safer.'],
    pose: 'win',
    bubble: bubblePass,
    bubblePos: 'left-[5.7rem]',
    bubbleAlt: 'Sharp eyes! You know when to pause, check & act.',
  },
  fail: {
    title: niceTry,
    titleWidth: 'w-[19.7rem]',
    headline: failHeadline,
    headlineWidth: 'w-[54.4rem]',
    body: ['A few more checks could make all the difference.', 'Learn the warning signs and give it another shot.'],
    pose: 'think',
    bubble: bubbleFail,
    bubblePos: 'left-[8.4rem]',
    bubbleAlt: 'Better luck next time! Don’t worry, sometimes even smart shoppers miss red flags.',
  },
}

export default function ResultPage() {
  const navigate = useNavigate()
  const result = useLocation().state
  const scoreRef = useRef(null)

  useEffect(() => {
    if (!result) return
    const { score } = result
    let frame, idle
    const landed = () => (idle = setTimeout(() => navigate('/', { replace: true }), IDLE_AFTER_MS))
    const start = performance.now()
    // written straight to the node: a React render per frame for ~11s buys nothing
    const tick = (now) => {
      const shown = Math.min(score, Math.floor((now - start) * COUNT_PER_MS))
      scoreRef.current.textContent = shown
      if (shown < score) frame = requestAnimationFrame(tick)
      else landed()
    }
    if (score > 0) frame = requestAnimationFrame(tick)
    else landed()
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(idle)
    }
  }, [result, navigate])

  if (!result) return <Navigate to="/" replace />
  const copy = result.qualified ? COPY.pass : COPY.fail

  return (
    <button
      type="button"
      onClick={() => navigate('/', { replace: true })}
      className="relative flex h-full w-full flex-col items-center text-center"
    >
      <img src={copy.title} alt="" className={`mt-[6.75rem] ${copy.titleWidth}`} />
      <img src={copy.headline} alt="" className={`mt-[0.75rem] ${copy.headlineWidth}`} />
      <img src={yourScore} alt="Your score" className="mt-[5.5rem] w-[35.3rem]" />
      <p ref={scoreRef} className="pixel-number mt-[1.5rem] text-[6.25rem] leading-none">
        {Math.min(result.score, 0)}
      </p>
      <Stars className="mt-[1.6rem]" />
      <p className="mt-[0.6rem] text-[2.25rem] leading-snug">
        {copy.body[0]}
        <br />
        {copy.body[1]}
      </p>
      <img src={qr} alt="Scan to read the Mission GraHAQ handbook" className="mt-[2.4rem] w-[22.1rem]" />
      <p className="mt-[1.4rem] text-[2.25rem] font-bold">SCAN TO READ THE HANDBOOK</p>
      <SpeechBubble
        src={copy.bubble}
        alt={copy.bubbleAlt}
        className={`absolute top-[94.2rem] w-[33.4rem] ${copy.bubblePos}`}
      />
      <Chhavi pose={copy.pose} className="absolute right-0 bottom-0 w-[24rem]" />
    </button>
  )
}
