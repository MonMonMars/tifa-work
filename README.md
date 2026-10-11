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
| `npm test` | Unit tests — emotion M5, check-in, offline banter locales, LLM, SSE |

## What’s in this MVP foundation

- **Flow:** Title → persona pick → Home (GL avatar stays mounted) → Chat / Settings overlays  
- **Chat:** Offline banter default; **BYO OpenAI-compatible** `/chat/completions`; optional **SSE streaming** (Settings)  
- **Memory:** Device notes + auto snippets → system prompt (8-turn cap)  
- **Avatar:** expo-gl placeholder mesh + emotion-driven motion + morph bars (VRM: `docs/VRM_AVATAR.md`)  
- **Voice:** expo-speech TTS; offline **EN / 廣東話 / bilingual** banter (`Settings`)  
- **Check-in:** daily streak stub on Home (local only)  
- **M5 expression:** blended emotion hints → morph + stage motion  
- **EAS:** stub `eas.json` + `docs/EAS_TESTFLIGHT.md`  
- **v0.5:** persona LLM/offline flavor, chat search + clear, light theme, check-in notification stub
- **v0.6:** pre-chat tip sheet, memory export share, haptics stubs, chat thread cap + memo bubbles
- **v0.6.1:** avatar poke banter, TTS lip-sync stub, empty-state illustrations, App Store doc  
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
| [PORT_TO_WEEPO.md](./docs/PORT_TO_WEEPO.md) | Copy this foundation into `MonMonMars/weepo` |
| [EAS_TESTFLIGHT.md](./docs/EAS_TESTFLIGHT.md) | EAS build + TestFlight when ready |

## iOS

- Display name **Weepo** · bundle `com.monmon.companion`  
- Mic/speech recognition strings in `app.json` for future STT  
- No `ios/` folder in repo — `npx expo prebuild` / EAS when you ship native builds  

## Security

No secrets in git. User-provided LLM keys are never committed.

## Next after this PR

Licensed VRM, emotion-core package, real STT, EAS/TestFlight, memory export.
