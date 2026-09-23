import { useEffect, useRef } from 'react'
import manifest from '../../../assets/sprites/manifest.json'

const sheets = import.meta.glob('../../../assets/sprites/*.webp', { eager: true, import: 'default' })
const url = (name) => sheets[`../../../assets/sprites/${name}.webp`]
const FPS = 24
const SIZE = 8 // rem, the icon box on every card

// Looping pixel-icon animation from a repacked sheet (see scripts/prepare-assets.py).
// The frame is written straight to the DOM node: these sheets run 55–150 frames, and
// re-rendering three of them through React state stalled the card entrance animations.
export default function Sprite({ name }) {
  const ref = useRef(null)
  const frames = manifest.frames[name]

  useEffect(() => {
    const { cols } = manifest
    const el = ref.current
    let frame = 0
    const id = setInterval(() => {
      frame = (frame + 1) % frames
      el.style.backgroundPosition = `-${(frame % cols) * SIZE}rem -${Math.floor(frame / cols) * SIZE}rem`
    }, 1000 / FPS)
    return () => clearInterval(id)
  }, [frames])

  return (
    <span
      ref={ref}
      aria-hidden
      className="inline-block shrink-0 bg-no-repeat"
      style={{
        width: `${SIZE}rem`,
        height: `${SIZE}rem`,
        backgroundImage: `url(${url(name)})`,
        backgroundSize: `${manifest.cols * SIZE}rem auto`,
        backgroundPosition: '0 0',
      }}
    />
  )
}
