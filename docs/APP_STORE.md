# App Store readiness (Weepo MVP foundation)

Draft for **Mon’s review** before App Store Connect submission. Pair with [PRIVACY.md](./PRIVACY.md) and legal sign-off.

## App identity

| Field | Current (tifa-work) | Notes for production |
|-------|---------------------|----------------------|
| Display name | Weepo | `app.json` → `expo.name` |
| Bundle ID | `com.monmon.companion` | Consider `com.monmon.weepo` at port |
| Version | See `app.json` / Settings footer | Bump per release |
| Category | Lifestyle or Entertainment | Final with PM |
| Age rating | Likely 12+ (AI chat, mild themes) | Questionnaire-driven |

## Privacy nutrition labels (Apple)

Apple asks what data is **linked to the user** and **used for tracking**. This MVP:

| Data type | Collected? | Linked to user? | Tracking? | Purpose |
|-----------|------------|-----------------|-----------|---------|
| User content (chat text) | Yes, on device | No account — device-local only | No | App functionality |
| User content (memory notes) | Yes, on device | Same | No | App functionality |
| Other user content (check-in streak) | Yes, on device | Same | No | App functionality |
| Email / name | No | — | — | — |
| Precise location | No | — | — | — |
| Identifiers (advertising) | No | — | — | — |
| Diagnostics / analytics | No SDK shipped | — | — | — |

**Third-party disclosure (user-controlled):**

- When **BYO LLM** is enabled, chat text is sent to the **API provider the user configures** (e.g. OpenAI). That transfer is between the user’s device and that vendor — not a Mon Mon backend in this build.
- **TTS**: reply text goes to the **OS speech engine** (on-device / Apple TTS pipeline).

Suggested App Store Connect answers:

- **Data Not Collected** for categories the app does not touch (location, contacts, photos, etc.).
- **Data Used to Track You**: None.
- **Data Linked to You**: Minimal or none if no account — emphasize on-device storage; optional LLM is user-initiated outbound.

## Data collected sheet (in-app / support)

| What | Where stored | Leaves device? | User control |
|------|--------------|----------------|--------------|
| Chat per persona | AsyncStorage | Only if BYO LLM on → user’s API | Clear thread; delete all data |
| Memory notes | AsyncStorage | No (export via Share is user-initiated) | Export text; delete all data |
| LLM URL, API key, model | AsyncStorage | Key to configured API only | Disable LLM; delete all data |
| Voice / theme / notification prefs | AsyncStorage | No | Settings toggles; delete all data |
| Check-in streak | AsyncStorage | No | Delete all data |

## Permissions (Info.plist / manifest)

| Permission | Used in MVP? | Purpose string |
|------------|--------------|----------------|
| Notifications | Opt-in only | Daily check-in reminder (local) |
| Microphone | **No** (STT stub) | Strings present for future STT |
| Speech recognition | **No** (stub) | Future hands-free |
| Camera | **No** | Declared unused |

## AI / companion disclosure

Required copy (also in Settings → Privacy & AI):

- Replies are **AI-generated**, not human.
- **Not** medical, legal, or crisis professional advice.
- Optional LLM sends messages to **user-chosen** provider.

Pre-chat tip sheet (`PreChatTipSheet`) covers first-run privacy one-liner.

## Assets & content

- [ ] No unlicensed **VRM** or third-party avatar binaries in repo (GL placeholder only).
- [ ] Icons, splash, screenshots for 6.7" and 6.1" (marketing).
- [ ] App Preview optional post-MVP.

## TestFlight checklist

See [EAS_TESTFLIGHT.md](./EAS_TESTFLIGHT.md) and [SHIP_CHECKLIST.md](./SHIP_CHECKLIST.md).

## Export compliance

Standard encryption (HTTPS to user LLM) — typically ** exempt** annual self-classification; confirm with legal for your entity.

## Review notes (for App Review team)

Suggested text:

> Weepo is a companion chat app with an on-device avatar preview. Default mode uses offline canned replies. Users may optionally enter their own OpenAI-compatible API key; we do not provide hosted AI. No login. Delete all local data in Settings. Notifications are opt-in local reminders only.
