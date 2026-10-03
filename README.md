# MediDocs landing page

Public static landing page for [medidocs.sk](https://medidocs.sk), served by nginx.
It contains no medical data or API client. App links point to the authenticated
Next.js application; the selected light/dark theme is handed over in the URL.
Manrope fonts are hosted locally.

## Local preview

```bash
docker build -t medidocs-landing .
docker run --rm -p 8080:80 medidocs-landing
```

Open `http://localhost:8080`. The container exposes `/health`; nginx also validates
its configuration in the image build. Node dependencies are development tools and
are not copied into the runtime image.

## Quality

Use Node.js 22 and Python 3.12 for the test preview server and deployment helper.

```bash
npm ci
npm run format:check
npm run lint
npx playwright install chromium webkit
npm test
```

The browser suite verifies desktop/mobile layout, theme persistence and app-link
handoff. Python helpers use the same Google-style Ruff configuration as API/web.
See [CONTRIBUTING.md](CONTRIBUTING.md).

## Production

GitHub Actions validates PRs, then publishes
`ghcr.io/robertopatovsky/medidocs-landing:sha-<full-commit>` on `main`. Coolify runs
the Docker Image application on port 80 and probes `/health`. The workflow checks
nginx and the actual image health before deployment. No source build or runtime
Node process is required. See [production delivery and rollback](ops/README.md).
