# Architecture

## Product

**Weepo** / Companion B2C — iPhone-first Expo companion (Mon Mon / tifa-work).

## Navigation (AIVA pattern)

```
Title → PersonaSelect → Home (always mounted)
                           ├─ overlay: Chat
                           └─ overlay: Settings
```

Home keeps the avatar stage mounted so expression state continues when chat opens/closes.

## Layers

| Layer | Path | Role |
|-------|------|------|
| UI | `src/screens/` | Flow + overlays |
| Avatar | `src/components/avatar/` | `AvatarStage`, `GlAvatarView`, `MorphTargetPanel` |
| Chat UI | `src/components/chat/` | List, composer, bubbles |
| Store | `src/store/` | AsyncStorage persistence, optimistic send |
| AI | `src/services/ai/` | Prompt, OpenAI-compatible fetch, offline fallback |
| Chat | `src/services/chat/` | Reply orchestration + emotion parse |
| Expression | `src/expression/` | Adapter → morph weights |

## Chat flow (M3)

1. User sends in `ChatScreen` → optimistic user bubble in store.  
2. `extractMemoryNote` may append a short device memory line.  
3. `openAiCompatibleProvider.complete`:  
   - Not configured → `offlineBanter`  
   - Configured → `fetch` to `{baseUrl}/chat/completions` (45s timeout)  
   - On failure → offline reply + `llmError` banner  
4. Assistant text parsed for `[emotion:…]` → `ExpressionSnapshot` → home stage + morph bars.

## Memory

- User-editable notes in Settings (max 12 strings in persistence).  
- Auto-extracted snippets from chat (name, work, location heuristics).  
- Last few notes injected into system prompt via `buildSystemPrompt`.  
- History capped to **8** turns in LLM payload (`PROMPT_HISTORY_CAP`).

## Avatar (M2 partial)

- `GlAvatarView`: expo-gl + Three.js icosahedron driven by expression weights (pulse/rotation).  
- Badge: **GL placeholder · VRM TODO** — see [VRM_AVATAR.md](./VRM_AVATAR.md).  
- On WebGL failure → emoji static fallback inside `AvatarStage`.

## Still stubbed / later

- VRM load + blend shapes  
- `@amoji/emotion-core` package  
- Voice (M4), auth/IAP  
- React Navigation (optional refactor)

## Secrets

No keys in repo. `llmConfig` in AsyncStorage only.
