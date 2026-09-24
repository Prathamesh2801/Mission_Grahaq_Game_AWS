// Run with: npm test  (node --test, no framework)
import test from 'node:test'
import assert from 'node:assert/strict'
import { buildRounds, currentItems, initialState, reducer, summarize, REACTION_MS, ROUNDS, ROUND_MS, SLOTS } from './game.js'
import { redFlags, decoys } from '../data/scenarios.js'

const cardText = (i) => i.lines.map(([text]) => text).join(' ')
const fresh = () => initialState(buildRounds(redFlags, decoys))
const reds = (s) => currentItems(s).filter((i) => i.isRedFlag)
// Move the clock past the speed-bonus window but inside the round.
const late = (s) => ({ ...s, elapsed: s.roundAt + 5000 })
// Settle the current round (by the clock if it is not settled already) and let the next drop in.
const nextRound = (s) => {
  const cleared = s.clearAt === null ? reducer(s, { type: 'tick', elapsed: s.roundAt + ROUND_MS }) : s
  return reducer(cleared, { type: 'tick', elapsed: cleared.clearAt + 1000 })
}

test('10 rounds of 3 cards, each 2 red flags + 1 decoy, drawn without repeats', () => {
  const rounds = buildRounds(redFlags, decoys)
  assert.equal(rounds.length, ROUNDS)
  for (const round of rounds) {
    assert.equal(round.length, SLOTS)
    assert.equal(round.filter((i) => i.isRedFlag).length, 2)
    assert.deepEqual(
      round.map((i) => i.slot),
      [0, 1, 2],
    )
  }
  const flat = rounds.flat()
  assert.equal(new Set(flat.filter((i) => i.isRedFlag).map(cardText)).size, 20)
  assert.equal(new Set(flat.filter((i) => !i.isRedFlag).map(cardText)).size, 10)
})

test('the decoy does not always sit in the same slot', () => {
  const slots = new Set()
  for (let n = 0; n < 40; n++) {
    for (const round of buildRounds(redFlags, decoys)) slots.add(round.find((i) => !i.isRedFlag).slot)
  }
  assert.deepEqual([...slots].sort(), [0, 1, 2])
})

test('scoring: hit +100, speed +25, streak +100 every 3, wrong -50', () => {
  let s = fresh()
  const [a, b] = reds(s)
  s = reducer(late(s), { type: 'tap', item: a })
  assert.equal(s.score, 100)
  s = reducer(s, { type: 'tap', item: a }) // double tap ignored
  assert.equal(s.score, 100)
  s = reducer(s, { type: 'tap', item: b })
  assert.equal(s.score, 200)

  s = nextRound(s)
  const c = reds(s)[0]
  s = reducer(late(s), { type: 'tap', item: c })
  assert.equal(s.score, 400) // third in a row: +100 hit, +100 streak bonus
  assert.equal(s.feedback.kind, 'streak')
  assert.deepEqual(
    s.resolved[c.id].awards.map((x) => x.label),
    ['+100', '+100 BONUS'],
  )

  const decoy = currentItems(s).find((i) => !i.isRedFlag)
  s = reducer(s, { type: 'tap', item: decoy })
  assert.equal(s.score, 350)
  assert.equal(s.streak, 0)
  assert.equal(s.feedback.kind, 'wrong')

  let quick = fresh()
  const first = reds(quick)[0]
  quick = reducer({ ...quick, elapsed: 500 }, { type: 'tap', item: first })
  assert.equal(quick.score, 125)
  assert.equal(quick.feedback.kind, 'speed')
})

test('"Keep going!" (clear) only for a clean round clear, never on the last round', () => {
  let s = fresh()
  const [a, b] = reds(s)
  s = reducer(late(s), { type: 'tap', item: a })
  assert.equal(s.feedback.kind, 'hit') // one to go
  s = reducer(s, { type: 'tap', item: b })
  assert.equal(s.feedback.kind, 'clear')

  s = nextRound(s)
  const decoy = currentItems(s).find((i) => !i.isRedFlag)
  s = reducer(late(s), { type: 'tap', item: decoy })
  for (const item of reds(s)) s = reducer(late(s), { type: 'tap', item })
  assert.notEqual(s.feedback.kind, 'clear') // the decoy was tapped this round

  s = fresh()
  while (s.round < ROUNDS - 1) s = nextRound(s) // let the clock run out on rounds 1–9
  for (const item of reds(s)) s = reducer(late(s), { type: 'tap', item })
  assert.equal(s.feedback.kind, 'hit') // the game ends here, nothing to keep going to
})

test('taps on a card from another round are ignored', () => {
  const s = fresh()
  const later = s.rounds[3][0]
  assert.equal(reducer(s, { type: 'tap', item: later }), s)
})

test('a red flag left untapped when the round runs out costs -20', () => {
  let s = fresh()
  const flags = reds(s)
  s = reducer(late(s), { type: 'tap', item: flags[0] })
  s = reducer(s, { type: 'tick', elapsed: ROUND_MS })
  assert.deepEqual(s.resolved[flags[1].id], { status: 'missed', awards: [{ points: -20, label: '–20' }] })
  assert.equal(s.feedback.kind, 'miss')
  assert.equal(s.score, 80)
  assert.equal(s.streak, 0)
  // the untouched decoy is correct, so it scores nothing
  assert.deepEqual(s.resolved[currentItems(s).find((i) => !i.isRedFlag).id].awards, [])
})

test('catching both red flags ends the round without waiting for the decoy or the clock', () => {
  let s = fresh()
  const [a, b] = reds(s)
  s = reducer(late(s), { type: 'tap', item: a })
  assert.equal(s.clearAt, null) // one to go
  s = reducer(s, { type: 'tap', item: b })
  assert.equal(s.clearAt, s.elapsed) // settled the instant the second one is caught
  assert.ok(s.elapsed - s.roundAt < ROUND_MS) // well before the round would time out

  const decoy = currentItems(s).find((i) => !i.isRedFlag)
  assert.equal(s.resolved[decoy.id], undefined) // left alone, as intended
  s = reducer(s, { type: 'tick', elapsed: s.clearAt + 1000 })
  assert.equal(s.round, 1)
  assert.equal(s.done, false)
})

test('a wrongly tapped decoy does not end the round on its own', () => {
  let s = fresh()
  const decoy = currentItems(s).find((i) => !i.isRedFlag)
  s = reducer(late(s), { type: 'tap', item: decoy })
  assert.equal(s.clearAt, null)
  assert.equal(s.round, 0)
})

test('a perfect game is 10 rounds of two hits, and qualifies', () => {
  let s = fresh()
  while (!s.done) {
    for (const item of reds(s)) s = reducer(late(s), { type: 'tap', item })
    s = nextRound(s)
  }
  const result = summarize(s)
  assert.equal(result.score, 20 * 100 + 6 * 100) // 20 hits + a streak bonus every 3rd
  assert.equal(result.qualified, true)
})

test("Chhavi's reaction clears after REACTION_MS, keeping its count", () => {
  let s = fresh()
  s = reducer(late(s), { type: 'tap', item: reds(s)[0] })
  const { n, at } = s.feedback
  s = reducer(s, { type: 'tick', elapsed: at + REACTION_MS - 100 })
  assert.equal(s.feedback.kind, 'hit') // still up
  s = reducer(s, { type: 'tick', elapsed: at + REACTION_MS })
  assert.deepEqual(s.feedback, { n })
})
