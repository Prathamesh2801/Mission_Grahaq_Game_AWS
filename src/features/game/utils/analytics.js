// Google Analytics 4. Off unless VITE_GA_ID is set at build time, so dev and tests send nothing.
// Page views are off: hash routing makes them unreliable, and the events say more.
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

export const track = (name, params) => id && window.gtag('event', name, params)
