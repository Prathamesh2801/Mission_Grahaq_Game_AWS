import { useEffect, useState } from 'react'
import manifest from '../../../assets/sprites/manifest.json'

const sheets = import.meta.glob('../../../assets/sprites/*.webp', { eager: true, import: 'default' })
const url = (name) => sheets[`../../../assets/sprites/${name}.webp`]
const FPS = 24

// Looping pixel-icon animation from a repacked sheet (see scripts/prepare-assets.py).
export default function Sprite({ name }) {
  const size = 8 // rem, the icon box on every card
  const frames = manifest.frames[name]
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % frames), 1000 / FPS)
    return () => clearInterval(id)
  }, [frames])

  const { cols } = manifest
  return (
    <span
      aria-hidden
      className="inline-block shrink-0 bg-no-repeat"
      style={{
        width: `${size}rem`,
        height: `${size}rem`,
        backgroundImage: `url(${url(name)})`,
        backgroundSize: `${cols * size}rem auto`,
        backgroundPosition: `-${(frame % cols) * size}rem -${Math.floor(frame / cols) * size}rem`,
      }}
    />
  )
}
