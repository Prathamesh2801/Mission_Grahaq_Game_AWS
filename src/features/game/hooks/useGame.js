import { useEffect, useReducer } from 'react'
import { redFlags, decoys } from '../data/scenarios'
import { buildRounds, currentItems, initialState, reducer, ROUNDS } from '../utils/game'

export function useGame() {
  const [state, dispatch] = useReducer(reducer, null, () => initialState(buildRounds(redFlags, decoys)))

  useEffect(() => {
    const start = performance.now()
    const id = setInterval(() => dispatch({ type: 'tick', elapsed: performance.now() - start }), 100)
    return () => clearInterval(id)
  }, [])

  return {
    state,
    items: state.done ? [] : currentItems(state),
    round: Math.min(state.round + 1, ROUNDS),
    done: state.done,
    tap: (item) => dispatch({ type: 'tap', item }),
  }
}
