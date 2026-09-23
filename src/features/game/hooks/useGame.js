import { useCallback, useEffect, useReducer } from 'react'
import { redFlags, decoys } from '../data/scenarios'
import { buildRounds, currentItems, initialState, reducer } from '../utils/game'

export function useGame() {
  const [state, dispatch] = useReducer(reducer, null, () => initialState(buildRounds(redFlags, decoys)))

  useEffect(() => {
    const start = performance.now()
    const id = setInterval(() => dispatch({ type: 'tick', elapsed: performance.now() - start }), 100)
    return () => clearInterval(id)
  }, [])

  const tap = useCallback((item) => dispatch({ type: 'tap', item }), [])

  return {
    state,
    items: state.done ? [] : currentItems(state),
    tap,
  }
}
