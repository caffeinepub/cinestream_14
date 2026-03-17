# CineStream

## Current State
The frontend calls TMDB API directly from the browser (`https://api.themoviedb.org/3/`) using a frontend env variable `VITE_TMDB_API_KEY`. This works with a VPN but fails on Indian ISP networks due to direct-browser TMDB blocking/CORS.

The backend has an `http-outcalls/outcall.mo` module that already supports HTTP GET requests from Motoko canisters.

## Requested Changes (Diff)

### Add
- `getTrending()`, `getPopular()`, `getTopRated()`, `getNowPlaying()` Motoko actor methods that use HTTP outcalls to fetch from TMDB and return raw JSON as `Text`
- TMDB API key hardcoded in backend (never exposed to browser)
- 30-minute in-memory cache in the backend per endpoint
- `tmdbBackend.ts` frontend service that calls the actor methods and parses the JSON response

### Modify
- `main.mo` — add 4 TMDB proxy public methods + cache state
- `backend.d.ts` — add type signatures for the 4 new methods
- `useTMDB.ts` — replace direct TMDB fetch calls with actor-based calls for the 4 proxied endpoints
- `tmdb.ts` — keep helper functions (image URLs, search, detail, videos) but mark the 4 proxied functions as deprecated in favor of actor calls

### Remove
- `VITE_TMDB_API_KEY` usage from the 4 main row fetch functions (trending, popular, top_rated, now_playing)

## Implementation Plan
1. Add TMDB cache state and 4 proxy methods to `main.mo` using `OutCall.httpGetRequest`
2. Update `backend.d.ts` with `getTrending()`, `getPopular()`, `getTopRated()`, `getNowPlaying()` returning `Promise<string>`
3. Create `tmdbBackend.ts` — actor-based fetch functions that call the 4 new methods, parse JSON, cache in localStorage
4. Update `useTMDB.ts` — swap `fetchTrendingMovies`, `fetchPopularMovies`, `fetchTopRatedMovies`, `fetchNowPlayingMovies` to use actor methods
5. Validate and deploy
