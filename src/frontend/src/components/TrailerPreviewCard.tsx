import { Check, Info, Play, Plus, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

const TMDB_API_KEY = "fadb0b01b6573c9e09695a7b0498aa71";
const OVERLAY_WIDTH = 300;

// Module-level cache to avoid duplicate trailer fetches
const trailerCache = new Map<number, string | "none">();

interface TrailerPreviewCardProps {
  movieId: number;
  title: string;
  rating: number;
  children: React.ReactNode;
  onPlay: (trailerKey: string) => void;
  onMoreInfo: () => void;
  isInWatchlist?: boolean;
  onWatchlistToggle?: () => void;
  isLoggedIn?: boolean;
}

const isMobileDevice = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

export default function TrailerPreviewCard({
  movieId,
  title,
  rating,
  children,
  onPlay,
  onMoreInfo,
  isInWatchlist = false,
  onWatchlistToggle,
  isLoggedIn = false,
}: TrailerPreviewCardProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [noTrailer, setNoTrailer] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [isMobile] = useState(() => isMobileDevice());

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (isMobile) return <>{children}</>;

  const fetchTrailer = async () => {
    const cached = trailerCache.get(movieId);
    if (cached !== undefined) {
      if (cached === "none") {
        setTrailerKey(null);
        setNoTrailer(true);
      } else {
        setTrailerKey(cached);
        setNoTrailer(false);
      }
      return;
    }

    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`,
      );
      const data = await res.json();
      const videos: Array<{
        site: string;
        type: string;
        key: string;
        official?: boolean;
      }> = data.results ?? [];
      const trailer =
        videos.find(
          (v) => v.site === "YouTube" && v.type === "Trailer" && v.official,
        ) ??
        videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ??
        videos.find((v) => v.site === "YouTube" && v.type === "Teaser") ??
        null;
      if (trailer) {
        trailerCache.set(movieId, trailer.key);
        setTrailerKey(trailer.key);
        setNoTrailer(false);
      } else {
        trailerCache.set(movieId, "none");
        setTrailerKey(null);
        setNoTrailer(true);
      }
    } catch {
      trailerCache.set(movieId, "none");
      setTrailerKey(null);
      setNoTrailer(true);
    }
  };

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (wrapperRef.current) {
        setRect(wrapperRef.current.getBoundingClientRect());
        setShowOverlay(true);
        fetchTrailer();
      }
    }, 1000);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setShowOverlay(false);
    setTrailerKey(null);
    setNoTrailer(false);
  };

  const overlayLeft = rect
    ? Math.max(
        8,
        Math.min(
          rect.left + rect.width / 2 - OVERLAY_WIDTH / 2,
          window.innerWidth - OVERLAY_WIDTH - 8,
        ),
      )
    : 0;

  const overlayBottom = rect ? window.innerHeight - rect.top + 6 : 0;

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      toast.info("Sign in to save to your watchlist");
      return;
    }
    onWatchlistToggle?.();
  };

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ flexShrink: 0 }}
    >
      {children}

      {showOverlay &&
        rect &&
        createPortal(
          <div
            onMouseEnter={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
            }}
            onMouseLeave={handleMouseLeave}
            style={{
              position: "fixed",
              bottom: overlayBottom,
              left: overlayLeft,
              width: OVERLAY_WIDTH,
              zIndex: 9999,
              animation: "trailerPreviewIn 0.18s ease-out",
            }}
            className="rounded-xl overflow-hidden shadow-2xl"
          >
            <div
              className="relative bg-black"
              style={{ width: OVERLAY_WIDTH, height: 168 }}
            >
              {trailerKey ? (
                <iframe
                  key={trailerKey}
                  src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${trailerKey}&rel=0&showinfo=0`}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className="w-full h-full border-0"
                  title={`${title} trailer`}
                />
              ) : noTrailer ? (
                <div className="w-full h-full flex items-center justify-center bg-secondary/60">
                  <span className="text-xs text-muted-foreground">
                    No trailer available
                  </span>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary/60">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white/40 border-t-white"
                    style={{ animation: "previewSpin 0.7s linear infinite" }}
                  />
                </div>
              )}
            </div>

            <div className="bg-[#1a1a1a] px-3 py-2.5 border-t border-white/5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-white truncate max-w-[160px]">
                  {title}
                </p>
                <span className="flex items-center gap-0.5 text-xs shrink-0">
                  <Star className="w-3 h-3 fill-[#e50914] text-[#e50914]" />
                  <span className="font-semibold text-white">
                    {rating.toFixed(1)}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-ocid="trailer_preview.primary_button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (trailerKey) onPlay(trailerKey);
                  }}
                  disabled={!trailerKey}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-white text-black rounded-md py-1.5 text-xs font-semibold hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Play className="w-3 h-3 fill-black" /> Play
                </button>

                <button
                  type="button"
                  data-ocid="trailer_preview.secondary_button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoreInfo();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-white/10 text-white rounded-md py-1.5 text-xs font-semibold hover:bg-white/20 transition-colors border border-white/20"
                >
                  <Info className="w-3 h-3" /> More Info
                </button>

                <button
                  type="button"
                  data-ocid="trailer_preview.toggle"
                  onClick={handleWatchlistClick}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-colors shrink-0"
                  title={
                    isInWatchlist ? "Remove from watchlist" : "Add to watchlist"
                  }
                >
                  {isInWatchlist ? (
                    <Check className="w-4 h-4 text-[#e50914]" />
                  ) : (
                    <Plus className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
