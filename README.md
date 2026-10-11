# Weepo · Companion B2C (tifa-work)

**Weepo** (Mon Mon’s Companion B2C) is an iPhone-first **Expo / React Native** app for AI avatar chat and companionship — with room to grow into work-use flows later.

Patterns from [aiva-companion](https://github.com/MonMonMars/aiva-companion) (overlay navigation, home-mounted stage) and [amoji-app](https://github.com/MonMonMars/amoji-app) (emotion → face, AI module boundaries). Long-term avatar format: **VRM**; current build uses **expo-gl + Three.js** procedural mesh plus morph bars until a licensed VRM is added.

## Quick start

**Requirements:** Node 22+ (for local tests), npm, [Expo Go](https://expo.dev/go) on iPhone (or Xcode simulator on macOS).

```bash
npm install
npm start
```

Press `i` for iOS simulator or scan the QR code with Expo Go.

| Script | Purpose |
|--------|---------|
| `npm start` | Expo dev server |
| `npm run ios` | Open iOS |
| `npm run typecheck` | TypeScript |
| `npm test` | Unit tests |

## iOS notes

- App display name: **Weepo** · bundle ID `com.monmon.companion`
- **expo-gl** 3D stage runs on device/simulator; Expo Go is fine for this milestone
- Mic/camera plist strings are placeholders until voice (M4)
- No committed `ios/` folder — use `npx expo prebuild` when you need a custom dev client

## App flow

1. **Title** — load AsyncStorage state  
2. **Persona select** — Mika / Ren / Luna  
3. **Home** — GL avatar stage + morph/expression panel (stays mounted under overlays)  
4. **Chat** — message list, send states, offline or BYO LLM  
5. **Settings** — OpenAI-compatible base URL, API key, model (device-only)

## BYO LLM (M3)

1. Open **Settings** → enable **LLM slot**  
2. Set **Base URL** (e.g. `https://api.openai.com/v1`)  
3. Paste **API key** (stored in AsyncStorage only — never in repo)  
4. Chat uses `POST …/chat/completions` with persona + short device memory in the system prompt  

If the provider fails, Weepo **falls back to offline banter** and shows a short error banner.

## Folder structure

```
App.tsx
src/
  screens/          Title, PersonaSelect, Home, Chat, Settings
  components/
    chat/           List, composer, bubbles
    avatar/         AvatarStage (GL + morph panel)
  services/ai/      openAiCompatible, offlineBanter, prompt, memoryExtract
  store/            companionStore + persistence
  expression/       emotion adapter → morph targets
docs/               ARCHITECTURE, VRM_AVATAR
```

## Shipped vs next

| Area | Now | Next |
|------|-----|------|
| Chat brain | Offline banter + **live OpenAI-compatible fetch** | Streaming, tools, Apple FM |
| Memory | Settings notes + auto snippets + prompt injection | Structured memory UI |
| Avatar | **expo-gl placeholder mesh** + morph bars | Licensed VRM rig |
| Emotion | Keyword + `[emotion:…]` tags | `@amoji/emotion-core` |
| Voice | — | M4 expo-speech / Cantonese |
| Auth / IAP | — | Post–TestFlight MVP |

## Security

No API keys in git. User keys live in AsyncStorage on device only.

## License

TBD — product workspace for Mon Mon.
