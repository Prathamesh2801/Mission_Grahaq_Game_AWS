import { useState } from 'react'
import { motion } from 'framer-motion'
import { ADMIN } from '../../../config'
import logo from '../../../assets/ui/logo.webp'
import { glass } from './ui'

const input =
  'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-white/35 focus:border-fuchsia-400/60 focus:bg-white/10'

export default function Login({ onSuccess }) {
  const [error, setError] = useState(0) // bumps on each failure to replay the shake

  const submit = (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    if (form.get('username') === ADMIN.username && form.get('password') === ADMIN.password) onSuccess()
    else setError((n) => n + 1)
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <motion.form
        key={error}
        onSubmit={submit}
        initial={error ? { x: 0 } : { opacity: 0, y: 16 }}
        animate={error ? { x: [0, -10, 10, -6, 6, 0] } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`${glass} w-full max-w-sm space-y-5 p-8`}
      >
        <img src={logo} alt="Mission GraHAQ" className="mx-auto w-56" />
        <div className="text-center">
          <h1 className="font-sans text-2xl font-bold tracking-wide">Engagement dashboard</h1>
          <p className="mt-1 text-sm text-white/60">Sign in to see how the stand is doing.</p>
        </div>
        <label className="block space-y-1.5 text-sm text-white/70">
          <span>Username</span>
          <input name="username" autoComplete="username" required autoFocus className={input} />
        </label>
        <label className="block space-y-1.5 text-sm text-white/70">
          <span>Password</span>
          <input name="password" type="password" autoComplete="current-password" required className={input} />
        </label>
        {error > 0 && (
          <p role="alert" className="text-sm text-rose-300">
            Wrong username or password.
          </p>
        )}
        <button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-500 py-3 font-semibold shadow-lg shadow-fuchsia-500/25 transition hover:brightness-110 active:scale-[0.98]"
        >
          Sign in
        </button>
      </motion.form>
    </main>
  )
}
