import { useNavigate } from 'react-router'
import { Chhavi, Stars } from '../features/game'
import letsGo from '../assets/ui/lets-go.webp'

// Artboard 2: instructions. Positions are artboard pixels ÷ 16.
export default function HowToPlayPage() {
  const navigate = useNavigate()
  return (
    <div className="absolute inset-0 text-center">
      <h1 className="absolute top-[29.9rem] w-full text-[5.5rem] leading-none font-bold">SPOT IT. TAP IT.</h1>
      <p className="absolute top-[36.5rem] w-full text-[2.5rem] leading-tight">
        Tap messages that show suspicious behaviour.
        <br />
        The faster you spot them, the higher you score.
      </p>
      <Stars className="absolute top-[45.5rem] left-1/2 -translate-x-1/2" />
      <p className="absolute top-[49.5rem] w-full text-[2.5rem] leading-tight">
        Don’t tap genuine messages &amp; alerts.
        <br />
        Let them pass!
      </p>
      <button
        type="button"
        onClick={() => navigate('/play')}
        className="absolute top-[61.1rem] left-1/2 -translate-x-1/2 active:translate-y-2"
      >
        <img src={letsGo} alt="Let’s go!" className="w-[38rem]" />
      </button>
      <Chhavi pose="cheer" className="absolute bottom-0 left-1/2 w-[30.7rem] -translate-x-1/2" />
    </div>
  )
}
