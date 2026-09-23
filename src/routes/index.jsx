import { createHashRouter, Navigate } from 'react-router'
import KioskLayout from '../layouts/KioskLayout'
import IdlePage from '../pages/IdlePage'
import HowToPlayPage from '../pages/HowToPlayPage'
import PlayPage from '../pages/PlayPage'
import ResultPage from '../pages/ResultPage'

export const router = createHashRouter([
  {
    element: <KioskLayout />,
    children: [
      { index: true, element: <IdlePage /> },
      { path: 'how-to-play', element: <HowToPlayPage /> },
      { path: 'play', element: <PlayPage /> },
      { path: 'result', element: <ResultPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
