import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useIsMobile } from "../hooks/use-mobile";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useTMDBWatchlistIds,
  useTMDBWatchlistMutations,
} from "../hooks/useQueries";
import type { TMDBMovie } from "../types/tmdb";
import SectionHeader from "./SectionHeader";
import TrailerModal from "./TrailerModal";
import TrailerPreviewCard from "./TrailerPreviewCard";

const TMDB_API_KEY = "fadb0b01b6573c9e09695a7b0498aa71";
const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6"];

function useTop10Trending() {
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb-top10-trending"],
    queryFn: async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}`,
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      return (data.results as TMDBMovie[]).slice(0, 10);
    },
    staleTime: 1000 * 60 * 10,
  });
}

// Responsive sizing constants
// Desktop: card=200px, poster=130px, numW=90px, cardH=260px, posterH=195px
// Mobile:  card=140px, poster=92px,  numW=64px, cardH=184px, posterH=138px
const SIZES = {
  desktop: {
    cardW: 200,
    cardH: 260,
    posterW: 130,
    posterH: 195,
    numW: 90,
    numFontLarge: "8.5rem",
    numFont10: "6.5rem",
    numStroke: "3px",
    posterOffset: 20, // how many px the number bleeds behind poster
  },
  mobile: {
    cardW: 140,
    cardH: 184,
    posterW: 92,
    posterH: 138,
    numW: 64,
    numFontLarge: "5.2rem",
    numFont10: "4rem",
    numStroke: "2px",
    posterOffset: 16,
  },
};

function SkeletonTop10Card({ isMobile }: { isMobile: boolean }) {
  const s = isMobile ? SIZES.mobile : SIZES.desktop;
  return (
    <div className="flex-shrink-0" style={{ width: s.cardW }}>
      <div className="flex items-end" style={{ height: s.cardH }}>
        <div
          className="flex-shrink-0"
          style={{ width: s.numW, height: s.numW * 1.5 }}
        >
          <Skeleton className="w-full h-full rounded skeleton-shimmer bg-white/10" />
        </div>
        <Skeleton
          className="flex-shrink-0 rounded-md skeleton-shimmer bg-white/10"
          style={{
            width: s.posterW,
            height: s.posterH,
            marginLeft: -s.posterOffset,
          }}
        />
      </div>
    </div>
  );
}

interface Top10CardProps {
  movie: TMDBMovie;
  rank: number;
  index: number;
  isInWatchlist: boolean;
  onWatchlistToggle: () => void;
  isLoggedIn: boolean;
  isMobile: boolean;
}

function Top10Card({
  movie,
  rank,
  index,
  isInWatchlist,
  onWatchlistToggle,
  isLoggedIn,
  isMobile,
}: Top10CardProps) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [activeTrailerKey, setActiveTrailerKey] = useState<string | null>(null);
  const s = isMobile ? SIZES.mobile : SIZES.desktop;

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
    : null;

  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

  const handleMoreInfo = () => {
    navigate({ to: "/tmdb/$id", params: { id: movie.id.toString() } });
  };

  const posterBoxShadow = hovered
    ? "0 16px 40px rgba(0,0,0,0.8), 0 0 20px rgba(229,9,20,0.2)"
    : "0 8px 32px rgba(0,0,0,0.7)";

  const posterTransform = hovered ? "scale(1.07) translateY(-4px)" : "scale(1)";

  // Number font size based on rank digits and screen
  const numFontSize = rank >= 10 ? s.numFont10 : s.numFontLarge;

  return (
    <>
      <TrailerPreviewCard
        movieId={movie.id}
        title={movie.title}
        rating={movie.vote_average}
        onPlay={(key) => setActiveTrailerKey(key)}
        onMoreInfo={handleMoreInfo}
        isInWatchlist={isInWatchlist}
        onWatchlistToggle={onWatchlistToggle}
        isLoggedIn={isLoggedIn}
      >
        <button
          type="button"
          className="flex-shrink-0 cursor-pointer bg-transparent border-0 p-0 text-left"
          style={{ width: s.cardW }}
          data-ocid={`top10_row.item.${index}`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={handleMoreInfo}
          aria-label={`${rank}. ${movie.title}`}
        >
          {/*
           * Layout: fixed-height container.
           * Number sits at bottom-left (zIndex 1).
           * Poster sits at bottom-right, overlapping number by posterOffset px (zIndex 2).
           * This ensures the number is always partially visible to the left of the poster.
           */}
          <div
            className="relative"
            style={{
              height: s.cardH,
              // Extra left padding so the number is never clipped by the scroll container
              paddingLeft: 0,
            }}
          >
            {/* Large rank number — sits behind the poster */}
            <div
              className="absolute left-0 bottom-0 flex items-end justify-start"
              style={{
                zIndex: 1,
                width: s.numW,
                // Vertically align bottom of number with bottom of poster
                height: s.posterH + 8,
                paddingBottom: 2,
              }}
            >
              <span
                style={{
                  fontFamily:
                    "'BricolageGrotesque', 'Playfair Display', Georgia, serif",
                  fontSize: numFontSize,
                  fontWeight: 900,
                  lineHeight: 1,
                  color: "transparent",
                  // Bold stroke outline for readability on dark backgrounds
                  WebkitTextStroke: `${s.numStroke} rgba(255,255,255,0.7)`,
                  // Subtle red-tinted glow so the number reads against any poster edge
                  textShadow:
                    "0 0 18px rgba(229,9,20,0.35), 0 0 40px rgba(0,0,0,0.9)",
                  letterSpacing: "-0.04em",
                  userSelect: "none",
                  display: "block",
                }}
              >
                {rank}
              </span>
            </div>

            {/* Poster — positioned to leave the number visible on the left */}
            <div
              className="absolute bottom-0 overflow-hidden rounded-md"
              style={{
                // Start after (numW - posterOffset) so number peeks out on left
                left: s.numW - s.posterOffset,
                width: s.posterW,
                height: s.posterH,
                zIndex: 2,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                transform: posterTransform,
                boxShadow: posterBoxShadow,
              }}
            >
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={movie.title}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center text-white/30 text-xs text-center p-2">
                  No Image
                </div>
              )}

              {/* Base gradient overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)",
                  pointerEvents: "none",
                }}
              />

              {/* Hover overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
                  opacity: hovered ? 1 : 0,
                  transition: "opacity 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: "8px",
                }}
              >
                <p
                  className="text-white font-semibold leading-tight"
                  style={{ fontSize: "0.65rem", marginBottom: "3px" }}
                >
                  {movie.title}
                </p>
                <div className="flex items-center gap-1">
                  <Star
                    className="text-yellow-400 fill-yellow-400"
                    style={{ width: "9px", height: "9px" }}
                  />
                  <span
                    className="text-yellow-400"
                    style={{ fontSize: "0.6rem", fontWeight: 700 }}
                  >
                    {rating}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </button>
      </TrailerPreviewCard>

      <TrailerModal
        trailerKey={activeTrailerKey}
        onClose={() => setActiveTrailerKey(null)}
      />
    </>
  );
}

export default function Top10TrendingRow() {
  const { data: movies, isLoading, isError } = useTop10Trending();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile(768);

  const { loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const { data: watchlistIds } = useTMDBWatchlistIds();
  const { addToTMDBWatchlist, removeFromTMDBWatchlist } =
    useTMDBWatchlistMutations();

  const handleWatchlistToggle = (movieId: number, title: string) => {
    if (!isLoggedIn) {
      toast.info("Sign in to save to your watchlist");
      return;
    }
    const inWatchlist = (watchlistIds ?? []).some(
      (id) => id === BigInt(movieId),
    );
    if (inWatchlist) {
      removeFromTMDBWatchlist.mutate(movieId, {
        onSuccess: () => toast.success("Removed from watchlist"),
      });
    } else {
      addToTMDBWatchlist.mutate(movieId, {
        onSuccess: () => toast.success(`Added "${title}" to watchlist`),
      });
    }
  };

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: dir === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  // Gap between cards: enough so each card's number doesn't creep behind neighbor's poster
  // Desktop: 16px, Mobile: 10px
  const cardGap = isMobile ? 10 : 16;

  return (
    <section className="mb-10 group/top10row" data-ocid="top10_row.section">
      <SectionHeader title="Top 10 Trending Today" label="TOP 10" />

      {isError && (
        <p
          className="px-4 sm:px-8 text-sm text-red-500 mb-4"
          data-ocid="top10_row.error_state"
        >
          Unable to load Top 10. Please try again later.
        </p>
      )}

      {!isError && (
        <div className="relative">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-20 w-14 bg-gradient-to-r from-background to-transparent flex items-center justify-center opacity-0 group-hover/top10row:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
              <ChevronLeft className="w-5 h-5 text-white" />
            </div>
          </button>

          <div
            ref={scrollRef}
            className="flex overflow-x-auto scrollbar-hide px-4 sm:px-8 pb-4"
            style={{
              gap: cardGap,
              overflowY: "visible",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {isLoading
              ? SKELETON_KEYS.map((k) => (
                  <SkeletonTop10Card key={k} isMobile={isMobile} />
                ))
              : (movies ?? []).map((movie, i) => (
                  <Top10Card
                    key={movie.id}
                    movie={movie}
                    rank={i + 1}
                    index={i + 1}
                    isInWatchlist={
                      isLoggedIn &&
                      (watchlistIds ?? []).some((id) => id === BigInt(movie.id))
                    }
                    onWatchlistToggle={() =>
                      handleWatchlistToggle(movie.id, movie.title)
                    }
                    isLoggedIn={isLoggedIn}
                    isMobile={isMobile}
                  />
                ))}
          </div>

          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-20 w-14 bg-gradient-to-l from-background to-transparent flex items-center justify-center opacity-0 group-hover/top10row:opacity-100 transition-opacity"
            aria-label="Scroll right"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
              <ChevronRight className="w-5 h-5 text-white" />
            </div>
          </button>
        </div>
      )}
    </section>
  );
}
