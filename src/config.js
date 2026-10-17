// Things you may want to tune per deployment.

// Mission GrahAQ engagement API (docs: http://192.168.1.88/ministack/Mission_GrahAQ/). It allows
// any origin, so the game can be hosted anywhere that can reach it. VITE_API_URL overrides; '' = off.
// export const API_URL = import.meta.env?.VITE_API_URL ?? 'http://192.168.1.88/ministack/Mission_GrahAQ/api.php'
export const API_URL =
  import.meta.env?.VITE_API_URL ??
  "https://missiongrahaq.in/API/api.php";

// Admin dashboard at #/admin. This gate lives in the browser bundle, so it keeps casual
// visitors out, not attackers: the API itself answers ?all=1 to anyone on the network.
export const ADMIN = { username: "admin123", password: "admin123" };

// How often the dashboard re-reads the API.
export const REFRESH_MS = 15_000;

// No taps for this long on the start or how-to-play screen shows the QR screensaver.
export const SCREENSAVER_AFTER_MS = 60_000;
