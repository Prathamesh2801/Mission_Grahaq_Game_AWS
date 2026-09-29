import { useState } from 'react'
import Login from '../features/admin/components/Login'
import Dashboard from '../features/admin/components/Dashboard'
import background from '../assets/ui/background.webp'

const KEY = 'grahaq-admin'
const stored = () => {
  try {
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}
const remember = (on) => {
  try {
    if (on) sessionStorage.setItem(KEY, '1')
    else sessionStorage.removeItem(KEY)
  } catch {
    // private mode: the sign-in just lasts until reload
  }
}

// #/admin: an ordinary scrolling page, outside the kiosk stage. The `admin` class resets the
// stage's rem scaling in index.css. The game's own backdrop, blurred, keeps it on brand.
export default function AdminPage() {
  const [authed, setAuthed] = useState(stored)
  const set = (on) => {
    remember(on)
    setAuthed(on)
  }

  return (
    <div className="admin relative min-h-dvh font-[system-ui] text-white">
      {/* React 19 hoists this into <head>, and puts the game's title back on the way out */}
      <title>Engagement · Mission GraHAQ</title>
      <div
        className="fixed inset-0 -z-10 scale-110 bg-cover bg-center blur-2xl"
        style={{ backgroundImage: `url(${background})` }}
      />
      <div className="fixed inset-0 -z-10 bg-[#0b0620]/75" />
      {authed ? <Dashboard onSignOut={() => set(false)} /> : <Login onSuccess={() => set(true)} />}
    </div>
  )
}
