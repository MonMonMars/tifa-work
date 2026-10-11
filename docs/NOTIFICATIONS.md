# Notifications (check-in reminder stub)

Weepo uses **opt-in only** local notifications — no marketing push, no server.

## Current behavior (M5 stub)

- Settings → **Daily check-in reminder** (off by default)
- When enabled: requests iOS/Android notification permission once
- Schedules **at most one** repeating local notification (~10:00 **device local time**)
- Copy: gentle nudge to open the app and tap **Check in** on Home
- Disabling the toggle cancels the scheduled notification

Implementation: `src/services/notifications/checkInReminders.ts` (`expo-notifications`).

## Streak / timezone note

Check-in streaks use **`localDateKey()`** — calendar day in the **device’s local timezone**, not UTC. If the user travels across timezones, streak continuity follows local midnight on the phone. Document this in App Store privacy questionnaire as on-device logic only.

## Before App Store / TestFlight

- Add `expo-notifications` plugin config in `app.json` if required by SDK 57 docs
- Consider letting users pick reminder hour (avoid fixed 10:00)
- Respect Focus / Do Not Disturb — local notifications still obey OS settings
- Do **not** enable by default; no notification on first launch

## Future (post-port)

- Deep link to Home check-in card
- Weekly summary (still local-only)
- No remote push until Mon explicitly adds a backend
