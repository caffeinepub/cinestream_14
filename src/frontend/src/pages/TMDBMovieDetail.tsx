import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookmarkPlus,
  Check,
  Loader2,
  Play,
  Star,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import TMDBMovieCard from "../components/TMDBMovieCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useTMDBWatchlistIds,
  useTMDBWatchlistMutations,
} from "../hooks/useQueries";
import { useTMDBMovieDetail, useTMDBSimilar } from "../hooks/useTMDB";
import { getReleaseYear, tmdbImage } from "../services/tmdb";

export default function TMDBMovieDetailPage() {
  const { id } = useParams({ from: "/tmdb/$id" });
  const movieId = Number(id);
  const navigate = useNavigate();

  const { loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;

  const { data: movie, isLoading } = useTMDBMovieDetail(movieId);
  const { data: similarMovies, isLoading: isSimilarLoading } =
    useTMDBSimilar(movieId);

  const { data: watchlistIds } = useTMDBWatchlistIds();
  const { addToTMDBWatchlist, removeFromTMDBWatchlist } =
    useTMDBWatchlistMutations();

  const inWatchlist =
    isLoggedIn && (watchlistIds ?? []).some((wid) => wid === BigInt(movieId));

  const [trailerOpen, setTrailerOpen] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [trailerLoading, setTrailerLoading] = useState(false);

  const handleWatchlistToggle = () => {
    if (!isLoggedIn) {
      toast.info("Sign in to save to your watchlist");
      return;
    }
    if (inWatchlist) {
      removeFromTMDBWatchlist.mutate(movieId, {
        onSuccess: () => toast.success("Removed from watchlist"),
      });
    } else {
      addToTMDBWatchlist.mutate(movieId, {
        onSuccess: () => toast.success("Added to watchlist"),
      });
    }
  };

  const handlePlayTrailer = async () => {
    setTrailerLoading(true);
    try {
      const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=fadb0b01b6573c9e09695a7b0498aa71`;
      const res = await fetch(url);
      const data = await res.json();
      console.log("TMDB video response:", data);

      const videos: Array<{
        site: string;
        type: string;
        key: string;
        official?: boolean;
      }> = data.results ?? [];
      const youtubeTrailer =
        videos.find(
          (v) => v.site === "YouTube" && v.type === "Trailer" && v.official,
        ) ??
        videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ??
        videos.find(
          (v) => v.site === "YouTube" && v.type === "Teaser" && v.official,
        ) ??
        videos.find((v) => v.site === "YouTube" && v.type === "Teaser") ??
        null;

      console.log("Selected trailer:", youtubeTrailer?.key ?? "none");

      if (!youtubeTrailer) {
        toast.error("Trailer not available");
        return;
      }

      setTrailerKey(youtubeTrailer.key);
      setTrailerOpen(true);
    } catch (err) {
      console.error("Failed to fetch trailer:", err);
      toast.error("Failed to load trailer");
    } finally {
      setTrailerLoading(false);
    }
  };

  const backdropUrl = tmdbImage(movie?.backdrop_path ?? null, "w1280");
  const posterUrl = tmdbImage(movie?.poster_path ?? null, "w500");

  return (
    <div className="min-h-screen bg-background">
      {/* Cinematic Backdrop */}
      <div
        className="relative w-full"
        style={{ height: "55vh", minHeight: 320 }}
      >
        {isLoading ? (
          <Skeleton
            className="absolute inset-0 skeleton-shimmer bg-transparent"
            data-ocid="tmdb_detail.loading_state"
          />
        ) : backdropUrl ? (
          <img
            src={backdropUrl}
            alt={movie?.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-secondary" />
        )}
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

        {/* Back button */}
        <button
          type="button"
          data-ocid="tmdb_detail.button"
          onClick={() => navigate({ to: "/" })}
          className="absolute top-4 left-4 sm:top-6 sm:left-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors group z-10"
        >
          <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-black/60 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium hidden sm:block">Back</span>
        </button>

        {/* Title over backdrop */}
        <div className="absolute bottom-8 left-4 sm:left-8 right-4 sm:right-8 z-10">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-64 mb-2 skeleton-shimmer bg-transparent" />
              <Skeleton className="h-4 w-48 skeleton-shimmer bg-transparent" />
            </>
          ) : (
            <>
              <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white leading-tight mb-1">
                {movie?.title}
              </h1>
              {movie?.tagline && (
                <p className="text-white/60 italic text-sm sm:text-base">
                  {movie.tagline}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content below backdrop */}
      <div className="px-4 sm:px-8 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="flex-shrink-0 w-full md:w-52">
              {isLoading ? (
                <Skeleton className="aspect-[2/3] rounded-lg skeleton-shimmer bg-transparent" />
              ) : posterUrl ? (
                <img
                  src={posterUrl}
                  alt={movie?.title}
                  className="w-full md:w-52 aspect-[2/3] object-cover rounded-lg shadow-2xl"
                />
              ) : (
                <div className="w-full md:w-52 aspect-[2/3] rounded-lg bg-secondary flex items-center justify-center">
                  <span className="text-sm text-muted-foreground text-center px-4">
                    {movie?.title}
                  </span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4 skeleton-shimmer bg-transparent" />
                  <Skeleton className="h-4 w-1/3 skeleton-shimmer bg-transparent" />
                  <Skeleton className="h-4 w-1/2 skeleton-shimmer bg-transparent" />
                  <Skeleton className="h-20 w-full skeleton-shimmer bg-transparent" />
                </div>
              ) : (
                <>
                  <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-3">
                    {movie?.title}
                  </h2>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    {movie?.release_date && (
                      <span className="text-sm font-semibold text-foreground bg-secondary px-2 py-0.5 rounded">
                        {getReleaseYear(movie.release_date)}
                      </span>
                    )}
                    {movie?.runtime && (
                      <span className="text-sm text-muted-foreground">
                        {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-sm font-semibold">
                      <Star className="w-4 h-4 fill-[#e50914] text-[#e50914]" />
                      <span className="text-foreground">
                        {movie?.vote_average.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        / 10
                      </span>
                    </span>
                  </div>

                  {/* Genres */}
                  {movie?.genres && movie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {movie.genres.map((g) => (
                        <Badge
                          key={g.id}
                          className="bg-[#e50914]/20 text-[#e50914] border border-[#e50914]/30 hover:bg-[#e50914]/30"
                        >
                          {g.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Overview */}
                  <p className="text-muted-foreground leading-relaxed text-sm sm:text-base mb-6">
                    {movie?.overview}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      data-ocid="tmdb_detail.primary_button"
                      onClick={handlePlayTrailer}
                      disabled={trailerLoading}
                      className="bg-white text-black hover:bg-white/90 font-bold gap-2"
                    >
                      {trailerLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-black" />
                          Play Trailer
                        </>
                      )}
                    </Button>
                    <Button
                      data-ocid="tmdb_detail.secondary_button"
                      variant="outline"
                      onClick={handleWatchlistToggle}
                      disabled={
                        addToTMDBWatchlist.isPending ||
                        removeFromTMDBWatchlist.isPending
                      }
                      className={`gap-2 border-border hover:border-white ${
                        inWatchlist ? "text-[#e50914] border-[#e50914]/50" : ""
                      }`}
                    >
                      {inWatchlist ? (
                        <>
                          <Check className="w-4 h-4" /> In Watchlist
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="w-4 h-4" /> Add to Watchlist
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Similar Movies */}
      {(isSimilarLoading || (similarMovies && similarMovies.length > 0)) && (
        <div className="px-4 sm:px-8 pb-12">
          <h2 className="font-display font-bold text-xl sm:text-2xl mb-4 px-0">
            Similar Movies
          </h2>
          {isSimilarLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {Array.from({ length: 6 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton row
                <div key={i} className="flex-shrink-0 w-36 sm:w-44">
                  <div className="aspect-[2/3] rounded-md skeleton-shimmer" />
                  <div className="mt-2 h-3 w-3/4 skeleton-shimmer rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div
              className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
              data-ocid="tmdb_detail.list"
            >
              {(similarMovies ?? []).slice(0, 12).map((m, i) => (
                <div
                  key={m.id}
                  className="flex-shrink-0 w-36 sm:w-44"
                  data-ocid={`tmdb_detail.item.${i + 1}`}
                >
                  <TMDBMovieCard movie={m} index={i + 1} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Trailer Modal */}
      <Dialog
        open={trailerOpen}
        onOpenChange={(open) => {
          setTrailerOpen(open);
          if (!open) setTrailerKey(null);
        }}
      >
        <DialogContent
          aria-label="Movie Trailer"
          showCloseButton={false}
          className="max-w-3xl w-full p-0 overflow-hidden bg-black border-border"
          data-ocid="tmdb_detail.dialog"
        >
          <div className="relative w-full">
            <button
              type="button"
              data-ocid="tmdb_detail.close_button"
              onClick={() => {
                setTrailerOpen(false);
                setTrailerKey(null);
              }}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {trailerKey ? (
              <div
                className="w-full"
                style={{ paddingBottom: "56.25%", position: "relative" }}
              >
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
                  title="Movie Trailer"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    border: 0,
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-white text-lg">
                Trailer not available
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
