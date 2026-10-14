import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import Chhavi from '../features/game/components/Chhavi'
import SpeechBubble from '../features/game/components/SpeechBubble'
import { stopMusic } from '../features/game/utils/sound'
import headline from '../assets/ui/saver-headline.webp'
import qr from '../assets/ui/saver-qr.webp'
import bubble from '../assets/ui/bubble-handbook.webp'

// docs/FICCI Mascarade_ Chavvi qr code_Folder.zip: shown after SCREENSAVER_AFTER_MS without a tap
// on the start or how-to-play screen (KioskLayout). A tap anywhere goes back to the start screen.
// The artboard is portrait only; landscape puts the headline and QR between the stage logo and
// Chhavi, with her bubble kept beside her head as the portrait art has it.
export default function ScreensaverPage() {
  const navigate = useNavigate()
  useEffect(stopMusic, [])

  return (
    <div onClick={() => navigate('/', { replace: true })} className="absolute inset-0">
      <img
        src={headline}
        alt="Stay Alert. Stay Scam-Smart."
        draggable={false}
        className="absolute top-[21.7rem] left-[11.6rem] w-[43.5rem] landscape:top-[9rem] landscape:left-[32rem] landscape:w-[38rem]"
      />
      <img
        src={qr}
        alt="Scan to download the Mission GraHAQ handbook"
        draggable={false}
        className="absolute top-[30.7rem] left-[16.75rem] w-[34rem] landscape:top-[18.5rem] landscape:left-[34rem]"
      />
      <SpeechBubble
        src={bubble}
        alt="Scan the QR code to download the Mission GraHAQ handbook"
        className="absolute top-[70.2rem] left-[4.8rem] w-[35.1rem] landscape:top-[18rem] landscape:left-[71rem] landscape:w-[28rem]"
      />
      <Chhavi
        pose="point"
        className="absolute top-[72.5rem] left-[26.1rem] w-[49.75rem] landscape:top-[20rem] landscape:left-[89rem] landscape:w-[36rem]"
      />
    </div>
  )
}
