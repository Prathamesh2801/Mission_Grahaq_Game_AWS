import { lazy, Suspense } from 'react'
import { createHashRouter, Navigate } from 'react-router'
import KioskLayout from '../layouts/KioskLayout'
import IdlePage from '../pages/IdlePage'
import HowToPlayPage from '../pages/HowToPlayPage'
import PlayPage from '../pages/PlayPage'
import ResultPage from '../pages/ResultPage'

// lazy so the dashboard's charts stay out of the game bundle. React's lazy, not the route's:
// the route kind leaves the router with nothing to render on a fresh load of #/admin.
// this file exports the router, so it full-reloads on edit anyway
// eslint-disable-next-line react-refresh/only-export-components
const AdminPage = lazy(() => import('../pages/AdminPage'))

export const router = createHashRouter([
  // engagement dashboard, outside the kiosk stage
  {
    path: 'admin',
    element: (
      <Suspense>
        <AdminPage />
      </Suspense>
    ),
  },
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
