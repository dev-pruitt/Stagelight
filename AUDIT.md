2026-11-11: source/index parity and 16 regression checks pass. Maintenance repairs published to GitHub Pages.
Fixed: saved-audio expiry, file looping, paused-skip timer drift, false completion, hidden failures, SDK readiness and owner-access errors.
Updated: Spotify playlist API, ordered playback, repeat/shuffle reset, token refresh, timeouts, duplicate imports, Safari popup and callback handling.
Verified: real Safari audio upload/playback/reload; live OAuth callback; public HTTPS redirect with path/query preserved; published entry bytes.
Spotify playback blocked by API: app owner needs active Premium; Spotify warns restoration may take hours. App now reports this explicitly. Apple Music deferred.

2026-11-12: live repeat request failed with Device not found. Transfer workaround returned Spotify Server error (500). Startup now unlocks browser audio and starts an explicit queue on the live SDK device before resetting repeat/shuffle. Offline IDs cannot start playback. 19 checks pass; live retest pending.
