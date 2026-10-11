# Contributing — Weepo / tifa-work

Short guide for **Mon** and **Cursor agents** working in `MonMonMars/tifa-work` (Companion B2C foundation). Target port repo: `MonMonMars/weepo` — see `docs/PORT_TO_WEEPO.md`.

## Scope guardrails

- **In scope:** Expo RN companion UX, offline banter, BYO LLM slot, device-local memory, focus/check-in stubs, docs, CI tests.
- **Out of scope for this repo unless Mon asks:** licensed **VRM binaries**, accounts/IAP, backend, remote push.

## Dev loop

```bash
npm install
npm run typecheck
npm test
npm start
```

Node **22+** for unit tests. Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`.

## Branches & PRs

- Cloud agents use `cursor/<topic>-808b` off the active scaffold branch.
- Keep PRs **small and reviewable**; update `CHANGELOG.md` for user-visible bumps.
- Do not commit API keys or `.env` secrets.

## Code conventions

- Imports at **top of file** (no inline imports).
- TypeScript **exhaustive switches** on unions (`default: never`).
- Device calendar days: use **`src/domain/localDateKey.ts`** for streaks, focus, and history — not UTC.
- Node tests import with **`.ts` extensions** where required (`focusSession.ts`, `streak.ts`).

## Before you mark ready

1. `npm run typecheck` and `npm test` green  
2. Bump `package.json` / `app.json` / Settings footer version together  
3. Run security scan if your agent workflow requires it (Aikido)  
4. Update PR description; leave draft off when Mon asked for review  

## Questions

Architecture: `docs/ARCHITECTURE.md` · Ship: `docs/SHIP_CHECKLIST.md` · Privacy: `docs/PRIVACY.md`
