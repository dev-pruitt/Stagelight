2026-11-11: source/index parity and 16 regression checks pass. Maintenance repairs published to GitHub Pages.
Fixed: saved-audio expiry, file looping, paused-skip timer drift, false completion, hidden failures, SDK readiness and owner-access errors.
Updated: Spotify playlist API, ordered playback, repeat/shuffle reset, token refresh, timeouts, duplicate imports, Safari popup and callback handling.
Verified: real Safari audio upload/playback/reload; live OAuth callback; public HTTPS redirect with path/query preserved; published entry bytes.
Spotify playback blocked by API: app owner needs active Premium; Spotify warns restoration may take hours. App now reports this explicitly. Apple Music deferred.

2026-11-12: startup now transfers playback to the live SDK device and observes active status before repeat/shuffle/play. Preview uses the same path. 19 checks pass. Live playback verification pending.
