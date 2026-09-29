// Run with: npm test  (node --test, no framework)
import test from 'node:test'
import assert from 'node:assert/strict'
import { byHour, scoreBins, summarize, toRows } from './stats.js'

const dump = {
  a: { id: 'a', game_start: false },
  b: { id: 'b', game_start: true },
  c: {
    id: 'c', game_start: 'end', score: 1450, result: 'win', hits: 15, missed: 5, wrong_taps: 1,
    started_at: '2026-09-29T10:00:00Z', ended_at: '2026-09-29T10:01:50Z',
  },
  d: { id: 'd', game_start: 'end', score: -120, result: 'lose', hits: 2, missed: 18, ended_at: '2026-09-29T12:30:00Z' },
}

test('stages, results and derived fields', () => {
  const rows = toRows(dump)
  assert.deepEqual(rows.map((r) => r.stage), ['tapped', 'playing', 'completed', 'completed'])
  assert.equal(rows[2].accuracy, 0.75)
  assert.equal(rows[2].duration, 110)
  assert.equal(rows[3].duration, null) // no start time
  assert.deepEqual(toRows([]), []) // the API's empty dump
})

test('funnel and averages', () => {
  const s = summarize(toRows(dump))
  assert.equal(s.sessions, 4)
  assert.equal(s.started, 3)
  assert.equal(s.completed, 2)
  assert.equal(s.tappedOnly, 1)
  assert.equal(s.winRate, 0.5)
  assert.equal(s.avgScore, 665)
  assert.equal(s.topScore, 1450)
})

test('hourly activity keeps empty hours; score bins cover negatives', () => {
  const hours = byHour(toRows(dump))
  assert.deepEqual(hours.map((h) => [h.win, h.lose]), [[1, 0], [0, 0], [0, 1]])
  const bins = scoreBins(toRows(dump))
  assert.equal(bins[0].from, -250)
  assert.equal(bins.at(-1).from, 1250)
  assert.equal(bins.reduce((n, b) => n + b.count, 0), 2)
})
