import { useLocation, useOutlet } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import background from '../assets/ui/background.webp'
import backgroundLandscape from '../assets/ui/background-landscape.webp'
import logo from '../assets/ui/logo.webp'

// Fixed stage, letterboxed on any screen, with the synthwave backdrop from the artboards:
// 9:16 on a portrait screen, 16:9 on a landscape one (docs/…_1920x1080).
// The logo is part of the stage, not the pages: it holds still while screens scale in and out.
// In landscape it sits left of the idle, how-to and countdown screens and glides to the top
// centre once the game board is up (the card artboards' spot), clearing both sides for Chhavi.
// Only that move animates (the transition lives on the board state): a window resize snaps.
// The move is translate + scale from the side box (top-left origin: 3.2rem→49rem, 24.6rem→6.1rem,
// 29rem→21.9rem wide), never top/left/width: those animate on the main thread, which is busy
// mounting the board right then, so the glide stalled and jumped. Transforms run on the compositor.
// It sits above the pages: round one's top card drops in from above and would otherwise cut
// through it mid-glide.
export default function KioskLayout() {
  const { pathname } = useLocation()
  const outlet = useOutlet()

  return (
    <div className="flex h-dvh items-center justify-center" onContextMenu={(e) => e.preventDefault()}>
      <main
        className="group relative h-[120rem] w-[67.5rem] overflow-hidden bg-(image:--bg) bg-cover font-sans text-white landscape:h-[67.5rem] landscape:w-[120rem] landscape:bg-(image:--bg-landscape)"
        style={{ '--bg': `url(${background})`, '--bg-landscape': `url(${backgroundLandscape})` }}
      >
        {pathname !== '/result' && (
          <img
            src={logo}
            alt="Mission GraHAQ"
            className="absolute top-[4.1rem] left-1/2 z-10 w-[35.2rem] -translate-x-1/2 landscape:top-[24.6rem] landscape:left-[3.2rem] landscape:w-[29rem] landscape:origin-top-left landscape:translate-x-0 landscape:will-change-transform landscape:group-has-[[data-board]]:translate-x-[45.8rem] landscape:group-has-[[data-board]]:-translate-y-[18.5rem] landscape:group-has-[[data-board]]:scale-[0.7552] landscape:group-has-[[data-board]]:transition-[translate,scale] landscape:group-has-[[data-board]]:duration-500 landscape:group-has-[[data-board]]:ease-out"
          />
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ scale: 0.06, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            // collapse to a point, accelerating, as docs/final_v2_win.mp4 measures (~0.45s)
            exit={{ scale: 0.06, opacity: 0, transition: { duration: 0.45, ease: 'easeIn' } }}
            transition={{
              scale: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.18 },
            }}
            className="absolute inset-0"
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
