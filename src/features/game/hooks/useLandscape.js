import { useSyncExternalStore } from 'react'

// The same test as Tailwind's `landscape:` variant and the stage sizing in index.css, for the
// little geometry that lives in JS. Re-renders on rotation.
const query = matchMedia('(orientation: landscape)')
const subscribe = (cb) => {
  query.addEventListener('change', cb)
  return () => query.removeEventListener('change', cb)
}

export function useLandscape() {
  return useSyncExternalStore(subscribe, () => query.matches)
}
