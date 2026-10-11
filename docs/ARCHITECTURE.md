# Architecture

## Product

Companion B2C — iPhone-first Expo companion with AI chat and expressive avatar (Mon Mon / tifa-work).

## Navigation (AIVA pattern)

State machine in `App.tsx` (not React Navigation yet — intentional for overlay model):

```
Title → PersonaSelect → Home (always mounted)
                           ├─ overlay: Chat
                           └─ overlay: Settings
```

Home retains the avatar stage so expression state is continuous when chat opens/closes.

## Layers

| Layer | Path | Role |
|-------|------|------|
| UI screens | `src/screens/` | Title, persona pick, home, chat, settings |
| Components | `src/components/` | Chat bubbles, composer, avatar placeholder |
| Domain | `src/domain/` | Personas, message types |
| Store | `src/store/` | AsyncStorage persistence + React context |
| Chat service | `src/services/chat/` | Orchestrates send flow |
| AI | `src/services/ai/` | `LlmProvider` interface, offline banter, LLM stub |
| Expression | `src/expression/` | Adapter toward emotion-core / morph targets |

## Chat flow

1. User sends text in `ChatScreen`.
2. `companionStore.sendMessage` updates expression from user text (preview).
3. `chatService.sendCompanionMessage` calls `llmProviderStub`.
4. Default: **offline banter** (`offlineBanter.ts`).
5. If LLM enabled + keys present: **stub message** (no network in v0.1).
6. Assistant reply parsed for `[emotion:…]` tags → `ExpressionSnapshot` → avatar UI.

## What is stubbed

- Network LLM (OpenAI-compatible fetch) — M3
- VRM 3D stage — M2 (`docs/VRM_AVATAR.md`)
- `@amoji/emotion-core` package — M5 (keyword adapter today)
- Voice (expo-speech / Edge TTS) — M4
- Cloud auth, IAP — later

## Secrets

No API keys in repo. Settings writes keys to AsyncStorage on device only.
