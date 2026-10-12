# Public web demo (GitHub Pages)

Mon-approved **clickable HTTPS demo** of Weepo / Companion B2C — no clone or TestFlight required.

## Live URL

**https://monmonmars.github.io/tifa-work/**

(Static export from this repo’s `cursor/companion-b2c-scaffold-808b` branch / PR #1 until merged to `main`.)

## What works in the browser

- Full UI flow: title → persona → Home → Chat / Settings  
- Offline banter, quick-reply chips, check-in, focus widgets (device-local logic)  
- BYO LLM if you paste keys (stored in **localStorage** — demo only; use a throwaway key)  
- expo-gl avatar stage when WebGL is available; emoji fallback otherwise  
- Native-only pieces degrade gracefully: haptics, notifications, Share sheet may be limited on web  

**Not included:** licensed VRM binaries, IAP, accounts.

## One-time repo setup (Mon) — required for live URL

Until this is done, **Deploy web demo** builds the site but Pages returns **404**.

1. Open **https://github.com/MonMonMars/tifa-work/settings/pages**  
2. **Build and deployment** → Source: **GitHub Actions** (not “Deploy from branch”)  
3. **Actions** → **Deploy web demo** → **Run workflow** (or push any commit to `cursor/**` / `main`)  
4. When the **deploy** job succeeds, open **https://monmonmars.github.io/tifa-work/**

## Refresh / redeploy

Automatic on push to `main` or `cursor/**` (see `.github/workflows/deploy-web-demo.yml`):

```bash
npm ci
npm run export:web   # writes static site to dist/
```

Manual from your machine:

```bash
npm ci
npm run typecheck && npm test
npm run export:web
# CI uploads dist/ — local upload is only needed if bypassing Actions
```

To redeploy: **push a commit** to the PR branch (or run **Actions → Deploy web demo → Run workflow**).

## Local web dev

```bash
npm install
npm run web          # dev server
npm run export:web   # production static bundle (same as Pages)
```

Subpath hosting uses `experiments.baseUrl` `/tifa-work` in `app.json` so assets resolve on GitHub Pages.

## Security

- Do not commit API keys.  
- Demo is public — treat any LLM key entered in Settings as exposed to anyone with the URL on that browser profile.
