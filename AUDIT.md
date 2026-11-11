2026-11-11: maintenance audit. Source builds index directly; build parity and 15 regression checks pass.
Fixed: dead saved audio, single-file looping, paused-skip timer drift, false setlist completion, hidden playback failures, OAuth message origin checks.
Updated: Spotify playlist API, ordered playback, repeat/shuffle reset, token refresh, timeouts, duplicate imports, SDK readiness, Safari popup timing and first-party OAuth callback capture.
Verified: Safari audio upload, duration match, playback completion and reload warning; presentation controls; live dependencies and React integrity.
Published release 3f8e808 matches live bytes. Bare-host HTTPS redirect passes normal TLS/path/query checks. Live Spotify account playback still requires sign-in. Apple Music deferred.
