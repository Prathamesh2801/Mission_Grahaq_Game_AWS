import { useLocation, useOutlet } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import background from '../assets/ui/background.webp'
import logo from '../assets/ui/logo.webp'

// Fixed 9:16 stage, letterboxed on any screen, with the synthwave backdrop from the artboards.
// The logo is part of the stage, not the pages: it holds still while screens scale in and out.
export default function KioskLayout() {
  const { pathname } = useLocation()
  const outlet = useOutlet()

  return (
    <div className="flex h-dvh items-center justify-center" onContextMenu={(e) => e.preventDefault()}>
      <main
        className="relative h-[120rem] w-[67.5rem] overflow-hidden bg-cover font-sans text-white"
        style={{ backgroundImage: `url(${background})` }}
      >
        {pathname !== '/result' && (
          <img src={logo} alt="Mission GraHAQ" className="absolute top-[4.1rem] left-1/2 w-[35.2rem] -translate-x-1/2" />
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ scale: 0.06, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.06, opacity: 0, transition: { duration: 0.22, ease: 'easeIn' } }}
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
