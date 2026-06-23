# Stagelight — Event Waiting Screen

A self-contained, browser-based "we'll begin shortly" countdown screen for events,
all-hands, webinars, and launches. Drop in a logo, the theme adapts to it, set a
countdown, and optionally play **real full-length tracks** through your own Spotify
account — no backend, no client secret.

> **Live screen:** `index.html` is the deployable build. Open it directly or host it
> on GitHub Pages. The `.dc.html` files are the editable source.

---

## Spotify connection (PKCE, no server)

This app uses the **Authorization Code flow with PKCE**. PKCE is designed for public
clients (single-page apps), so:

- ✅ Only a **Client ID** is needed — it is public and safe to ship in the browser.
- ❌ **No Client Secret** is ever used or stored. Never put one in this repo.
- 🔒 The short-lived `code_verifier` and tokens live only in the visitor's `localStorage`.

Full-track playback in the browser also requires the listener to have **Spotify Premium**
(a Web Playback SDK requirement, not ours).

### 1. Create a Spotify app

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. **Create app**. Name it anything (e.g. "Stagelight").
3. Copy the **Client ID**.

### 2. Register your redirect URI

The app's redirect URI is **its own URL** (`origin + pathname`). Add the *exact*
URL where the page is served, including the trailing path, to **Redirect URIs** in
your Spotify app settings. Examples:

| Where it runs | Redirect URI to register |
| --- | --- |
| GitHub Pages (project site) | `https://<user>.github.io/<repo>/` |
| Local file / preview | the URL shown in the app's **Connect Spotify** panel |
| Custom domain | `https://your-domain.com/` |

The Connect panel prints the exact URI with a **Copy** button — paste that value
verbatim. A mismatch (even a missing slash) is the #1 cause of auth failures.

Under **Which API/SDKs are you planning to use?** tick **Web Playback SDK**.

### 3. Connect & pick a track

1. Open the screen, scroll to **Music → Spotify**, and click **Connect Spotify**
   (the Client ID is baked into the build, so visitors don't see any setup fields).
2. Approve in the popup.
3. In Spotify, find a song → **Share → Copy Song Link**, then **paste the link**
   into the box and hit **Add track**. Pick it and **Begin presentation**.

> **Why paste a link instead of search?** As of Spotify's Nov 27 2024 API changes,
> the **search/catalog endpoints require Extended Quota Mode**, which self-registered
> developer apps don't have (search returns a misleading `Invalid limit` / empty
> result). Playing a *known* track uses the **Player API**, which still works on a
> Premium account — so we paste the track link rather than search. Title and artwork
> are filled in from Spotify's public oEmbed and the Web Playback SDK, not the
> restricted catalog API.

No account or not Premium? Use **Skip — use the demo library** for ambient placeholder
tracks, or **Upload** a local audio file — both work with no Spotify at all.

---

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch
   `main`, folder `/ (root)`.
3. Your site goes live at `https://<user>.github.io/<repo>/`.
4. Register that exact URL as a Redirect URI (see above).

Because `index.html` is fully self-contained, no build step is required.

---

## Editing the source

The app is authored as Design Components:

- `Event Waiting Screen.dc.html` — the builder UI + all Spotify/auth logic.
- `EventStage.dc.html` — the projected screen (countdown, blobs, now-playing).
- `index.html` — the bundled, deployable standalone build.

After editing the `.dc.html` source, re-export the standalone to refresh `index.html`.

---

## Roadmap

- [ ] Apple Music (MusicKit) — scaffolded, needs a developer token.
- [ ] Optional serverless token-exchange (for refresh tokens / non-Premium fallbacks).
- [ ] Playlist queue instead of a single track.

## License

MIT — see [LICENSE](./LICENSE).
