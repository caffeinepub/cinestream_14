import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bookmark, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Movie } from "../backend";
import AuthModal from "../components/AuthModal";
import Footer from "../components/Footer";
import MovieCard from "../components/MovieCard";
import Navbar from "../components/Navbar";
import TMDBMovieCard from "../components/TMDBMovieCard";
import { SAMPLE_MOVIES } from "../data/sampleMovies";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllMovies,
  useTMDBWatchlistIds,
  useTMDBWatchlistMutations,
  useWatchlistIds,
  useWatchlistMutations,
} from "../hooks/useQueries";
import { useTMDBMovieDetail } from "../hooks/useTMDB";
import { tmdbImage } from "../services/tmdb";
import type { TMDBMovie } from "../types/tmdb";

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6", "sk-7"];

function TMDBWatchlistItem({
  tmdbId,
  onRemove,
}: {
  tmdbId: number;
  onRemove: (id: number) => void;
}) {
  const navigate = useNavigate();
  const { data: movie, isLoading } = useTMDBMovieDetail(tmdbId);

  if (isLoading) {
    return (
      <div>
        <div className="aspect-[2/3] rounded-md skeleton-shimmer" />
        <div className="mt-2 h-3 w-3/4 skeleton-shimmer rounded" />
      </div>
    );
  }

  if (!movie) return null;

  const posterUrl = tmdbImage(movie.poster_path, "w342");

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={() =>
          navigate({ to: "/tmdb/$id", params: { id: String(tmdbId) } })
        }
        className="w-full text-left"
      >
        <div className="aspect-[2/3] rounded-md overflow-hidden bg-secondary">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-2">
              <span className="text-xs text-muted-foreground text-center">
                {movie.title}
              </span>
            </div>
          )}
        </div>
        <p className="mt-1.5 text-xs font-medium truncate">{movie.title}</p>
        {movie.vote_average > 0 && (
          <p className="text-xs text-muted-foreground">
            ★ {movie.vote_average.toFixed(1)}
          </p>
        )}
      </button>
      <button
        type="button"
        data-ocid="watchlist.delete_button"
        onClick={() => onRemove(tmdbId)}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#e50914] z-10"
        title="Remove from watchlist"
      >
        <X className="w-3 h-3 text-white" />
      </button>
    </div>
  );
}

export default function WatchlistPage() {
  const { loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const [authModalOpen, setAuthModalOpen] = useState(!isLoggedIn);

  const allMoviesQuery = useAllMovies();
  const watchlistIdsQuery = useWatchlistIds();
  const { addToWatchlist, removeFromWatchlist } = useWatchlistMutations();

  const tmdbWatchlistIdsQuery = useTMDBWatchlistIds();
  const { removeFromTMDBWatchlist } = useTMDBWatchlistMutations();

  const watchlistIds = watchlistIdsQuery.data ?? [];
  const tmdbWatchlistIds = (tmdbWatchlistIdsQuery.data ?? []).map((id) =>
    Number(id),
  );

  const allMovies: Movie[] =
    allMoviesQuery.data && allMoviesQuery.data.length > 0
      ? allMoviesQuery.data
      : SAMPLE_MOVIES;
  const watchlistMovies = allMovies.filter((m) =>
    watchlistIds.some((id) => id === m.id),
  );

  const handleWatchlistToggle = (movie: Movie) => {
    const isIn = watchlistIds.some((id) => id === movie.id);
    if (isIn) {
      removeFromWatchlist.mutate(movie.id, {
        onSuccess: () =>
          toast.success(`Removed "${movie.title}" from your list`),
      });
    } else {
      addToWatchlist.mutate(movie.id, {
        onSuccess: () => toast.success(`Added "${movie.title}" to your list`),
      });
    }
  };

  const handleRemoveTMDB = (tmdbId: number) => {
    removeFromTMDBWatchlist.mutate(tmdbId, {
      onSuccess: () => toast.success("Removed from watchlist"),
    });
  };

  const isLoading =
    watchlistIdsQuery.isLoading || tmdbWatchlistIdsQuery.isLoading;
  const isEmpty = watchlistMovies.length === 0 && tmdbWatchlistIds.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4 sm:px-8 max-w-[1800px] mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Bookmark className="w-6 h-6 text-[#e50914]" />
          <h1 className="font-display font-black text-3xl sm:text-4xl">
            My List
          </h1>
        </div>
        {!isLoggedIn ? (
          <div className="flex flex-col items-center py-24 gap-6">
            <div className="w-20 h-20 rounded-full bg-[#e50914]/10 flex items-center justify-center">
              <Bookmark className="w-10 h-10 text-[#e50914]" />
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-foreground">
                Sign in to see your list
              </p>
              <p className="text-muted-foreground mt-2">
                Save movies and series to watch later
              </p>
            </div>
            <Button
              onClick={() => setAuthModalOpen(true)}
              className="bg-[#e50914] hover:bg-[#c4070f] text-white font-semibold px-8"
            >
              Sign In
            </Button>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
            {SKELETON_KEYS.map((k) => (
              <div key={k}>
                <div className="aspect-[2/3] rounded-md skeleton-shimmer" />
                <div className="mt-2 h-3 w-3/4 skeleton-shimmer rounded" />
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          <div
            data-ocid="watchlist.empty_state"
            className="flex flex-col items-center py-24 gap-4 text-muted-foreground"
          >
            <Bookmark className="w-16 h-16 opacity-20" />
            <p className="text-xl font-semibold">Your list is empty</p>
            <p className="text-sm">Browse and add movies to your list</p>
            <Link to="/">
              <Button variant="outline" className="mt-2 border-border">
                Browse Movies
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {/* TMDB Watchlist */}
            {tmdbWatchlistIds.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-xl mb-4 text-foreground">
                  TMDB Movies
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-x-3 gap-y-6">
                  {tmdbWatchlistIds.map((tmdbId, i) => (
                    <div key={tmdbId} data-ocid={`watchlist.item.${i + 1}`}>
                      <TMDBWatchlistItem
                        tmdbId={tmdbId}
                        onRemove={handleRemoveTMDB}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Admin/local watchlist */}
            {watchlistMovies.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-xl mb-4 text-foreground">
                  My Movies
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-x-3 gap-y-6">
                  {watchlistMovies.map((movie, i) => (
                    <MovieCard
                      key={movie.id.toString()}
                      movie={movie}
                      index={i + 1}
                      isInWatchlist={true}
                      onWatchlistToggle={handleWatchlistToggle}
                      isLoggedIn={isLoggedIn}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
      <Footer />
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        reason="Sign in to save movies to your watchlist."
      />
    </div>
  );
}
