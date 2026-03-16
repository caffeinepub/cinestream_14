# CineStream

## Current State
CineStream is a full-stack Netflix-style OTT platform built on ICP. The backend (Motoko) manages admin movies, user watchlists (both admin and TMDB), and a Continue Watching system with progress tracking per Internet Identity user. The frontend uses React/Tailwind and features: TMDBHeroBanner (auto-rotating top 5 trending), Top10TrendingRow (Netflix-style ranked cards), TMDBTrendingRow, TMDBCategoryRow, TMDBGenreRow, and a MovieRow for admin movies. TMDBMovieCard has a TrailerPreviewCard hover system (1s delay, floating overlay with Play + More Info buttons). MovieCard is for admin movies and accepts `progress` for the Continue Watching bar.

## Requested Changes (Diff)

### Add
- Backend: `genreInteractions` store per user — records TMDB genre IDs with accumulated weighted score (watched admin movie = 3pts, opened TMDB detail page = 1pt)
- Backend: `recordGenreInteraction(genreIds: [Nat], weight: Nat)` — adds weighted score to each genre for the caller
- Backend: `getTopGenres()` — returns top genre IDs sorted by score for the caller
- Frontend: `RecommendedRow` component — fetches top genres from backend, queries TMDB `/discover/movie` filtered by genre, shows ~20 cards; falls back to trending if no history; hidden when logged out
- Frontend: `MyWatchlistRow` component — fetches TMDB watchlist IDs, renders TMDB movie cards in a row; hidden when logged out or empty
- Frontend: "Add to Watchlist" `+` button inside TrailerPreviewCard hover overlay; calls addToTMDBWatchlist/removeFromTMDBWatchlist
- Frontend: Section header style upgrade across all rows — OTT-style typography with subtle red glow, uppercase category label, and "See All" link
- Frontend: Cinematic hover effects on all movie cards — lift + red glow box-shadow, scale-up animation
- Frontend: Remaining time display on Continue Watching cards on hover
- Frontend: Smooth momentum horizontal scrolling on all row containers

### Modify
- TMDBMovieDetail page: call `recordGenreInteraction` with movie's genre IDs (weight 1) when the page loads
- MoviePlayer page: call `recordGenreInteraction` with movie's genre (mapped to TMDB genre ID) when progress saves (weight 3)
- TrailerPreviewCard: add `+` / checkmark watchlist button to hover overlay
- MovieCard: show remaining time text on hover over progress bar
- TMDBMovieRow / MovieRow: smooth scrolling with CSS scroll-behavior and momentum (webkit-overflow-scrolling)
- All row section headers: apply new glowing OTT header style
- Home.tsx: add RecommendedRow and MyWatchlistRow in correct order: Hero → Top10 → ContinueWatching → RecommendedRow → MyWatchlistRow → Trending → rest

### Remove
- Nothing removed

## Implementation Plan
1. Update `main.mo` to add genre interaction store + two new API methods
2. Regenerate `backend.d.ts` types
3. Update `useQueries.ts` to add `useRecordGenreInteraction`, `useTopGenres` hooks
4. Create `RecommendedRow.tsx` using top genres → TMDB discover endpoint
5. Create `MyWatchlistRow.tsx` using TMDB watchlist IDs
6. Update `TrailerPreviewCard.tsx` to accept watchlist props and show +/check button
7. Update `TMDBMovieCard.tsx` to pass watchlist props down
8. Update `MovieCard.tsx` to show remaining time on hover
9. Create shared `SectionHeader.tsx` with OTT glow style
10. Apply new header to `TMDBMovieRow.tsx`, `MovieRow.tsx`, `Top10TrendingRow.tsx`
11. Add CSS hover lift+glow effect to all card containers
12. Update `TMDBMovieDetail.tsx` to call `recordGenreInteraction` on load
13. Update `Home.tsx` row order with new rows
14. Apply smooth momentum scrolling to all scroll containers
