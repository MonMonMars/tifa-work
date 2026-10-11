# Mon ship checklist — Weepo MVP foundation

Use before TestFlight / App Store. All items assume branch `cursor/companion-b2c-scaffold-808b` (PR #1).

## Run locally

- [ ] `npm install`
- [ ] `npm run typecheck` && `npm test`
- [ ] `npm start` → Expo Go on iPhone
- [ ] Title → pick persona → Home GL stage renders
- [ ] Chat offline reply + expression morph bars move
- [ ] Settings → enable TTS → hear assistant reply + first-open greeting when chat is empty
- [ ] Settings → Delete all local data → returns to title, storage empty
- [ ] Home → Check in → streak increments; same-day is idempotent
- [ ] Settings → Offline banter EN / 廣 / EN+廣 → offline chat copy changes
- [ ] Settings → BYO LLM (your key) → chat uses provider; toggle stream on/off
- [ ] LLM wrong key → fallback offline + banner

## Product / brand

- [ ] App name **Weepo** in `app.json`
- [ ] Bundle ID `com.monmon.companion` (change if needed)
- [ ] Icons/splash acceptable for TestFlight

## Avatar / assets

- [ ] No unlicensed VRM in repo (placeholder GL only)
- [ ] When ready: drop VRM per `assets/models/README.md` + `docs/VRM_AVATAR.md`

## Privacy / store

- [ ] Review `docs/PRIVACY.md` with legal
- [ ] App Store privacy questionnaire matches BYO LLM + on-device storage
- [ ] In-app Settings → Privacy & AI section accurate

## Engineering next (post-MVP)

- [ ] EAS project + TestFlight build (dev client if VRM needs native modules)
- [ ] `@amoji/emotion-core` integration (M5)
- [ ] Real STT + mic permission flow
- [ ] React Navigation (optional)
- [ ] Structured memory UI + export (delete all: Settings → Delete all local data)

## CI

- [ ] GitHub Actions green on PR

## Port to weepo repo

- [ ] Follow [PORT_TO_WEEPO.md](./PORT_TO_WEEPO.md) when `MonMonMars/weepo` is ready
