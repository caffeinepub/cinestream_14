# CineStream

## Current State
CineStream is a full OTT streaming platform with a Navbar, Home page (movie rows), movie detail pages, admin dashboard, watchlist, subscriptions, and a custom video player. The Navbar has links: Home, Browse, My List (logged in), Admin (admin only). Routes are managed via TanStack Router in App.tsx.

## Requested Changes (Diff)

### Add
- New `/music` route and `MusicPage` component
- `MusicCard` component: thumbnail, song title, artist name, play button (opens audio/preview inline or placeholder)
- Four music category sections on MusicPage: Trending Songs, Bollywood Hits, LoFi Beats, Punjabi Songs
- Each category shows a horizontal scroll row of `MusicCard` items (static curated mock data, ~8 cards per category)
- "Music" nav link in the Navbar (desktop nav + mobile menu)
- Spotify-inspired dark UI: deep black/dark-gray backgrounds, green accent for play buttons, rounded cards, album-art style thumbnails

### Modify
- `Navbar.tsx`: add Music link (desktop + mobile)
- `App.tsx`: register `/music` route

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/pages/Music.tsx` — MusicPage with 4 category sections, each containing a horizontal scroll row of MusicCard components, using static mock song data
2. Create `src/frontend/src/components/MusicCard.tsx` — card with thumbnail (colored gradient placeholder or image), song title, artist name, play/pause toggle button with green accent
3. Update `Navbar.tsx` — add Music nav link in desktop nav and mobile menu
4. Update `App.tsx` — import MusicPage, create musicRoute at `/music`, add to routeTree
