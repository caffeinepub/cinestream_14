import { Pause, Play } from "lucide-react";
import { useState } from "react";

interface MusicCardProps {
  title: string;
  artist: string;
  gradient: string;
  index?: number;
}

export default function MusicCard({
  title,
  artist,
  gradient,
  index = 0,
}: MusicCardProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      data-ocid={`music.item.${index + 1}`}
      className="flex-shrink-0 w-44 sm:w-48 group cursor-pointer"
      style={{ willChange: "transform" }}
    >
      {/* Album art thumbnail */}
      <div
        className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 shadow-lg transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl"
        style={{ background: gradient }}
      >
        {/* Noise texture overlay for depth */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Glowing ring on hover */}
        <div className="absolute inset-0 rounded-xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all duration-300" />

        {/* Play button — shows on hover, positioned bottom-right */}
        <button
          type="button"
          data-ocid="music.play_button"
          onClick={() => setPlaying((p) => !p)}
          className="absolute bottom-2 right-2 w-11 h-11 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 hover:scale-105 active:scale-95"
          style={{ backgroundColor: "#1DB954" }}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? (
            <Pause className="w-5 h-5 text-black fill-black" />
          ) : (
            <Play className="w-5 h-5 text-black fill-black ml-0.5" />
          )}
        </button>

        {/* Playing indicator — pulsing dot when active */}
        {playing && (
          <div className="absolute top-2 right-2">
            <span
              className="w-2 h-2 rounded-full block animate-pulse"
              style={{ backgroundColor: "#1DB954" }}
            />
          </div>
        )}
      </div>

      {/* Song info */}
      <div className="px-0.5">
        <p
          className="text-sm font-semibold text-white truncate leading-tight"
          title={title}
        >
          {title}
        </p>
        <p className="text-xs text-zinc-400 mt-0.5 truncate" title={artist}>
          {artist}
        </p>
      </div>
    </div>
  );
}
