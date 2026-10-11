# Port this foundation → `MonMonMars/weepo`

This repo (`tifa-work`) is a **scratchpad / PR host** for the Companion B2C MVP. When `MonMonMars/weepo` exists, transplant the tree below — do not grow large new systems here first.

## Recommended port strategy

1. Create empty Expo app in **weepo** (SDK 57, TypeScript, same `newArchEnabled` if desired).
2. Copy **Keep** paths (below) preserving `src/` layout.
3. Rename identifiers once in weepo:
   - `package.json` → `"name": "weepo"`, align `version` with `app.json`
   - `app.json` → `"slug": "weepo"`, bump `expo.version` to match release
   - Optional: bundle ID `com.monmon.weepo` (currently `com.monmon.companion` in tifa-work)
4. Run `npm ci`, `npm run typecheck`, `npm test`, `npm start`.
5. Copy `.github/workflows/ci.yml` (Node **22**).
6. Re-read `docs/SHIP_CHECKLIST.md` and `docs/PRIVACY.md` under weepo branding.

## File map — **KEEP** (product code)

| Path | Role |
|------|------|
| `App.tsx` | Root navigation + overlays |
| `index.ts` | Expo entry |
| `src/domain/` | Personas, messages, `personaFlavor`, `banterLocale`, `chatThreadLimits` |
| `src/services/memory/` | Share-safe memory export text |
| `src/services/haptics/` | Send / check-in feedback (`expo-haptics`) |
| `src/components/onboarding/` | Pre-chat tip sheet |
| `src/expression/` | Emotion adapter, stage motion, types |
| `src/navigation/types.ts` | Screen union |
| `src/theme/` | `tokens`, `palettes`, `useUi` (dark/light) |
| `src/store/` | AsyncStorage persistence + companion store |
| `src/services/ai/` | LLM, SSE, prompt, memory, offline banter |
| `src/services/chat/` | Send + streaming helpers |
| `src/services/voice/` | TTS, STT stub, speech strip |
| `src/services/checkIn/` | Streak logic |
| `src/services/notifications/` | Check-in reminder stub (`expo-notifications`) |
| `src/components/` | Avatar, chat, ErrorBoundary |
| `src/screens/` | Title, PersonaSelect, Home, Chat, Settings |
| `tests/` | Node unit tests (no Expo runtime) |
| `assets/icon.png`, splash, android icons, `assets/models/README.md` | Brand + VRM placeholder docs |
| `docs/ARCHITECTURE.md`, `VOICE.md`, `PRIVACY.md`, `APP_STORE.md`, `VRM_AVATAR.md`, `SHIP_CHECKLIST.md`, `EAS_TESTFLIGHT.md`, `NOTIFICATIONS.md` | Ship docs (this file too) |
| `eas.json` | EAS build/submit stub (replace Apple placeholders) |

## **KEEP** (config)

| Path | Notes |
|------|--------|
| `package.json` / `package-lock.json` | Adjust name; keep deps aligned |
| `tsconfig.json` | As-is |
| `app.json` | Update slug, version, bundle IDs |
| `.github/workflows/ci.yml` | Node 22 + typecheck + test |

## **DROP** or do not copy

| Path | Why |
|------|-----|
| `node_modules/` | Reinstall on weepo |
| `.expo/`, `dist/`, local build artifacts | Generated |
| Any future `ios/` / `android/` from prebuild | Regenerate in weepo with EAS |
| Unlicensed **`.vrm`** binaries | Never commit; add per `assets/models/README.md` |
| Secrets, `.env`, API keys | BYO LLM keys stay on device only |
| tifa-work–specific README history | Write fresh weepo README; link back to this PR if useful |

## What not to port as-is (revisit in weepo)

- **`companion-b2c` npm name** — rename to `weepo`.
- **Storage key** `@companion_b2c/v1` — optional bump to `@weepo/v1` in weepo (migration note for TestFlight users if any).
- **React Navigation** — still manual stack in `App.tsx`; add navigation library in weepo when ready.

## Minimal verification after port

```bash
npm ci
npm run typecheck
npm test
npm start
```

Smoke: Title → persona → Home GL → Chat offline → Settings LLM/TTS toggles → Delete all local data.

## Source of truth until weepo exists

**PR #1 on `MonMonMars/tifa-work`** (`cursor/companion-b2c-scaffold-808b`) — copy from the merged commit or this branch tip.
