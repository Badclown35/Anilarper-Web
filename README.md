# Anilarper Web

A responsive browser/PWA port of the Anilarper Android app. This repository is separate from the Android project and does not modify it.

## Main navigation

- **Home** — continue watching, library overview, favorites, trending titles, profile shortcut.
- **Discover** — AniList search, genre/format/status/season/year filters, pagination, title details, related anime and recommendations.
- **Library** — status filters, search by title/genre, sorting, favorites, episode progress and remove/update actions.
- **Read** — manga and light-novel catalog search, saved reading shelf, chapter/volume progress and official publisher link.
- **More** — recommendations, seasonal schedule, custom lists, MyAnimeList import, music, local video player, community videos, quests, statistics, watch history, profile and backup/restore.

## Data sources and media

- Anime catalog and metadata: AniList GraphQL.
- Manga catalog: Kitsu; light novels: AniList.
- Community videos: the existing Anilarper Media Worker API.
- Music discovery: Internet Archive metadata plus external music-service search links.
- Local music/video: selected by the user through the browser's file picker. The website does not scan device storage or upload those files.

## Local data and compatibility

Personal data is stored in this browser's localStorage. It includes the anime library, reading shelf, custom lists, profile settings, quest rewards, activity history, music links and accent color. JSON backup/restore is provided.

The browser database is separate from Android's Room database and Android SharedPreferences. It does not automatically sync with the APK. Import/export is the current transfer path.

Browsers require the user to choose local media files and may restrict background playback. External music services open their official sites/apps. Manga chapter reading should use official publishers/services; the web catalog is metadata, not a re-hosted reader.

Community video playback requires the media server to be reachable and to allow browser CORS requests. The existing Worker already returns CORS headers.

## Run locally

Open index.html in a modern browser or serve this folder with a static HTTP server. Network-powered catalog/search features need an internet connection.

## Publish with GitHub Pages

1. Open this repository's **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Pushes to main run the deployment workflow. The workflow validates the JavaScript files before publishing.
4. The site URL will be https://badclown35.github.io/Anilarper-Web/.

## Content

Only share media you own or have permission to distribute. Anilarper Web is a catalog and player interface; it does not provide anime downloads.
