# Anilarper Web

Browser port of the Anilarper Android app. The Android repository remains separate.

## Current port
- Midnight theme with violet/pink accents and responsive mobile layout.
- Five primary destinations: Home, Discover, Library, Read, More.
- AniList-powered anime discovery and trending titles.
- Browser-local anime library with status management and JSON backup import/export.
- Kitsu-powered manga search.
- Community Videos connects to the existing Anilarper Media Worker API and plays returned stream paths in the browser.

## Run locally
Open `index.html` in a modern browser or serve this folder with any static HTTP server.

## Deploy
GitHub Actions deploys the static site to GitHub Pages when enabled in repository settings (Settings → Pages → Build and deployment → GitHub Actions).

## Data and compatibility
The web library uses browser localStorage and does not automatically sync with the Android app's Room database. Community video playback requires the configured media server to be reachable by the browser and to permit cross-origin requests. Only upload or share media you have rights to distribute.
