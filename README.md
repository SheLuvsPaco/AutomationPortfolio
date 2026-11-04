# Plamen Iliev — Automation Cinema

A portfolio of real n8n automation systems, presented as a cinema. The lobby
shows one poster per system; each poster opens a scroll-driven short film that
walks through the problem, the fix, and the system step by step.

No video: HTML, CSS and SVG, played by the reader's scroll. Static Astro site.

## Films

| Film | System |
| --- | --- |
| AI Cold Caller | Outbound AI phone calls with research, brief, verdict and follow-up |
| AI Receptionist | Inbound AI phone line that books, moves and cancels appointments |
| Online Store That Runs Itself | 13 workflows running an Amazon FBA store |
| No Lead Left Behind | Sales pipeline that reactivates and follows up every lead |
| From Map to Meeting | Lead gathering, decision-maker research, email outreach |

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the dev server |
| `npm run build` | Type check → static build into `dist/` |
| `npm run preview` | Serves `dist/` on port 4321 |
| `scripts/build-font.sh` | Rebuilds the subset fonts (needs fonttools) |

## How the films work

- `src/film/engine.ts` turns scroll position into a per-scene `--p` from 0 to 1.
  Almost all motion is CSS computed from `--p` with `clamp()`.
- `src/film/live.ts` runs the workflows' own Code-node JavaScript in the browser
  on invented, labelled inputs (`src/film/fixtures.ts`, `*-fixtures.json`).
- With Reduce Motion on, the films still play, through fades and typing only.

## How the data stays safe

The raw workflow exports contain live credentials and client data. They never
enter this repository. A private pipeline reads them, keeps only whitelisted,
redacted fields, writes them to `src/data/generated/` and `src/assets/`, and
fails the build if any of the sensitive literals it collected appears in the
generated data or the built site. People and companies shown in the films are
fictional; the machines are real.
