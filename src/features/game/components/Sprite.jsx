import { useEffect, useRef } from 'react'
import manifest from '../../../assets/sprites/manifest.json'

const sheets = import.meta.glob('../../../assets/sprites/*.webp', { eager: true, import: 'default' })
const url = (name) => sheets[`../../../assets/sprites/${name}.webp`]
// Fetch and decode every sheet up front. Loaded lazily, a round's three sheets (1280px wide,
// up to 1920 tall) decoded while its cards flew in and stalled the entrance for 50–350ms.
// The Image objects are kept so the decoded copies stay cached.
// eslint-disable-next-line no-unused-vars
const warm = Object.values(sheets).map((src) => {
  const img = new Image()
  img.src = src
  img.decode().catch(() => {})
  return img
})
const FPS = 24
const SIZE = 8 // rem, the icon box on every card

// Pixel-icon animation from a repacked sheet (see scripts/prepare-assets.py).
// The sheets are entrances — the box drops in, the truck gets loaded, the coins pile up — that
// end on a settled pose, so it plays once as the card arrives and holds the last frame.
// Looping replayed three entrances every few seconds, and the board never sat still.
// The frame is written straight to the DOM node: these sheets run 46–150 frames, and
// re-rendering three of them through React state stalled the card entrance animations.
export default function Sprite({ name }) {
  const ref = useRef(null)
  const frames = manifest.frames[name]

  useEffect(() => {
    const { cols } = manifest
    const el = ref.current
    let frame = 0
    const id = setInterval(() => {
      if (++frame === frames - 1) clearInterval(id)
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
