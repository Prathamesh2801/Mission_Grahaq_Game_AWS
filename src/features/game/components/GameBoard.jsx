import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGame } from '../hooks/useGame'
import { summarize } from '../utils/game'
import { playSfx } from '../utils/sound'
import FeedItem from './FeedItem'
import Chhavi from './Chhavi'
import SpeechBubble from './SpeechBubble'
import niceCatch from '../../../assets/ui/bubble-nice-catch.webp'
import decoy from '../../../assets/ui/bubble-decoy.webp'
import watchOut from '../../../assets/ui/bubble-watch-out.webp'
import keepGoing from '../../../assets/ui/bubble-keep-going.webp'
import tooSlow from '../../../assets/ui/bubble-too-slow.webp'
import blankShort from '../../../assets/ui/bubble-blank-1.webp'
import blankTall from '../../../assets/ui/bubble-blank-2.webp'

// Chhavi's reaction per event, lines as spoken in docs/final_v1.mp4, in the artboards' bubbles.
// Artboards 3–4 pair each bubble with Chhavi; scaled to her in-game size that is 0.93× the
// artboard (artboard px × 0.93 ÷ 16 = rem), sat where they draw it: bottom-tailed bubbles up and
// over her shoulder, side-tailed ones level with her chest, "Too slow" off her other side.
// "Quick Eyes" and "Three in a Row" aren't lettered in the artboards, so they go on a blank
// bubble of the same shape.
// Landscape has room beside the cards instead of below them: the same group, a touch smaller,
// cheers from the right and groans (wrong tap, too slow) from the left.
const OVER_SHOULDER = 'mb-[21.5rem] -mr-[5rem]'
const AT_CHEST = 'mb-[10rem] mr-[2rem]'
const BLANK_TEXT = 'inset-x-[2rem] top-[1.2rem] bottom-[5.5rem] text-[4.4rem]'
const REACTIONS = {
  hit: { pose: 'clap', bubble: niceCatch, width: 'w-[26.6rem]', place: OVER_SHOULDER, line: 'Nice catch!', sound: 'correct' },
  speed: { pose: 'clap', bubble: blankShort, width: 'w-[26.6rem]', place: OVER_SHOULDER, line: 'Quick Eyes!', text: BLANK_TEXT, sound: 'correct' },
  streak: {
    pose: 'cheer',
    bubble: blankTall,
    width: 'w-[26.6rem]',
    place: OVER_SHOULDER,
    line: (
      <>
        Three in
        <br />a Row!
      </>
    ),
    text: BLANK_TEXT,
    sound: 'correct',
  },
  clear: { pose: 'clap', bubble: keepGoing, width: 'w-[22.3rem]', place: AT_CHEST, line: 'Keep going!', sound: 'correct' },
  wrong: { pose: 'facepalm', bubble: decoy, width: 'w-[26.6rem]', place: OVER_SHOULDER, line: 'That’s a decoy!', sound: 'wrong' },
  miss: { pose: 'sad', bubble: tooSlow, width: 'w-[20.4rem]', place: 'mb-[12.6rem]', flip: true, line: 'Too slow', sound: 'wrong' },
}
// A second wrong-tap line, alternated with the first.
const WRONG_AGAIN = { pose: 'think', bubble: watchOut, width: 'w-[22.3rem]', place: AT_CHEST, line: 'Watch out!', sound: 'wrong' }

export default function GameBoard({ onFinish }) {
  const { state, items, tap } = useGame()
  const event = state.feedback
  const base = event && REACTIONS[event.kind]
  const reaction = base && event.kind === 'wrong' && state.wrongTaps % 2 === 0 ? WRONG_AGAIN : base

  useEffect(() => {
    if (reaction?.sound) playSfx(reaction.sound)
    // one sound per event, not per re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.n])

  useEffect(() => {
    if (state.done) onFinish(summarize(state))
  }, [state, onFinish])

  return (
    // data-board: the layout moves the logo up while the board is showing
    <div data-board className="absolute inset-0">
      {items.map((item) => (
        <FeedItem key={item.id} item={item} result={state.resolved[item.id]} onTap={tap} />
      ))}

      {/* The reducer clears the reaction after REACTION_MS; fade it rather than cut it. The
          wrapper's key is fixed so a new line swaps in rather than fading out under the next;
          the per-event keys below replay the entrance. */}
      <AnimatePresence>
        {reaction && (
        <motion.div
          key="reaction"
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          className={`pointer-events-none absolute bottom-0 left-1/2 flex origin-bottom -translate-x-1/2 items-end gap-[1rem] landscape:w-max landscape:scale-[0.85] ${reaction.sound === 'wrong' ? 'landscape:left-[20rem]' : 'landscape:left-[100rem]'} ${reaction.flip ? 'flex-row-reverse' : ''}`}
        >
          <SpeechBubble
            key={`bubble-${event.n}`}
            src={reaction.bubble}
            alt={reaction.line}
            textClassName={reaction.text}
            className={`z-10 shrink-0 ${reaction.width} ${reaction.place}`}
          >
            {reaction.text && reaction.line}
          </SpeechBubble>
          <Chhavi key={`chhavi-${event.n}`} pose={reaction.pose} className="w-[19.3rem]" />
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
