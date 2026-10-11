# Architecture — Weepo / Companion B2C

## Product

iPhone-first Expo companion: chat, persona, expressive avatar (procedural GL → VRM later).

## Navigation

```
Title → PersonaSelect → Home (mounted)
                           ├─ Chat overlay
                           └─ Settings overlay
```

## Modules

| Area | Path |
|------|------|
| AI / LLM | `services/ai/` — routing, OpenAI fetch, SSE stream, offline banter, prompt, memory |
| Voice | `services/voice/` — expo-speech TTS, STT stub |
| Chat | `services/chat/` — send + streaming shell helpers |
| Expression | `expression/` — adapter, `stageMotion`, morph mapping |
| Avatar UI | `components/avatar/` — `AvatarStage`, `GlAvatarView`, morph panel |
| Store | `store/` — AsyncStorage, optimistic send, TTS after reply |

## Chat + LLM routing

`pickReplyRoute()` → `offline` | `llm-stream` | `llm-buffered`

1. Optimistic user bubble  
2. Stream path: empty assistant shell → SSE partials → finalize + emotion parse  
3. Buffered/offline: single completion  
4. Failure → offline fallback + banner; stream errors replace shell with apology bubble  

## Expression → avatar

`parseEmotionTagFromReply` / user text → `ExpressionSnapshot` → `stageMotionFromWeights()` drives GL motion + morph bars.

## Voice (M4)

Settings → `deviceTts.speak()` after assistant message. Mic = STT stub only.

## Docs

- `docs/VOICE.md`, `docs/PRIVACY.md`, `docs/VRM_AVATAR.md`, `docs/SHIP_CHECKLIST.md`, `docs/PORT_TO_WEEPO.md`

## Secrets

No API keys in repo. User LLM credentials in AsyncStorage only.
