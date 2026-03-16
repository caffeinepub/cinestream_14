# CineStream

## Current State
Homepage shows a hero banner, then Continue Watching (if logged in), then a series of TMDB rows: Trending, Popular, Top Rated, Latest Releases, genre rows, and Upcoming.

## Requested Changes (Diff)

### Add
- New `Top10TrendingRow` component: fetches top 10 from TMDB trending/week, renders Netflix-style horizontal scroll row where each card has a large semi-transparent rank number (1–10) overlapping the left edge of the poster, poster zoom on hover, title + rating on hover overlay.
- Section placed directly after the hero banner, before Continue Watching.

### Modify
- `Home.tsx`: import and render `Top10TrendingRow` between hero banner and the Continue Watching block.

### Remove
- Nothing removed.

## Implementation Plan
1. Create `src/frontend/src/components/Top10TrendingRow.tsx` — fetches trending (week), slices to 10, renders horizontal scroll row with Netflix-style rank number cards.
2. Update `src/frontend/src/pages/Home.tsx` — insert `<Top10TrendingRow />` after hero banner block, before the `isLoggedIn && continueMovies` block.
