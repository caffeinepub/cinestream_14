import { Check, Info, Play, Plus, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

const TMDB_API_KEY = "fadb0b01b6573c9e09695a7b0498aa71";
const OVERLAY_WIDTH = 300;

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
        setTrailerKey(trailer.key);
        setNoTrailer(false);
      } else {
        setTrailerKey(null);
        setNoTrailer(true);
      }
    } catch {
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
              borderRadius: "12px",
              overflow: "hidden",
              background: "#141414",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.08), 0 0 40px rgba(229,9,20,0.1)",
              animation: "trailerPreviewIn 0.2s ease forwards",
            }}
          >
            {/* YouTube Preview */}
            <div
              style={{
                position: "relative",
                paddingBottom: "56.25%",
                background: "#0a0a0a",
              }}
            >
              {trailerKey ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&loop=1&playlist=${trailerKey}`}
                  title={`${title} Trailer Preview`}
                  allow="autoplay; encrypted-media"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    border: 0,
                    display: "block",
                  }}
                />
              ) : noTrailer ? (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "0.75rem",
                    fontFamily: "inherit",
                  }}
                >
                  Trailer not available
                </div>
              ) : (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.2)",
                      borderTopColor: "#e50914",
                      animation: "previewSpin 0.8s linear infinite",
                    }}
                  />
                </div>
              )}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "40%",
                  background:
                    "linear-gradient(to top, #141414 0%, transparent 100%)",
                  pointerEvents: "none",
                }}
              />
            </div>

            {/* Info section */}
            <div style={{ padding: "12px 14px 14px" }}>
              {/* Title + watchlist icon row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <p
                  style={{
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    lineHeight: 1.3,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontFamily: "inherit",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {title}
                </p>
                {/* Watchlist toggle button */}
                <button
                  type="button"
                  data-ocid="preview.toggle"
                  onClick={handleWatchlistClick}
                  title={
                    isInWatchlist ? "Remove from watchlist" : "Add to watchlist"
                  }
                  style={{
                    flexShrink: 0,
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: isInWatchlist
                      ? "2px solid #e50914"
                      : "2px solid rgba(255,255,255,0.35)",
                    background: isInWatchlist
                      ? "rgba(229,9,20,0.18)"
                      : "transparent",
                    color: isInWatchlist ? "#e50914" : "rgba(255,255,255,0.7)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease",
                    padding: 0,
                  }}
                >
                  {isInWatchlist ? (
                    <Check style={{ width: 13, height: 13 }} />
                  ) : (
                    <Plus style={{ width: 13, height: 13 }} />
                  )}
                </button>
              </div>

              {/* Rating */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginBottom: 12,
                }}
              >
                <Star
                  style={{
                    width: 12,
                    height: 12,
                    fill: "#e50914",
                    color: "#e50914",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    color: "#e5e5e5",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    fontFamily: "inherit",
                  }}
                >
                  {rating.toFixed(1)}
                </span>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  data-ocid="preview.primary_button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (trailerKey) {
                      onPlay(trailerKey);
                    } else {
                      onMoreInfo();
                    }
                    handleMouseLeave();
                  }}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    padding: "7px 12px",
                    background: "#e50914",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "#c1000f";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "#e50914";
                  }}
                >
                  <Play
                    style={{
                      width: 12,
                      height: 12,
                      fill: "#fff",
                      flexShrink: 0,
                    }}
                  />
                  Play
                </button>

                <button
                  type="button"
                  data-ocid="preview.secondary_button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoreInfo();
                    handleMouseLeave();
                  }}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    padding: "7px 12px",
                    background: "transparent",
                    color: "#e5e5e5",
                    border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition:
                      "border-color 0.15s ease, background 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "rgba(255,255,255,0.6)";
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(255,255,255,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "rgba(255,255,255,0.25)";
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                  }}
                >
                  <Info style={{ width: 12, height: 12, flexShrink: 0 }} />
                  More Info
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
