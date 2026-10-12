# Voice (M4 foundation)

Weepo uses **on-device text-to-speech** first — no cloud voice API keys in this repo.

## TTS (shipped)

- Package: `expo-speech` (`src/services/voice/tts.ts`)
- Trigger: after each assistant reply when **Settings → Speak replies** is on
- Controls: enable/disable, rate `0.75–1.25`, locale (`en-US`, `zh-HK`, etc.)
- Emotion: assistant `emotionTag` nudges pitch/rate (joy = brighter, sadness = slower, etc.)
- Pattern source: lean version of [aiva-companion `nativeSpeech.js`](https://github.com/MonMonMars/aiva-companion) — no cloud TTS matrix in M4

## STT (stub)

- Interface: `src/services/voice/sttStub.ts`
- Chat composer **mic** shows an explainer alert — no recording yet
- Future options: Apple Speech, `expo-speech-recognition`, or BYO websocket (document before enabling)

## iOS Info.plist (already in `app.json`)

When you implement real mic capture, ensure these strings match product copy:

| Key | Purpose |
|-----|---------|
| `NSMicrophoneUsageDescription` | Mic access for voice input |
| `NSSpeechRecognitionUsageDescription` | On-device/cloud STT (if used) |

Expo merges them on prebuild / EAS. **Expo Go** uses the manifest values from this project.

## Testing on device

1. Settings → enable **Speak replies**
2. Open chat, send a message
3. Assistant bubble appears → system voice reads the reply (device volume up)

Cantonese: set locale to `zh-HK` if the device has a Cantonese system voice installed.
