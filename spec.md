# CineStream

## Current State
CineStream has a loading screen that shows while the app initializes. It currently lacks a cinematic intro experience.

## Requested Changes (Diff)

### Add
- `CinematicIntro` component: full-screen black overlay shown on initial load
- Web Audio API synthesized cinematic sound (deep rumble + rising tone, ~2 seconds)
- Fade-in animation for the CineStream text logo (same wordmark as navbar)
- Circular spinner below the logo
- Fade-out transition after ~2 seconds, revealing homepage
- One-time intro (does not replay on navigation)

### Modify
- `App.tsx` (or root component): wrap homepage render with the intro overlay logic

### Remove
- Nothing removed

## Implementation Plan
1. Create `CinematicIntro.tsx` component:
   - Full-screen black overlay with centered logo + spinner
   - On mount: play synthesized cinematic sound via Web Audio API (deep bass rumble, rising harmonic tone, ~2s)
   - CSS keyframe fade-in for logo (0 → 1 opacity over 0.6s)
   - After 2 seconds total: fade out overlay (opacity 1 → 0 over 0.5s), then unmount
2. Wire into App.tsx: show `CinematicIntro` on first load only (use a ref/state flag), render homepage underneath
3. Homepage reveals naturally as intro fades out
