import { useEffect } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { Chhavi, SpeechBubble, Stars } from '../features/game'
import greatJob from '../assets/ui/great-job.webp'
import niceTry from '../assets/ui/nice-try.webp'
import passHeadline from '../assets/ui/pass-headline.webp'
import failHeadline from '../assets/ui/fail-headline.webp'
import yourScore from '../assets/ui/your-score.webp'
import qr from '../assets/ui/qr.webp'

const IDLE_AFTER_MS = 20_000

// Artboards 5 (qualified) and 6 (try again). Tap anywhere, or wait, to hand over to the next player.
const COPY = {
  pass: {
    title: greatJob,
    titleWidth: 'w-[21rem]',
    headline: passHeadline,
    headlineWidth: 'w-[48.6rem]',
    body: ['You spotted the red flags and showed that you’re', 'ready to shop smarter and safer.'],
    pose: 'win',
    bubble: (
      <>
        Sharp eyes!
        <br />
        You know when to
        <br />
        pause, check &amp; act.
      </>
    ),
  },
  fail: {
    title: niceTry,
    titleWidth: 'w-[19.7rem]',
    headline: failHeadline,
    headlineWidth: 'w-[54.4rem]',
    body: ['A few more checks could make all the difference.', 'Learn the warning signs and give it another shot.'],
    pose: 'think',
    bubble: (
      <>
        Better luck next time!
        <span className="block text-[2.8rem] font-normal">
          Don’t worry, sometimes
          <br />
          even smart shoppers
          <br />
          miss red flags.
        </span>
      </>
    ),
  },
}

export default function ResultPage() {
  const navigate = useNavigate()
  const result = useLocation().state

  useEffect(() => {
    const id = setTimeout(() => navigate('/', { replace: true }), IDLE_AFTER_MS)
    return () => clearTimeout(id)
  }, [navigate])

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
      <p className="pixel-number mt-[1.5rem] text-[6.25rem] leading-none">{result.score.toLocaleString('en-IN')}</p>
      <Stars className="mt-[1.6rem]" />
      <p className="mt-[0.6rem] text-[2.25rem] leading-snug">
        {copy.body[0]}
        <br />
        {copy.body[1]}
      </p>
      <img src={qr} alt="Scan to read the Mission GraHAQ handbook" className="mt-[2.4rem] w-[22.1rem]" />
      <p className="mt-[1.4rem] text-[2.25rem] font-bold">SCAN TO READ THE HANDBOOK</p>
      <SpeechBubble className="absolute top-[94rem] left-[6.5rem] text-[3.09rem] font-bold">{copy.bubble}</SpeechBubble>
      <Chhavi pose={copy.pose} className="absolute right-0 bottom-0 w-[24rem]" />
    </button>
  )
}
