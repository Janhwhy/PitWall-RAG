# PitWall — Frontend Brief for Stitch

## What this app is

PitWall is a multi-agent RAG-based Formula 1 race strategy assistant. It combines
deterministic, SQL-derived race facts (results, pit stops, weather, standings, schedule)
with an LLM multi-agent Q&A system (tyre / weather / radio / rivals / circuit specialists,
plus a text-to-SQL data agent) that answers free-text strategy questions and generates
pre-race briefs and post-race debriefs for any race. Audience: race strategists, engineers,
and F1 data enthusiasts who want a "digital pit wall" — fast, precise, cockpit-like.

Data coverage: full 2025 season (21 circuits) + early 2026 season (6 circuits: Australia,
Austria, Canada, China, Japan, Monaco), each with laps, pit stops, qualifying (partial),
weather, and radio transcripts.

## Platform

Responsive web, desktop-first (data-dense dashboard), with a mobile fallback (bottom tab
bar instead of sidebar). This mirrors the existing React/Vite frontend already in the repo
(`frontend/src`) — this brief describes the full feature set so Stitch can (re)design all of
it consistently, not just the 3 screens previously generated.

## Global chrome (present on every screen)

- **Top nav bar**: PitWall logo/wordmark, primary nav links, a live "system status" indicator
  (green/red dot from a ChromaDB health check and an f1-dash live-timing online/offline check).
- **Sidebar** (desktop, collapsible/hover-out) or **bottom tab bar** (mobile): Home, Races,
  Standings, Chat.
- **Footer**: minimal, links/credits.

## Screens & Features

### 1. Home / Dashboard
- Hero section with product framing.
- Countdown timer to the next race weekend (days / hours / min / sec).
- Top-3 driver standings and top-3 constructor standings (snapshot cards).
- Latest completed race's key stats (winner, podium, fastest lap).
- Data: `GET /schedule/next`, `GET /standings/drivers`, `GET /standings/constructors`, `GET /race-stats`.

### 2. Races (season calendar)
- List of race weekends for a selectable year, each showing round number, country, location.
- Only shows races that actually have ingested data available.
- Clicking a race opens the Race Weekend detail screen.
- Data: `GET /races`, `GET /schedule?year=`.

### 3. Race Weekend detail (tabbed view, scoped to one race)
- **Results tab**: full classification — position, driver, team, laps completed, status
  (finished/DNF/etc.), fastest-lap flag. Data: `GET /race-results`.
- **Qualifying tab**: grid/pole info where available; show an empty state when a race has
  no qualifying data (`has_quali_data` flag from race-stats).
- **Pre-Race Brief tab**: 5 AI-generated strategy cards answering fixed questions — Tyre
  Strategies, Weather Impact, Key Rivals, Pit Timing, Base Strategy — plus a weather summary
  panel (avg air/track temp, humidity, wind, rain probability). Data: `GET /brief`,
  `GET /weather-summary`.
- **Post-Race Debrief tab**: 3 AI-generated cards — Suboptimal Stops, Tyre Degradation,
  Decisive Moment — plus a full pit-stop log table (driver, lap, compound, tyre life,
  duration) and race stats (winner, podium, fastest lap/pitstop, compound breakdown, laps
  led). Data: `GET /debrief`, `GET /pit-stops`, `GET /race-stats`.

### 4. Standings
- Toggle between Drivers and Constructors, selectable by year.
- Drivers table: position, code, full name, team, points, wins, nationality.
- Constructors table: position, team, points, wins, nationality.
- Data: `GET /standings/drivers`, `GET /standings/constructors`.

### 5. Strategy Chat
- Free-text question input + race selector (year + circuit).
- Synthesized final answer shown prominently, with a collapsible breakdown of each
  specialist agent consulted (Tyre, Weather, Radio, Rivals, Circuit) — each rendered as a
  distinct "AI agent" card/badge with its own answer text and a "chunks used" citation count,
  so the user can see which evidence backed the synthesis.
