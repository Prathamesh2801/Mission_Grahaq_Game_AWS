// Shared look for the admin screens: frosted panels over the blurred game backdrop.
export const glass =
  'rounded-2xl border border-white/10 bg-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl'

// Win / lose, and the "qualifies / below" split of the score chart. Adjacent slots of a
// CVD-validated categorical palette (dark steps), always shown with a text label.
export const COLOR = { win: '#199e70', lose: '#d95926', bar: '#3987e5' }

export const num = (n, digits = 0) =>
  n == null ? '—' : n.toLocaleString('en-IN', { maximumFractionDigits: digits })
export const pct = (n) => (n == null ? '—' : `${Math.round(n * 100)}%`)
export const secs = (s) => (s == null ? '—' : s < 60 ? `${Math.round(s)}s` : `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`)
export const when = (t) =>
  t == null ? '—' : new Date(t).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
