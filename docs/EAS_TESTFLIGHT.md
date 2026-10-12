# EAS + TestFlight (stub)

This repo ships a **placeholder** [`eas.json`](../eas.json) so the Weepo foundation is ready when Mon creates the **weepo** app in Expo / App Store Connect. No EAS project ID is committed.

## Prerequisites

- Apple Developer account + App Store Connect app (bundle `com.monmon.companion` or weepo ID)
- [Expo EAS CLI](https://docs.expo.dev/build/setup/): `npm i -g eas-cli`
- `eas login`

## One-time project link

From repo root after port to weepo:

```bash
eas init
```

Add to `app.json` under `expo`:

```json
"extra": {
  "eas": {
    "projectId": "<uuid-from-expo>"
  }
}
```

Replace placeholders in `eas.json` → `submit.production.ios` with real Apple ID, ASC app id, team id.

## Build profiles

| Profile | Use |
|---------|-----|
| `development` | Dev client + simulator |
| `preview` | Internal device builds (Ad Hoc / internal distribution) |
| `production` | TestFlight / App Store (`autoIncrement` build number) |

## Suggested first TestFlight

```bash
npm ci
eas build --platform ios --profile preview
# when ready for TestFlight:
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

## Notes for Weepo

- **expo-gl / Three** work in EAS builds; add a **licensed VRM** only after legal sign-off (`docs/VRM_AVATAR.md`).
- Mic/STT plist strings are already in `app.json` for future voice input.
- Secrets: never commit API keys; LLM keys stay on device (AsyncStorage).

## CI

GitHub Actions here only run `typecheck` + `npm test`. EAS builds are manual until weepo repo adds optional EAS workflow.
