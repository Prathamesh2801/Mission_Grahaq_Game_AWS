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
            className="absolute top-[4.1rem] left-1/2 w-[35.2rem] -translate-x-1/2 landscape:top-[24.6rem] landscape:left-[3.2rem] landscape:w-[29rem] landscape:translate-x-0 landscape:group-has-[[data-board]]:top-[6.1rem] landscape:group-has-[[data-board]]:left-[49rem] landscape:group-has-[[data-board]]:w-[21.9rem] landscape:group-has-[[data-board]]:transition-[top,left,width] landscape:group-has-[[data-board]]:duration-500"
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
