import { useMemo, useState } from 'react'
import { STAGES } from '../utils/stats'
import { COLOR, glass, num, pct, secs, when } from './ui'

const PAGE = 20
const FILTERS = {
  all: ['All', () => true],
  win: ['Won', (r) => r.result === 'win'],
  lose: ['Lost', (r) => r.result === 'lose'],
  tapped: [STAGES.tapped, (r) => r.stage === 'tapped'],
  playing: [STAGES.playing, (r) => r.stage === 'playing'],
}
const COLUMNS = [
  ['seq', '#', (r) => r.seq + 1],
  ['id', 'Session', (r) => <code className="text-white/70">{r.id}</code>],
  ['stage', 'Status', (r) => <Status row={r} />],
  ['score', 'Score', (r) => num(r.score)],
  ['hits', 'Caught', (r) => (r.hits == null ? '—' : `${r.hits}/20`)],
  ['accuracy', 'Accuracy', (r) => pct(r.accuracy)],
  ['wrongTaps', 'Decoys tapped', (r) => num(r.wrongTaps)],
  ['duration', 'Play time', (r) => secs(r.duration)],
  ['at', 'When', (r) => when(r.at)],
]

function Status({ row }) {
  if (row.stage !== 'completed')
    return <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/70">{STAGES[row.stage]}</span>
  const color = row.result === 'win' ? COLOR.win : COLOR.lose
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs" style={{ background: `${color}33` }}>
      <i className="size-2 rounded-full" style={{ background: color }} />
      {row.result === 'win' ? 'Won' : 'Lost'}
    </span>
  )
}

function downloadCsv(rows) {
  const keys = ['id', 'stage', 'result', 'score', 'hits', 'accuracy', 'wrongTaps', 'speedBonuses', 'duration', 'at']
  const cell = (v) => (v == null ? '' : `"${String(v).replaceAll('"', '""')}"`)
  const lines = [keys.join(','), ...rows.map((r) => keys.map((k) => cell(k === 'at' && r.at ? new Date(r.at).toISOString() : r[k])).join(','))]
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }))
  a.download = `grahaq-sessions-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

export default function SessionsTable({ rows }) {
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState({ key: 'seq', dir: -1 }) // newest first
  const [page, setPage] = useState(0)

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = rows.filter((r) => FILTERS[filter][1](r) && (!q || r.id.toLowerCase().includes(q)))
    // blanks always sink, whichever way the column is sorted
    return list.sort((a, b) => {
      const x = a[sort.key]
      const y = b[sort.key]
      if (x == null || y == null) return (x == null) - (y == null)
      return (x < y ? -1 : x > y ? 1 : 0) * sort.dir
    })
  }, [rows, filter, query, sort])

  const pages = Math.max(1, Math.ceil(shown.length / PAGE))
  const current = Math.min(page, pages - 1)
  const pick = (f) => {
    setFilter(f)
    setPage(0)
  }

  return (
    <section className={`${glass} overflow-hidden`}>
      <div className="flex flex-wrap items-center gap-3 p-5">
        <h2 className="mr-auto font-sans text-lg font-bold tracking-wide">Sessions</h2>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(0)
          }}
          placeholder="Search session id"
          className="w-48 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-white/35 focus:border-fuchsia-400/60"
        />
        <button
          type="button"
          onClick={() => downloadCsv(shown)}
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm transition hover:bg-white/10"
        >
          Export CSV
        </button>
      </div>
      <div className="flex flex-wrap gap-2 px-5 pb-4">
        {Object.entries(FILTERS).map(([key, [label, test]]) => (
          <button
            key={key}
            type="button"
            onClick={() => pick(key)}
            aria-pressed={filter === key}
            className={`rounded-full px-3 py-1 text-sm transition ${
              filter === key ? 'bg-white text-[#1a0f33]' : 'bg-white/10 text-white/75 hover:bg-white/15'
            }`}
          >
            {label} <span className="opacity-60">{rows.filter(test).length}</span>
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="border-y border-white/10 bg-white/[0.04] text-left text-xs tracking-wider text-white/55 uppercase">
            <tr>
              {COLUMNS.map(([key, label]) => (
                <th key={key} aria-sort={sort.key === key ? (sort.dir > 0 ? 'ascending' : 'descending') : undefined} className="px-5 py-3 font-medium">
                  <button
                    type="button"
                    onClick={() => setSort((s) => ({ key, dir: s.key === key ? -s.dir : -1 }))}
                    className="hover:text-white"
                  >
                    {label} {sort.key === key ? (sort.dir > 0 ? '↑' : '↓') : ''}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {shown.slice(current * PAGE, (current + 1) * PAGE).map((r) => (
              <tr key={r.id} className="border-b border-white/5 transition hover:bg-white/[0.05]">
                {COLUMNS.map(([key, , render]) => (
                  <td key={key} className="px-5 py-3">
                    {render(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!shown.length && <p className="py-12 text-center text-sm text-white/45">No sessions match.</p>}
      </div>

      <div className="flex items-center justify-between px-5 py-4 text-sm text-white/60">
        <span>
          {shown.length ? `${current * PAGE + 1}–${Math.min((current + 1) * PAGE, shown.length)} of ${shown.length}` : '0 sessions'}
        </span>
        <div className="flex gap-2">
          <button type="button" disabled={current === 0} onClick={() => setPage(current - 1)} className="rounded-lg px-3 py-1 hover:bg-white/10 disabled:opacity-30">
            Previous
          </button>
          <button type="button" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} className="rounded-lg px-3 py-1 hover:bg-white/10 disabled:opacity-30">
            Next
          </button>
        </div>
      </div>
    </section>
  )
}
