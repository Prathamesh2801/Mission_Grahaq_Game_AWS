import { API_URL } from '../../../config'

// Two sinks for the same three events: Google Analytics 4 (off unless VITE_GA_ID is set at build
// time) and the Mission GrahAQ API that the #/admin dashboard reads (see src/config.js).
// ponytail: events sent while the kiosk is offline are dropped, not queued.
const id = import.meta.env?.VITE_GA_ID

if (id) {
  window.dataLayer = window.dataLayer || []
  // gtag.js expects the arguments object itself, not an array
  window.gtag = function () {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', id, { send_page_view: false })
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
  document.head.appendChild(script)
}

export function track(name, params) {
  if (id) window.gtag('event', name, params)
  if (API_URL) record(name, params)
}

// One API record per visitor: created on TAP TO PLAY (game_start false), marked started on
// LET'S GO (true) — the landscape start screen sends both on one tap — closed with the result (end). A record left at false is someone who read
// the instructions and walked away. The API stores no times, so they ride along with the result.
// Calls chain on `session` (a promise of the record id) so a quick LET'S GO waits for the create.
let session = Promise.resolve(null)
let times = {}

const send = async (query = '', init) => {
  const res = await fetch(API_URL + query, init)
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  return res.json()
}
const warn = (e) => console.warn('engagement API:', e.message)

function record(name, params) {
  const now = new Date().toISOString()
  if (name === 'tap_to_play') {
    times = { tapped_at: now }
    session = send().then((r) => r.id)
  } else if (name === 'game_start') {
    times.started_at = now
    // a failed start must not lose the id, or the result has nowhere to go
    session = session.then((rid) => rid && send(`?id=${rid}`).catch(warn).then(() => rid))
  } else if (name === 'game_complete') {
    const body = { ...params, ...times, ended_at: now }
    session = session
      .then(
        (rid) =>
          rid &&
          send('', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: rid, ...body }),
          }),
      )
      .then(() => null) // closed; a replay without TAP TO PLAY isn't a new visitor
  } else return
  session = session.catch((e) => (warn(e), null))
}
