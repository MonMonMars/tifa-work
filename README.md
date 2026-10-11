# Companion B2C (tifa-work)

iPhone-first **Expo / React Native** companion app — chat, persona, and avatar expression scaffolding for Mon Mon's B2C AI avatar product.

Built from patterns in [aiva-companion](https://github.com/MonMonMars/aiva-companion) (Expo shell, overlay navigation) and [amoji-app](https://github.com/MonMonMars/amoji-app) (emotion → face, modular AI boundaries). Avatar path targets **VRM** long-term; v0.1 uses a visual placeholder with morph bars.

## Quick start

**Requirements:** Node 20+, npm, [Expo Go](https://expo.dev/go) on iPhone (or Xcode simulator on macOS).

```bash
npm install
npm start
```

Then press `i` for iOS simulator (macOS) or scan the QR code with Expo Go.

| Script | Purpose |
|--------|---------|
| `npm start` | Expo dev server |
| `npm run ios` | Open iOS |
| `npm run typecheck` | TypeScript |
| `npm test` | Unit tests (expression adapter) |

## iOS notes

- Bundle ID: `com.monmon.companion` (change in `app.json` before TestFlight).
- Mic/camera plist strings are placeholders until voice (M4).
- No native `ios/` folder committed — use Expo Go or `npx expo prebuild` when you need a dev client for VRM/GL.

## App flow

1. **Title** — load persisted state  
2. **Persona select** — Mika / Ren / Luna  
3. **Home** — avatar placeholder + expression probes  
4. **Chat** (overlay) — message list + composer, offline replies  
5. **Settings** (overlay) — BYO LLM fields (stored locally, network stubbed)

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) and [docs/VRM_AVATAR.md](./docs/VRM_AVATAR.md).

## Folder structure

```
App.tsx                 # Root + overlay navigation
src/
  screens/              # Title, PersonaSelect, Home, Chat, Settings
  components/
    chat/               # Message list, composer, bubbles
    avatar/             # Placeholder stage + expression panel
  domain/               # Personas, messages
  store/                # AsyncStorage + React context
  services/
    ai/                 # LlmProvider, offline banter, LLM stub
    chat/               # sendCompanionMessage
  expression/           # Emotion adapter → morph targets (stub)
  theme/                # Design tokens
docs/
```

## Stubbed vs next

| Area | v0.1 | Next milestone |
|------|------|----------------|
| Chat brain | Offline banter + LLM stub (no fetch) | M3 — OpenAI-compatible client |
| Avatar | Emoji + morph bars | M2 — VRM + expo-gl |
| Emotion | Keyword adapter | M5 — emotion-core / expression-engine |
| Voice | — | M4 — expo-speech, Cantonese |
| Memory | Local notes in settings | Thread into prompts + structured memory |
| Auth / IAP | — | After TestFlight MVP |

## Security

Do not commit `.env` or API keys. Settings fields persist on device via AsyncStorage only.

## License

TBD — product workspace for Mon Mon.
