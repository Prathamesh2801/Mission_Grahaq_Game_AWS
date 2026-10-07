# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A touch-kiosk game for the FICCI Mascarade "Mission GraHAQ" stand, 9:16 on a portrait screen and
16:9 on a landscape one: players tap scam messages ("red flags") and leave genuine ones ("decoys")
alone. It is a display piece, not a
general web app — it runs fullscreen on one screen, has no backend, and no persistence.

## Commands

```bash
npm run dev             # Vite dev server, --host so the kiosk/phone on the LAN can load it
npm run build           # production build to dist/ (base './', so it runs from S3/CloudFront/Amplify or a file path)
npm run lint            # eslint
npm test                # node --test, no framework
node --test src/features/game/utils/game.test.js          # one file
node --test --test-name-pattern 'scoring' src/features/game/utils/game.test.js   # one test

python scripts/prepare-assets.py   # regenerate everything under src/assets + scenarios.js
```

## The design is the source of truth, and it lives outside the repo

`docs/` holds the master Illustrator file, the asset zip, and `final_v2_win.mp4` — a screen capture
of the finished game that defines layout, sizing, timing and Chhavi's reaction lines. **`docs/`
is gitignored**, so a clone can build and run but cannot regenerate assets. When something
looks wrong, measure it against `final_v2_win.mp4` (ffmpeg is available) rather than guessing.
(Older comments cite `final_v1.mp4`, the capture it replaced.)

Everything under `src/assets/` and `src/features/game/data/scenarios.js` is **generated** by
`scripts/prepare-assets.py` from those sources. Do not hand-edit them; change the crop boxes or
mappings in the script and re-run it. The script also scrubs a stray dark panel that the
artboard bakes into the background image.

## Coordinate system

The artboards are 1080×1920. The stage is a fixed 9:16 box letterboxed on any screen, and
`html { font-size: min(100vw / 67.5, 100dvh / 120) }` makes **1rem = 16 artboard px**.

So every position and size in the UI is `artboard px ÷ 16`, written as an arbitrary Tailwind
value: a card 637px wide at x=223 becomes `w-[39.8rem] left-[13.9rem]`. Screens position their
elements absolutely from artboard coordinates instead of stacking margins — margins drift, and
a measured `top-[32.5rem]` is checkable against the video. Never introduce `px`, `vw` or `vh`
sizing into the stage; it breaks at other window sizes.

**Landscape.** On a landscape screen (`@media (orientation: landscape)`) the stage turns
120×67.5rem, the 1920×1080 artboards in `docs/FICCI Mascarade_ Interactive Display_1920x1080/`
(flattened JPGs, exported at 2×), still 16 artboard px to the rem. Every element keeps its portrait
classes and adds `landscape:` twins measured off those artboards, e.g. `top-[32.5rem] landscape:top-[8.2rem]`.
The game rules are identical; only placement changes. Those artboards have no gameplay screen: the
three slots stack in the middle under the logo (which glides to the top centre once the board is
up), and Chhavi reacts beside them — cheers on the right, wrong taps and misses on the left. The
few numbers JS needs (card slots, fly-in distances) come from `hooks/useLandscape.js`, the same media
query. The background is its own 16:9 image (`ui/background-landscape.webp`), rendered by the asset
script from the background groups of `docs/Landscape.ai`, the master file for these artboards —
measure landscape positions off it (PyMuPDF gives exact text, image and group boxes), not the JPGs.
Some landscape art differs from portrait and is cut separately (`LANDSCAPE_CROPS`, `*-landscape.webp`,
swapped in with `<picture><source media="(orientation: landscape)">`): the idle bubble points down,
the fail headline has a deeper shadow, STARTS IN is set tighter. The pass screen's win pose is
mirrored with CSS. Those artboards repeat their sparkle layer over the foreground, so landscape cuts
drop every full-width group, not just the leading background run. Trap: an absolute box placed near the stage's right edge shrinks to the room left
before the edge, so a flex row there needs `w-max` (Chhavi's reaction group did this).

## Tailwind class precedence — this has caused three separate bugs

A component's own class does **not** win over a class the caller passes in. Both end up in the
same stylesheet at the same specificity, so the one Tailwind emits later wins, regardless of
the order they appear in the `className` string. `Stars`' `w-[11.6rem]` lost to a caller's
`w-full` and stretched across the whole stage; `SpeechBubble`'s `relative` beat callers'
`absolute` so bubbles never positioned.

Callers must not pass a utility from a group the component already sets. `SpeechBubble` guards
its `relative` by sniffing the incoming className; `Stars` and `Chhavi` document it instead.

Related trap: `h-full` on a grid/flex item in an implicit auto row resolves to the image's
natural pixel height, silently ignoring the box you put it in. Size images with an explicit
`w-[…]`.

## Architecture

Feature-oriented under `src/features/game/`, plain JavaScript and JSX (no TypeScript),
Tailwind v4, Framer Motion, React Router `createHashRouter` (hash routing so it works from a
file path or a bare S3 bucket).

**Game rules live in `utils/game.js` as pure functions and a reducer** — no React, no DOM,
fully unit-tested. `hooks/useGame.js` is the only thing that adds a clock (a 100ms `setInterval`
dispatching `tick`). Keep rule changes in `game.js` so the tests can reach them.

The round model: 10 rounds, each showing **3 cards at once in three fixed slots — 2 red flags
and 1 decoy**, drawn randomly with no repeats from 41 red flags and 20 decoys. A round ends the
moment **both red flags are caught** — not when all three cards are resolved, since the decoy is
meant to be left alone and waiting on it would make correct play sit idle — or after 10s,
whichever comes first, then a ~0.9s reveal beat before the next drops in. Cards do not move
between slots; earlier versions floated them up the screen, which is wrong.

Scoring: +100 a hit, +25 tapped within 2s of the round appearing, +100 every third in a row,
−50 tapping a decoy, −20 a red flag left untapped. A decoy left alone is correct and scores
nothing.

Chhavi's line for a hit, highest priority first: streak ("Three in a Row!"), speed ("Quick
Eyes!"), clean round clear ("Keep going!": second red flag caught, decoy untouched, not the last
round), otherwise "Nice catch!". Every reaction clears after `REACTION_MS` (2.5s) and Chhavi
fades out, so an idle board doesn't hold a stale line.

