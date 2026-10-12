# Changelog — Weepo Companion B2C (tifa-work)

Summary for **Mon** from MVP foundation releases **0.3.x → 0.7.x**. All data on-device unless BYO LLM is enabled.

## [0.8.0] — Chat starters, memory pins, public web demo

- Persona-aware **quick reply** chips under chat composer (offline-friendly)
- **Pin / unpin** device memory notes (pinned first in prompt + export)
- Haptic-on-send toggle (no bundled audio — keeps bundle lean)
- Stronger ErrorBoundary + boot recovery banner when storage read fails
- **Public web demo:** `npm run export:web`, GitHub Pages — see `docs/WEB_DEMO.md`

## [0.7.2] — Home & settings polish

- Home widget stack scrolls on small screens (check-in + focus + history)
- Settings filter field for long list
- Single `localDateKey` module for streak + focus (timezone note in docs)
- `CONTRIBUTING.md` for Mon/agents; README screenshot placeholder section

## [0.7.1] — Work focus polish

- 7-day focus minutes strip on Home (local history)
- Optional 5-minute soft break timer after completed focus block
- Gentle offline nudge when focus stopped early
- PR ready for review

## [0.7.0] — Work companion focus mode

- Home focus sessions: 25m / 50m / custom, countdown, today’s minutes
- Offline companion lines on start/complete; Settings tips toggle
- Optional work note at session end → device memory (`Focus · …`)
- Session state machine + cold-start reconcile

## [0.6.1] — Companion feel + store prep

- Avatar tap → joy pulse + poke banter
- TTS lip-sync stub (MouthOpen morph + GL mesh)
- Chat empty-state View illustration
- `docs/APP_STORE.md` privacy nutrition notes

## [0.6.0] — Onboarding & perf

- Pre-chat tip sheet + privacy one-liner
- Memory export via Share (no API keys)
- Haptics on send / check-in
- Chat thread cap (400), memo bubbles, FlatList tuning

## [0.5.0] — Persona & settings depth

- Persona-specific LLM prompt + offline banter flavor
- Chat search + clear thread
- Dark/light theme
- Opt-in local check-in notification stub (`docs/NOTIFICATIONS.md`)

## [0.4.0] — Expression & streak

- M5 blended emotion hints + Think morph
- Daily check-in streak (local timezone)
- Bilingual offline banter packs
- EAS / TestFlight stub docs

## [0.3.x] — MVP core

- Title → persona → Home with GL avatar stage
- Offline chat + BYO OpenAI-compatible LLM + SSE streaming
- On-device TTS, memory notes, delete-all-data
- AsyncStorage persistence, GitHub CI (typecheck + unit tests)

---

**Not shipped:** licensed VRM binaries, Mon Mon chat backend, analytics SDK, real STT.

**Port:** `docs/PORT_TO_WEEPO.md` when `MonMonMars/weepo` is confirmed.
