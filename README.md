# Weepo · Companion B2C (tifa-work)

**Weepo** is Mon Mon’s iPhone-first **Expo / React Native** companion — chat, persona, and an expressive avatar stage (Companion B2C). Patterns from [aiva-companion](https://github.com/MonMonMars/aiva-companion) and [amoji-app](https://github.com/MonMonMars/amoji-app).

## Quick start

```bash
npm install
npm start
```

Node **22+** for `npm test`. Open with **Expo Go** (QR) or `npm run ios` on macOS.

| Script | Purpose |
|--------|---------|
| `npm run typecheck` | TypeScript |
| `npm test` | Unit tests (emotion, memory, LLM routing, voice strip, SSE parse) |

## What’s in this MVP foundation

- **Flow:** Title → persona pick → Home (GL avatar stays mounted) → Chat / Settings overlays  
- **Chat:** Offline banter default; **BYO OpenAI-compatible** `/chat/completions`; optional **SSE streaming** (Settings)  
- **Memory:** Device notes + auto snippets → system prompt (8-turn cap)  
- **Avatar:** expo-gl placeholder mesh + emotion-driven motion + morph bars (VRM: `docs/VRM_AVATAR.md`)  
- **Voice:** expo-speech TTS for replies; mic = STT stub (`docs/VOICE.md`)  
- **Privacy copy:** Settings + `docs/PRIVACY.md`  

## BYO LLM

Settings → enable LLM → base URL + API key + model. Keys stay in **AsyncStorage** on device only.

## Ship checklist (Mon)

See **[docs/SHIP_CHECKLIST.md](./docs/SHIP_CHECKLIST.md)** — run through before TestFlight.

Quick smoke:

1. Offline chat works with no keys  
2. TTS on/off in Settings  
3. LLM + stream toggle with your key  
4. Wrong key → offline fallback + banner  
5. Persona switch from Home  
6. CI green on PR  

## Docs map

| Doc | Contents |
|-----|----------|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Modules, routing, expression |
| [VOICE.md](./docs/VOICE.md) | TTS, STT stub, iOS plist |
| [PRIVACY.md](./docs/PRIVACY.md) | App Store–oriented draft |
| [VRM_AVATAR.md](./docs/VRM_AVATAR.md) | When you add `assets/models/*.vrm` |
| [SHIP_CHECKLIST.md](./docs/SHIP_CHECKLIST.md) | Pre-release checklist |

## iOS

- Display name **Weepo** · bundle `com.monmon.companion`  
- Mic/speech recognition strings in `app.json` for future STT  
- No `ios/` folder in repo — `npx expo prebuild` / EAS when you ship native builds  

## Security

No secrets in git. User-provided LLM keys are never committed.

## Next after this PR

Licensed VRM, emotion-core package, real STT, EAS/TestFlight, structured “delete all data”.