`layouts/KioskLayout.jsx` owns the stage, the background, **and the logo** — the logo is
deliberately not part of any page, because it holds still while screens scale out to a point and
the next scales up, which is the transition the video uses. Pages are the router outlet inside
that `AnimatePresence`.

`pages/` are the four screens (idle → how-to-play → play → result); `PlayPage` just switches
`Countdown` for `GameBoard`.

**Start taps**: on the idle and how-to-play screens only the TAP TO PLAY art and the LET'S GO
button advance, never a tap elsewhere. The tap plays `Burst` — the designer's Lottie
(`docs/burst-bubble.json`, played by `lottie-web`'s light build) — at the finger, and swells the
page to 1.1× over 0.4s; the page navigates only when that finishes, and the layout's 0.45s exit
collapses it from there — the video's swell-then-collapse. Don't put CSS `filter`s on anything
that animates during that tap: a `drop-shadow` on the burst stalled the page for up to 600ms, so
its outline is baked into the Lottie by the asset script instead.

**Result**: the final score appears at once in plain digits with no separators (the client dropped
the video's count-up), and the 20s auto-return starts immediately.

**Engagement tracking**: `utils/analytics.js`'s `track()` feeds both GA4 (only with
`VITE_GA_ID`) and the Mission GrahAQ API (`src/config.js`, docs at
http://192.168.1.88/ministack/Mission_GrahAQ/). One API record per visitor: TAP TO PLAY creates it
(`game_start: false`), LET'S GO starts it (`true`), the result POST closes it (`"end"`) with score,
win/lose, hits, misses, wrong taps and the ISO times — the API stores no timestamps of its own.
The API allows any origin (CORS `*`), so the game calls it directly; `VITE_API_URL` overrides it.

**Admin dashboard**: `#/admin`, outside `KioskLayout`, lazy-loaded so Recharts stays out of the
game bundle. The `admin` class resets the stage's rem scaling (`index.css`), so ordinary
Tailwind sizes apply there. Credentials and refresh rate are in `src/config.js`; the gate is
client-side only. Numbers come from `features/admin/utils/stats.js` (pure, tested).

**Audio**: browsers only allow playback after a user gesture, so `startMusic()` fires on the
TAP TO PLAY tap in `IdlePage` and loops from there through the whole session. Nothing else
starts or stops it.

Card icons are the designer's sprite sheets, repacked by the asset script. Each is an entrance
that ends on a settled pose, so `Sprite` plays it once as the card arrives and holds the last
frame. Some sheets centre their grid with a margin; the script finds each sheet's real row offset
rather than slicing from y=0, which cut frames in half (a floating half-truck, stray box slivers).

Chhavi's speech bubbles are images cut from the artboards (`ui/bubble-*.webp`), copy included.
Lines the artboards don't letter go on a `bubble-blank-*` shape with live text over it.
`card-panel` is the artboards' notched panel path as a 9-slice `border-image` in `src/index.css`,
a PNG rather than SVG (an SVG border-image stalled the first card fly-in ~300ms). Sprite sheets are
fetched and decoded at startup for the same reason: decoding them lazily stalled every round's entrance;
`pixel-number` is a text-shadow recipe there too.
