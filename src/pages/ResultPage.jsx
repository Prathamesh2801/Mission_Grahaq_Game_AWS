import { useEffect } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import Chhavi from '../features/game/components/Chhavi'
import SpeechBubble from '../features/game/components/SpeechBubble'
import Stars from '../features/game/components/Stars'
import greatJob from '../assets/ui/great-job.webp'
import niceTry from '../assets/ui/nice-try.webp'
import passHeadline from '../assets/ui/pass-headline.webp'
import failHeadline from '../assets/ui/fail-headline.webp'
import failHeadlineLandscape from '../assets/ui/fail-headline-landscape.webp'
import yourScore from '../assets/ui/your-score.webp'
import qr from '../assets/ui/qr.webp'
import bubblePass from '../assets/ui/bubble-pass.webp'
import bubbleFail from '../assets/ui/bubble-fail.webp'

// The score shows at once (the client dropped the video's count-up), so the idle countdown starts now.
const IDLE_AFTER_MS = 20_000

// Artboards 5 (qualified) and 6 (try again); landscape, 1920×1080 artboards 6 and 7.
// Tap anywhere, or wait, to hand over to the next player.
const COPY = {
  pass: {
    title: greatJob,
    titleClass: 'w-[21rem] landscape:top-[4.75rem] landscape:w-[15.45rem]',
    headline: passHeadline,
    headlineClass: 'w-[48.6rem] landscape:top-[15.1rem] landscape:w-[30.4rem]',
    // the two layouts break the line in different places
    bodyClass: 'landscape:text-[2.2rem]',
    body: (
      <>
        You spotted the red flags and showed that <br className="hidden landscape:inline" />
        you’re <br className="landscape:hidden" />
        ready to shop smarter and safer.
      </>
    ),
    pose: 'win',
    // the landscape artboard draws this pose mirrored
    chhaviClass: 'landscape:right-[10.1rem] landscape:w-[23.7rem] landscape:-scale-x-100',
    bubble: bubblePass,
    bubblePos: 'left-[5.7rem] landscape:top-[46.5rem] landscape:left-[52.1rem]',
    bubbleAlt: 'Sharp eyes! You know when to pause, check & act.',
  },
  fail: {
    title: niceTry,
    titleClass: 'w-[19.7rem] landscape:top-[4.2rem] landscape:w-[15.45rem]',
    headline: failHeadline,
    // the landscape artboard draws it with a deeper drop shadow
    headlineLandscape: failHeadlineLandscape,
    headlineClass: 'w-[54.4rem] landscape:top-[13.45rem] landscape:w-[33.1rem]',
    body: (
      <>
        A few more checks could make all the difference.
        <br />
        Learn the warning signs and give it another shot.
      </>
    ),
    pose: 'think',
    chhaviClass: 'landscape:right-[7.35rem] landscape:-bottom-[0.45rem] landscape:w-[19.65rem]',
    bubble: bubbleFail,
    bubblePos: 'left-[8.4rem] landscape:top-[44.95rem] landscape:left-[49.7rem]',
    bubbleAlt: 'Better luck next time! Don’t worry, sometimes even smart shoppers miss red flags.',
  },
}
// Portrait stacks the column with margins; landscape pins each piece at its artboard top,
// centred, and moves the QR to the bottom-left.
const PIN = 'landscape:absolute landscape:inset-x-0 landscape:mx-auto landscape:mt-0'

export default function ResultPage() {
  const navigate = useNavigate()
  const result = useLocation().state

  useEffect(() => {
    if (!result) return
    const idle = setTimeout(() => navigate('/', { replace: true }), IDLE_AFTER_MS)
    return () => clearTimeout(idle)
  }, [result, navigate])

  if (!result) return <Navigate to="/" replace />
  const copy = result.qualified ? COPY.pass : COPY.fail

  return (
    <button
      type="button"
      onClick={() => navigate('/', { replace: true })}
      className="relative flex h-full w-full flex-col items-center text-center"
    >
      <img src={copy.title} alt="" className={`mt-[6.75rem] ${PIN} ${copy.titleClass}`} />
      <picture className="contents">
        {copy.headlineLandscape && <source media="(orientation: landscape)" srcSet={copy.headlineLandscape} />}
        <img src={copy.headline} alt="" className={`mt-[0.75rem] ${PIN} ${copy.headlineClass}`} />
      </picture>
      <img src={yourScore} alt="Your score" className={`mt-[5.5rem] w-[35.3rem] ${PIN} landscape:top-[24.4rem] landscape:w-[20.2rem]`} />
      <p className={`pixel-number mt-[1.5rem] text-[6.25rem] leading-none ${PIN} landscape:top-[27.25rem] landscape:text-[3.6rem]`}>
        {result.score}
      </p>
      <Stars className={`mt-[1.6rem] ${PIN} landscape:top-[32.1rem] landscape:w-[6.7rem]`} />
      <p className={`mt-[0.6rem] text-[2.25rem] leading-snug ${PIN} landscape:top-[35.8rem] landscape:leading-[1.2] ${copy.bodyClass ?? ''}`}>{copy.body}</p>
      <img
        src={qr}
        alt="Scan to read the Mission GraHAQ handbook"
        className="mt-[2.4rem] w-[22.1rem] landscape:absolute landscape:top-[41.9rem] landscape:left-[10.4rem] landscape:mt-0 landscape:w-[18.4rem]"
      />
      <p className="mt-[1.4rem] text-[2.25rem] font-bold landscape:absolute landscape:top-[60.85rem] landscape:left-[19.6rem] landscape:mt-0 landscape:-translate-x-1/2 landscape:text-[1.9rem] landscape:whitespace-nowrap">
        SCAN TO READ THE HANDBOOK
      </p>
      <SpeechBubble
        src={copy.bubble}
        alt={copy.bubbleAlt}
        className={`absolute top-[94.2rem] w-[33.4rem] ${copy.bubblePos}`}
      />
      <Chhavi pose={copy.pose} className={`absolute right-0 bottom-0 w-[24rem] ${copy.chhaviClass}`} />
    </button>
  )
}
