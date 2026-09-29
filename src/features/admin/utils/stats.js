// Turns the API's ?all=1 dump into dashboard numbers. Pure, no React (see stats.test.js).
// The dump is an object keyed by id, in creation order, or [] when empty (PHP's empty array).

export const STAGES = {
  tapped: 'Tapped only', // TAP TO PLAY, then walked away from the instructions
  playing: 'Started, unfinished', // LET'S GO but no result came back (tab closed, network)
  completed: 'Completed',
}

const stageOf = (r) => (r.game_start === 'end' ? 'completed' : r.game_start ? 'playing' : 'tapped')
const time = (s) => (s ? Date.parse(s) || null : null)
const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)

export function toRows(dump) {
  return Object.values(dump ?? {}).map((r, seq) => {
    const stage = stageOf(r)
    const started = time(r.started_at)
    const ended = time(r.ended_at)
    const hits = Number(r.hits ?? NaN)
    const missed = Number(r.missed ?? NaN)
    const score = r.score == null ? null : Number(r.score)
    return {
      id: r.id,
      seq, // creation order: the only ordering the API guarantees
      stage,
      result: stage === 'completed' ? (r.result ?? (score >= 1000 ? 'win' : 'lose')) : null,
      score,
      hits: Number.isFinite(hits) ? hits : null,
      wrongTaps: r.wrong_taps ?? null,
      speedBonuses: r.speed_bonuses ?? null,
      accuracy: Number.isFinite(hits + missed) && hits + missed > 0 ? hits / (hits + missed) : null,
      duration: started && ended ? (ended - started) / 1000 : null,
      at: ended ?? started ?? time(r.tapped_at),
    }
  })
}

export function summarize(rows) {
  const done = rows.filter((r) => r.stage === 'completed')
  const wins = done.filter((r) => r.result === 'win').length
  const scores = done.map((r) => r.score).filter((s) => s != null)
  const pick = (k) => done.map((r) => r[k]).filter((v) => v != null)
  return {
    sessions: rows.length,
    started: rows.length - rows.filter((r) => r.stage === 'tapped').length,
    completed: done.length,
    tappedOnly: rows.filter((r) => r.stage === 'tapped').length,
    unfinished: rows.filter((r) => r.stage === 'playing').length,
    wins,
    losses: done.length - wins,
    winRate: done.length ? wins / done.length : null,
    avgScore: avg(scores),
    topScore: scores.length ? Math.max(...scores) : null,
    avgAccuracy: avg(pick('accuracy')),
    avgDuration: avg(pick('duration')),
    avgWrongTaps: avg(pick('wrongTaps')),
  }
}

// Completed games per hour, split win/lose, for the activity chart. Hours with no games
// inside the range are kept as zeros so gaps read as quiet time, not as missing axis.
export function byHour(rows) {
  const done = rows.filter((r) => r.stage === 'completed' && r.at)
  if (!done.length) return []
  const HOUR = 3_600_000
  const floor = (t) => Math.floor(t / HOUR) * HOUR
  const first = floor(Math.min(...done.map((r) => r.at)))
  const last = floor(Math.max(...done.map((r) => r.at)))
  // ponytail: one bucket per hour, fine for a stand running a few days; bucket by day past ~2 weeks
  const buckets = new Map()
  for (let t = first; t <= last; t += HOUR) buckets.set(t, { t, win: 0, lose: 0 })
  for (const r of done) buckets.get(floor(r.at))[r.result === 'win' ? 'win' : 'lose']++
  return [...buckets.values()]
}

// Score histogram in fixed-width bins, so the pass line (1000) always falls on a bin edge.
export function scoreBins(rows, width = 250) {
  const scores = rows.filter((r) => r.stage === 'completed' && r.score != null).map((r) => r.score)
  if (!scores.length) return []
  const lo = Math.floor(Math.min(...scores) / width) * width
  const hi = Math.floor(Math.max(...scores) / width) * width
  const bins = []
  for (let from = lo; from <= hi; from += width) bins.push({ from, label: `${from}–${from + width - 1}`, count: 0 })
  for (const s of scores) bins[Math.floor((s - lo) / width)].count++
  return bins
}
