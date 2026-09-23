import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import { Countdown, GameBoard } from '../features/game'

export default function PlayPage() {
  const navigate = useNavigate()
  const [playing, setPlaying] = useState(false)
  const start = useCallback(() => setPlaying(true), [])
  const finish = useCallback((result) => navigate('/result', { replace: true, state: result }), [navigate])

  return playing ? <GameBoard onFinish={finish} /> : <Countdown onDone={start} />
}
