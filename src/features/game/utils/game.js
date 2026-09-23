// Game rules, matching docs/final_v1.mp4: 10 rounds, each showing 3 cards at once
// (2 red flags + 1 decoy) in three fixed slots. Pure functions, no React.

export const ROUNDS = 10
export const ROUND_MS = 10_000
export const SLOTS = 3
const QUALIFYING_SCORE = 1000

const RED_FLAGS_PER_ROUND = 2
const DECOYS_PER_ROUND = 1
const REVEAL_MS = 900 // a settled round stays up this long before the next one drops in
const POINTS = { hit: 100, wrong: -50, miss: -20, streak: 100, speed: 25 }
const STREAK_EVERY = 3
// Deck: speed bonus "use sparingly". Tapped this fast after the round appears.
const SPEED_WINDOW_MS = 2000
const MAX_SPEED_BONUSES = 5

function shuffle(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Fresh random draw every game: 20 of the 42 red flags and 10 of the decoys, none repeated.
export function buildRounds(redFlags, decoys) {
  const reds = shuffle(redFlags)
  const fakes = shuffle(decoys)
  return Array.from({ length: ROUNDS }, (_, round) => {
    const picks = [
      ...reds.slice(round * RED_FLAGS_PER_ROUND, (round + 1) * RED_FLAGS_PER_ROUND).map((s) => ({ ...s, isRedFlag: true })),
      ...fakes.slice(round * DECOYS_PER_ROUND, (round + 1) * DECOYS_PER_ROUND).map((s) => ({ ...s, isRedFlag: false })),
    ]
    // which of the three slots the decoy lands in is random
    return shuffle(picks).map((s, slot) => ({ ...s, id: `${round}-${slot}`, round, slot }))
  })
}

export const initialState = (rounds) => ({
  rounds,
  round: 0,
  elapsed: 0,
  roundAt: 0, // elapsed when the current round appeared
  clearAt: null, // elapsed when the round settled; the next one drops in REVEAL_MS later
  resolved: {}, // id -> { status: 'hit' | 'wrong' | 'missed', awards: [{ points, label }] }
  score: 0,
  streak: 0,
  wrongTaps: 0,
  speedBonuses: 0,
  feedback: null,
  done: false,
})

const award = (points, note) => ({ points, label: `${points > 0 ? '+' : '–'}${Math.abs(points)}${note ? ` ${note}` : ''}` })

const withFeedback = (state, kind) => ({
  ...state,
  feedback: { kind, n: (state.feedback?.n ?? 0) + 1 },
})

export const currentItems = (state) => state.rounds[state.round] ?? []

const settled = (state, resolved = state.resolved) => currentItems(state).every((i) => resolved[i.id])

function tap(state, item) {
  if (state.done || item.round !== state.round || state.resolved[item.id]) return state

  if (!item.isRedFlag) {
    const resolved = { ...state.resolved, [item.id]: { status: 'wrong', awards: [award(POINTS.wrong)] } }
    return withFeedback(
      {
        ...state,
        resolved,
        clearAt: settled(state, resolved) ? state.elapsed : state.clearAt,
        score: state.score + POINTS.wrong,
        streak: 0,
        wrongTaps: state.wrongTaps + 1,
      },
      'wrong',
    )
  }

  const streak = state.streak + 1
  const streakBonus = streak % STREAK_EVERY === 0
  const speedBonus = state.elapsed - state.roundAt <= SPEED_WINDOW_MS && state.speedBonuses < MAX_SPEED_BONUSES
  const awards = [
    award(POINTS.hit),
    ...(streakBonus ? [award(POINTS.streak, 'BONUS')] : []),
    ...(speedBonus ? [award(POINTS.speed)] : []),
  ]
  const points = awards.reduce((sum, a) => sum + a.points, 0)
  const resolved = { ...state.resolved, [item.id]: { status: 'hit', awards } }

  return withFeedback(
    {
      ...state,
      resolved,
      clearAt: settled(state, resolved) ? state.elapsed : state.clearAt,
      score: state.score + points,
      streak,
      speedBonuses: state.speedBonuses + (speedBonus ? 1 : 0),
    },
    streakBonus ? 'streak' : speedBonus ? 'speed' : 'hit',
  )
}

// Round ran out: red flags left untapped cost −20 each. Decoys left alone are correct.
function expire(state) {
  const gone = currentItems(state).filter((i) => i.isRedFlag && !state.resolved[i.id])
  const resolved = { ...state.resolved }
  for (const i of currentItems(state)) resolved[i.id] ??= { status: 'missed', awards: gone.includes(i) ? [award(POINTS.miss)] : [] }
  const next = { ...state, resolved, clearAt: state.elapsed }
  if (!gone.length) return next
  return withFeedback(
    { ...next, score: state.score + gone.length * POINTS.miss, streak: 0 },
    'miss',
  )
}

const advance = (state) => ({
  ...state,
  round: state.round + 1,
  roundAt: state.elapsed,
  clearAt: null,
  done: state.round + 1 >= ROUNDS,
  feedback: null,
})

export function reducer(state, action) {
  switch (action.type) {
    case 'tick': {
      if (state.done) return state
      const next = { ...state, elapsed: action.elapsed }
      if (next.clearAt === null && next.elapsed - next.roundAt >= ROUND_MS) return expire(next)
      if (next.clearAt !== null && next.elapsed - next.clearAt >= REVEAL_MS) return advance(next)
      return next
    }
    case 'tap':
      return tap(state, action.item)
    default:
      return state
  }
}

export const summarize = (state) => ({
  score: state.score,
  qualified: state.score >= QUALIFYING_SCORE,
})
