# Architecture — Weepo / Companion B2C

## Product

iPhone-first Expo companion: chat, persona, expressive avatar (procedural GL → VRM later). **Work angle:** on-device focus blocks + optional work notes (no cloud).

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

## Expression → avatar (M5)

`emotionAdapter.ts` (M5) blends **multiple** EN + 廣東話 keyword hints → weights.  
`parseEmotionTagFromReply` merges LLM `[emotion:…]` tags with reply text heuristics.  
`ExpressionSnapshot` → `stageMotionFromWeights()` + `weightsToMorphTargets()` (incl. **Think** morph).

## Check-in / streak (stub)

`services/checkIn/streak.ts` — local calendar streak, persisted in AsyncStorage. Home **Check in** button.

## Focus mode (work companion)

`services/focus/` — pure session state machine (`focusSession.ts`), offline encouragement lines (`focusBanter.ts`).

- Home **Focus today** card: 25 / 50 / custom minutes, countdown, stop or auto-complete.
- Persists **minutes today** (device local day, same `localDateKey` as streaks) + optional resumable `active` session.
- End of session: optional note → prefixed `Focus · …` in device memory notes (not cloud).
- Settings → **Focus session tips** toggles offline start/complete copy (persona + banter pack).

Timer tick lives in UI; store updates on start/stop/complete and reconciles expired sessions on cold start.

## Offline banter locales

`offlineBanterPacks.ts` — `en` | `zh-HK` | `bilingual` (Settings → Offline banter language). No external APIs.

## Voice (M4)

Settings → `deviceTts.speak()` after assistant message. Mic = STT stub only.

## Docs

- `docs/VOICE.md`, `docs/PRIVACY.md`, `docs/VRM_AVATAR.md`, `docs/SHIP_CHECKLIST.md`, `docs/PORT_TO_WEEPO.md`

## Secrets

No API keys in repo. User LLM credentials in AsyncStorage only.
