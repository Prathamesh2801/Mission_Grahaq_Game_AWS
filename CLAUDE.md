# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A 9:16 touch-kiosk game for the FICCI Mascarade "Mission GraHAQ" stand: players tap scam
messages ("red flags") and leave genuine ones ("decoys") alone. It is a display piece, not a
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

`docs/` holds the master Illustrator file, the asset zip, and `final_v1.mp4` — a screen capture
of the finished game that defines layout, sizing, timing and Chhavi's reaction lines. **`docs/`
is gitignored**, so a clone can build and run but cannot regenerate assets. When something
looks wrong, measure it against `final_v1.mp4` (ffmpeg is available) rather than guessing.

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
and 1 decoy**, drawn randomly with no repeats from 42 red flags and 20 decoys. A round ends the
moment **both red flags are caught** — not when all three cards are resolved, since the decoy is
meant to be left alone and waiting on it would make correct play sit idle — or after 10s,
whichever comes first, then a ~0.9s reveal beat before the next drops in. Cards do not move
between slots; earlier versions floated them up the screen, which is wrong.

Scoring: +100 a hit, +25 tapped within 2s of the round appearing, +100 every third in a row,
−50 tapping a decoy, −20 a red flag left untapped. A decoy left alone is correct and scores
nothing.

`layouts/KioskLayout.jsx` owns the stage, the background, **and the logo** — the logo is
deliberately not part of any page, because it holds still while screens scale out to a point and
the next scales up, which is the transition the video uses. Pages are the router outlet inside
that `AnimatePresence`.

`pages/` are the four screens (idle → how-to-play → play → result); `PlayPage` just switches
`Countdown` for `GameBoard`.

**Audio**: browsers only allow playback after a user gesture, so `startMusic()` fires on the
TAP TO PLAY tap in `IdlePage` and loops from there through the whole session. Nothing else
starts or stops it.

Pixel-art borders that need notched corners (`card-panel`, `pixel-bubble`, `pixel-number`) are
box-shadow recipes in `src/index.css`, not Tailwind borders.
