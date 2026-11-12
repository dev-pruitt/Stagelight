Stagelight: event countdown, animated designs, Spotify, Audius, and local audio. [Live site](https://www.stagelight.t64.org/).
Edit `Event Waiting Screen.dc.html`; run `node scripts/build.mjs` to refresh `index.html`. Stage lives in `EventStage.dc.html`.
Verify: `node scripts/build.mjs --check` and `node --test tests/service.test.mjs`. Serve over HTTP; GitHub Pages publishes `main` at root.
Spotify uses PKCE, Premium, and an exact registered redirect URL. No client secret. [Current API rules](https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide).
Audius plays free public tracks without sign-in. Uploaded audio must be reselected after reload. Apple Music remains unfinished. Companion: `/IridescentLogoAnimator/`. MIT license. Audit: `AUDIT.md`.
