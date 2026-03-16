# CineStream

## Current State

CineStream is a full-stack ICP app (Motoko backend + React/TypeScript frontend) providing a Netflix-style movie streaming experience. The backend manages admin-uploaded movies, per-user watchlists (admin + TMDB), continue watching progress, user profiles (name only), genre interaction scores, and role-based access control. The frontend has a cinematic dark UI with TMDB integration across all rows, a hero banner, Top 10 Trending row, trailer previews on hover, My Watchlist row, Recommended For You row, Continue Watching row, a live search navbar, and an admin content management dashboard.

## Requested Changes (Diff)

### Add
- `isPremium: Bool` field to Movie and MovieInput backend types
- `avatarUrl: Text` field to UserProfile backend type
- Subscription store per user: `{ plan: Text; paymentId: Text; startDate: Int; expiryDate: Int }` with get/save/cancel methods
- `reorderWatchlist([Nat])` and `reorderTMDBWatchlist([Nat])` backend methods to support watchlist drag reordering
- Stripe payment component integration for subscription checkout
- `/subscription` frontend route with cinematic OTT plan card UI (Basic ₹99, Standard ₹199, Premium ₹299), "Most Popular" highlight on Premium
- Premium badge (gold/red gradient) on top-right corner of admin movie cards that have `isPremium=true`
- Locked content preview: when non-subscribed user clicks a premium admin movie, show blurred poster + "Subscribe to watch this movie" message + "Upgrade Plan" button linking to `/subscription`
- User profile dropdown in navbar: display name, subscription plan + expiry, Manage Subscription button, Logout button
- `isPremium` toggle switch in admin Add/Edit movie dialog
- Profile edit modal: display name + avatar URL fields
- Watchlist page enhancements: remove button (already exists for TMDB, add for admin movies displayed in grid), drag-to-reorder via up/down buttons

### Modify
- `UserProfile` backend type: add `avatarUrl: Text` field
- Movie/MovieInput backend: add `isPremium: Bool` field
- Navbar dropdown: replace minimal dropdown with rich profile card showing name, plan, expiry, manage subscription link, logout
- Admin page: add `isPremium` switch in movie form alongside `isFeatured`
- MovieCard component: add gold/red gradient "PREMIUM" badge at top-right when `movie.isPremium` is true
- MoviePlayer page: check subscription status before allowing playback of premium admin movies; show paywall UI if not subscribed
- Watchlist page: enhance reorder capability with up/down controls

### Remove
- Nothing removed

## Implementation Plan

1. **Backend (Motoko)**: Add `isPremium` to Movie/MovieInput, add `avatarUrl` to UserProfile, add subscription store with `saveSubscription`, `getSubscription`, `cancelSubscription` methods, add `reorderWatchlist` and `reorderTMDBWatchlist` methods.
2. **Select Stripe component** before backend generation.
3. **Frontend - SubscriptionPage**: New `/subscription` route with cinematic plan cards (Basic, Standard, Premium). Stripe checkout integration. "Most Popular" badge on Premium card.
4. **Frontend - Navbar**: Upgrade user dropdown to show avatar, display name, plan badge, expiry date, "Manage Subscription" button, and Logout.
5. **Frontend - MovieCard**: Add `isPremium` prop; render gold gradient "PREMIUM" badge at top-right corner when true.
6. **Frontend - TMDBMovieCard / TMDBMovieRow**: No premium badges (TMDB movies are always free).
7. **Frontend - MoviePlayer**: On mount, if movie has `isPremium=true`, check subscription; if not active → render Paywall component (blurred poster, message, Upgrade Plan button).
8. **Frontend - Paywall component**: Blurred poster bg, centered card with lock icon, "Subscribe to watch this movie", "Upgrade Plan" button → `/subscription`.
9. **Frontend - Admin page**: Add `isPremium` Switch to movie form.
10. **Frontend - Watchlist page**: Add reorder (up/down arrows) and ensure remove buttons are visible for all items.
11. **Frontend - Profile modal**: Allow users to set display name and avatar URL, saved to backend.
