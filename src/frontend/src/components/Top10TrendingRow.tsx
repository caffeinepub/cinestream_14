import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
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

function SkeletonTop10Card() {
  return (
    <div className="flex-shrink-0" style={{ width: "180px" }}>
      <div className="flex items-end" style={{ height: "240px" }}>
        <div
          className="flex-shrink-0"
          style={{ width: "80px", height: "120px" }}
        >
          <Skeleton className="w-full h-full rounded skeleton-shimmer bg-white/10" />
        </div>
        <Skeleton
          className="flex-shrink-0 rounded-md skeleton-shimmer bg-white/10"
          style={{ width: "120px", height: "180px", marginLeft: "-20px" }}
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
}

function Top10Card({
  movie,
  rank,
  index,
  isInWatchlist,
  onWatchlistToggle,
  isLoggedIn,
}: Top10CardProps) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [activeTrailerKey, setActiveTrailerKey] = useState<string | null>(null);

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
          style={{ width: "180px" }}
          data-ocid={`top10_row.item.${index}`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={handleMoreInfo}
          aria-label={`${rank}. ${movie.title}`}
        >
          <div className="relative flex items-end" style={{ height: "240px" }}>
            {/* Large rank number behind poster */}
            <div
              className="absolute left-0 bottom-0 select-none flex items-end"
              style={{ zIndex: 1, width: "80px", height: "220px" }}
            >
              <span
                style={{
                  fontFamily:
                    "'BricolageGrotesque', 'Playfair Display', Georgia, serif",
                  fontSize: rank >= 10 ? "7rem" : "9rem",
                  fontWeight: 900,
                  lineHeight: 1,
                  color: "transparent",
                  WebkitTextStroke: "3px rgba(255,255,255,0.55)",
                  textShadow: "0 0 30px rgba(255,255,255,0.08)",
                  letterSpacing: "-0.05em",
                  userSelect: "none",
                }}
              >
                {rank}
              </span>
            </div>

            {/* Poster overlapping the number */}
            <div
              className="absolute right-0 bottom-0 overflow-hidden rounded-md"
              style={{
                width: "120px",
                height: "180px",
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
            className="flex gap-2 overflow-x-auto scrollbar-hide px-4 sm:px-8 pb-4"
            style={{ overflowY: "visible", WebkitOverflowScrolling: "touch" }}
          >
            {isLoading
              ? SKELETON_KEYS.map((k) => <SkeletonTop10Card key={k} />)
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
