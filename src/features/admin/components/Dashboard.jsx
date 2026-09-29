import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { API_URL, REFRESH_MS } from '../../../config'
import logo from '../../../assets/ui/logo.webp'
import { byHour, scoreBins, summarize, toRows } from '../utils/stats'
import SessionsTable from './SessionsTable'
import { COLOR, glass, num, pct, secs } from './ui'

const QUALIFY = 1000
const axis = { stroke: 'rgba(255,255,255,0.45)', fontSize: 12, tickLine: false, axisLine: false }
const tooltip = {
  cursor: { fill: 'rgba(255,255,255,0.06)' },
  contentStyle: {
    background: 'rgba(20,12,40,0.85)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12,
    backdropFilter: 'blur(12px)',
  },
  labelStyle: { color: '#fff', marginBottom: 4 },
  itemStyle: { color: 'rgba(255,255,255,0.85)' },
}
const hourLabel = (t) => new Date(t).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit' })

function useDump() {
  const [state, setState] = useState({ dump: null, error: null, updated: null, loading: true })
  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }))
    try {
      const res = await fetch(`${API_URL}?all=1`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setState({ dump: await res.json(), error: null, updated: new Date(), loading: false })
    } catch (e) {
      setState((s) => ({ ...s, error: e.message, loading: false })) // keep the last good data up
    }
  }, [])
  useEffect(() => {
    const first = setTimeout(load)
    const every = setInterval(load, REFRESH_MS)
    return () => {
      clearTimeout(first)
      clearInterval(every)
    }
  }, [load])
  return { ...state, reload: load }
}

function Stat({ label, value, note }) {
  return (
    <div className={`${glass} p-5`}>
      <p className="text-xs font-medium tracking-wider text-white/55 uppercase">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
      {note && <p className="mt-1 text-sm text-white/55">{note}</p>}
    </div>
  )
}

function Panel({ title, subtitle, children, className = '' }) {
  return (
    <section className={`${glass} p-5 ${className}`}>
      <h2 className="font-sans text-lg font-bold tracking-wide">{title}</h2>
      {subtitle && <p className="text-sm text-white/55">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

const Empty = ({ children }) => <p className="grid h-64 place-items-center text-sm text-white/45">{children}</p>

// Visitor journey: each step as a share of everyone who tapped TAP TO PLAY.
function Funnel({ s }) {
  const steps = [
    ['Tapped TAP TO PLAY', s.sessions],
    ["Tapped LET'S GO", s.started],
    ['Finished the game', s.completed],
    ['Qualified (1000+)', s.wins],
  ]
  return (
    <ol className="space-y-4">
      {steps.map(([label, n], i) => {
        const share = s.sessions ? n / s.sessions : 0
        return (
          <li key={label}>
            <div className="flex justify-between text-sm">
              <span className="text-white/80">{label}</span>
              <span className="tabular-nums">
                {num(n)} <span className="text-white/50">· {pct(share)}</span>
              </span>
            </div>
            <div className="mt-1.5 h-2.5 rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{ width: `${share * 100}%`, background: ['#86b6ef', '#5598e7', '#2a78d6', '#1c5cab'][i] }}
              />
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export default function Dashboard({ onSignOut }) {
  const { dump, error, updated, loading, reload } = useDump()
  const rows = useMemo(() => toRows(dump), [dump])
  const s = useMemo(() => summarize(rows), [rows])
  const hours = useMemo(() => byHour(rows), [rows])
  const bins = useMemo(() => scoreBins(rows), [rows])

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header className={`${glass} flex flex-wrap items-center gap-4 px-5 py-4`}>
        <img src={logo} alt="Mission GraHAQ" className="w-36" />
        <div className="mr-auto">
          <h1 className="font-sans text-xl font-bold tracking-wide">Engagement</h1>
          <p className="text-sm text-white/55">
            {updated ? `Updated ${updated.toLocaleTimeString('en-IN')}` : 'Loading…'} · refreshes every{' '}
            {REFRESH_MS / 1000}s
          </p>
        </div>
        <button
          type="button"
          onClick={reload}
          disabled={loading}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10 disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
        <button
          type="button"
          onClick={onSignOut}
          className="rounded-xl px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          Sign out
        </button>
      </header>

      {error && (
        <div role="alert" className="rounded-2xl border border-rose-400/30 bg-rose-500/15 px-5 py-4 text-sm backdrop-blur-xl">
          <strong>Can't reach the engagement API</strong> ({error}) at <code>{API_URL}</code>.{' '}
          {dump ? 'Showing the last data that loaded.' : 'Check the server is up and reachable from this origin.'}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Visitors" value={num(s.sessions)} note="tapped TAP TO PLAY" />
        <Stat label="Games finished" value={num(s.completed)} note={`${pct(s.sessions && s.completed / s.sessions)} of visitors`} />
        <Stat label="Left at instructions" value={num(s.tappedOnly)} note={`${pct(s.sessions && s.tappedOnly / s.sessions)} drop-off`} />
        <Stat label="Win rate" value={pct(s.winRate)} note={`${num(s.wins)} won · ${num(s.losses)} lost`} />
        <Stat label="Average score" value={num(s.avgScore)} note={`qualify at ${num(QUALIFY)}`} />
        <Stat label="Top score" value={num(s.topScore)} />
        <Stat label="Red flags caught" value={pct(s.avgAccuracy)} note={`avg ${num(s.avgWrongTaps, 1)} decoys tapped`} />
        <Stat label="Average play time" value={secs(s.avgDuration)} note={`${num(s.unfinished)} started, unfinished`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Visitor journey" subtitle="Share of everyone who tapped to play">
          <Funnel s={s} />
        </Panel>

        <Panel title="Games per hour" subtitle="Finished games, by result" className="lg:col-span-2">
          {hours.length ? (
            <ResponsiveContainer width="100%" height={256}>
              <BarChart data={hours} margin={{ left: -16, right: 8 }}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="t" tickFormatter={hourLabel} minTickGap={24} {...axis} />
                <YAxis allowDecimals={false} {...axis} />
                <Tooltip labelFormatter={hourLabel} {...tooltip} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
                <Bar dataKey="win" name="Won" stackId="r" fill={COLOR.win} stroke="#0b0620" strokeWidth={1} />
                <Bar dataKey="lose" name="Lost" stackId="r" fill={COLOR.lose} stroke="#0b0620" strokeWidth={1} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty>No finished games yet.</Empty>
          )}
        </Panel>
      </div>

      <Panel title="Score distribution" subtitle={`Finished games per 250-point band · ${num(QUALIFY)}+ qualifies`}>
        {bins.length ? (
          <ResponsiveContainer width="100%" height={256}>
            <BarChart data={bins} margin={{ left: -16, right: 8 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="label" {...axis} />
              <YAxis allowDecimals={false} {...axis} />
              <Tooltip formatter={(n) => [n, 'Games']} {...tooltip} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {bins.map((b) => (
                  <Cell key={b.from} fill={b.from >= QUALIFY ? COLOR.win : COLOR.lose} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Empty>No scores yet.</Empty>
        )}
        <div className="mt-3 flex gap-5 text-sm text-white/70">
          <span className="flex items-center gap-2">
            <i className="size-2.5 rounded-full" style={{ background: COLOR.win }} /> Qualifies
          </span>
          <span className="flex items-center gap-2">
            <i className="size-2.5 rounded-full" style={{ background: COLOR.lose }} /> Below {num(QUALIFY)}
          </span>
        </div>
      </Panel>

      <SessionsTable rows={rows} />
    </main>
  )
}