- Loading state while agents run in parallel; error state if the backend is unreachable.
- Data: `POST /ask` (body: `{question, race}`).

## Domain glossary (for accurate copy/labels)

- **Compound**: tyre type — Soft / Medium / Hard / Intermediate / Wet, each with a
  standard color code (red/yellow/white/green/blue).
- **Stint / pit window / undercut / overcut**: strategy terms used verbatim in agent answers.
- **Session**: FP1, FP2, FP3, Qualifying, Race.
- **Agent** (in Chat): one of Tyre, Weather, Radio, Rivals, Circuit — each a specialist AI
  that only answers from its own retrieved evidence; the Orchestrator synthesizes their
  answers plus SQL-derived stats into one final response.

## States to design for

- Loading skeletons for data tables/cards (avoid high-contrast flashes — subtle shimmer).
- Empty states: no qualifying data, no weather data, no radio data for a given race.
- Live/offline status badges (system status, f1-dash connection).
- Chat: multi-turn feel is not required — each question is a fresh request; show per-agent
  attribution clearly since that's the product's core differentiator.

## Visual style

Two earlier Stitch design explorations already exist in this repo (`ui/stitch_pitwall_strategy_platform/apex_strategy/DESIGN.md` and `new ui/stitch_pitwall_strategy_platform/apex_velocity/DESIGN.md`) but they disagree on specifics. Use this as the unifying direction:

- **Aesthetic**: Ultra-dark "black carbon" cockpit / race-control aesthetic — precise,
  technical, urgent. Dark-mode only.
- **Colors**: near-black background (`#0a0a0b`–`#131314`), slightly lighter surface tier for
  cards (`#111114`–`#1c1c1c`), F1 racing red as the sole primary accent (`#e10600`–`#e8001d`),
  standard racing status colors (green = optimal/go, yellow = caution).
- **Depth**: tonal layering / subtle glassmorphism (translucent panels, soft blur) rather than
  heavy drop shadows; a 1px rim-light border on elevated cards.
- **Typography**: a geometric sans (Space Grotesk or Inter) for headings, Inter for body
  copy, and a monospaced font (JetBrains Mono) specifically for telemetry/numeric data — lap
  times, gaps, tyre %, timers — so digits don't jump around.
- **Layout**: 12-column fluid grid on desktop, fixed sidebar (~240px) + top bar (~48px);
  mobile collapses to a bottom tab bar. 8px base spacing scale. Condensed table rows (32–40px)
  for data density.
- **Shape**: soft-but-technical 4px corner radius on cards/buttons/inputs; pill shapes
  reserved for status chips.

## Ready-to-paste Stitch prompt

```
PitWall — AI Formula 1 race strategy platform

Key Features:
- Home dashboard with next-race countdown, top-3 driver/constructor standings, and latest race result summary
- Races screen: season calendar by year, linking into a per-race detail view
- Race Weekend detail with tabs: Results, Qualifying, Pre-Race Brief (5 AI strategy cards + weather summary), Post-Race Debrief (3 AI strategy cards + pit stop log + race stats)
- Standings screen with Drivers/Constructors toggle, selectable by year
- Strategy Chat: free-text question box with race selector, showing a synthesized AI answer plus a breakdown of individual specialist agents consulted (Tyre, Weather, Radio, Rivals, Circuit), each with its own answer and citation count
- Persistent sidebar navigation (desktop) / bottom tab bar (mobile), top bar with live system-status indicator

Visual Style:
- Ultra-dark "black carbon" cockpit aesthetic, dark mode only
- Racing red primary accent (#e10600), near-black surfaces with subtle glass/tonal layering
- Space Grotesk or Inter for headings, Inter for body text, JetBrains Mono for all numeric/telemetry data
- Dense data tables, 8px spacing rhythm, 4px corner radius, pill-shaped status chips (green = optimal, yellow = caution)

Platform: Responsive web, desktop-first (data-dense dashboard), collapsing gracefully to mobile
```
