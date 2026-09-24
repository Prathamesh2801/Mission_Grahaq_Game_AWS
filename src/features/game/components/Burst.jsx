import { useEffect, useRef } from 'react'
import lottie from 'lottie-web/build/player/lottie_light'
import burst from '../../../assets/burst-bubble.json'

const SIZE = 30 // rem; the ring and dashes spread to ~85% of the Lottie's square
// Its maroon outline is baked into the JSON by scripts/prepare-assets.py: a CSS drop-shadow
// here stalled the TAP TO PLAY tap for up to 600ms.

// lottie-web prepares the animation data the first time it loads it, and the first real tap is
// always TAP TO PLAY — so do that once at startup, off-screen, rather than on the player's tap.
lottie.loadAnimation({ container: document.createElement('div'), renderer: 'svg', autoplay: false, animationData: burst }).destroy()

// The designer's tap burst (docs/burst-bubble.json), played once where the finger landed.
// Render it inside the tapped button: it rides the page's swell out, like the rest of the page.
// `clientX`/`clientY` are the tap's viewport coordinates; a tap with none (keyboard) centres it.
export default function Burst({ clientX, clientY }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    const box = el.parentElement.getBoundingClientRect()
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
    const x = clientX || clientY ? (clientX - box.left) / rem : box.width / 2 / rem
    const y = clientX || clientY ? (clientY - box.top) / rem : box.height / 2 / rem
    el.style.left = `${x - SIZE / 2}rem`
    el.style.top = `${y - SIZE / 2}rem`
    const anim = lottie.loadAnimation({ container: el, renderer: 'svg', loop: false, autoplay: true, animationData: burst })
    return () => anim.destroy()
  }, [clientX, clientY])

  return (
    <span
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute z-10"
      style={{ width: `${SIZE}rem`, height: `${SIZE}rem` }}
    />
  )
}
