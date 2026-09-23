import { useEffect } from 'react'
import { useGame } from '../hooks/useGame'
import { summarize } from '../utils/game'
import { playSfx } from '../utils/sound'
import FeedItem from './FeedItem'
import Chhavi from './Chhavi'
import SpeechBubble from './SpeechBubble'

// Chhavi's reaction per event, lines as spoken in docs/final_v1.mp4.
const REACTIONS = {
  hit: { pose: 'clap', line: 'Nice catch!', sound: 'correct' },
  speed: { pose: 'clap', line: 'Quick Eyes', sound: 'correct' },
  streak: { pose: 'cheer', line: 'Three in a Row !', sound: 'correct' },
  wrong: { pose: 'facepalm', line: 'That’s a decoy!', sound: 'wrong' },
  miss: { pose: 'sad', line: 'Too slow', sound: 'wrong' },
}
// A second wrong-tap line, alternated with the first.
const WRONG_AGAIN = { pose: 'think', line: 'Watch out!', sound: 'wrong' }

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
    <div className="absolute inset-0">
      {items.map((item) => (
        <FeedItem key={item.id} item={item} result={state.resolved[item.id]} onTap={tap} />
      ))}

      {reaction && (
        <div
          key={event.n}
          className="pointer-events-none absolute bottom-0 left-1/2 flex -translate-x-1/2 items-end gap-[1rem]"
        >
          <SpeechBubble tail="bottom" className="mb-[22.75rem] text-[2.9rem] font-bold">
            {reaction.line}
          </SpeechBubble>
          <Chhavi pose={reaction.pose} className="w-[19.3rem]" />
        </div>
      )}
    </div>
  )
}
