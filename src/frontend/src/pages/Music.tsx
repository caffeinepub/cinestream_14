import MusicCard from "../components/MusicCard";
import Navbar from "../components/Navbar";
import SectionHeader from "../components/SectionHeader";

interface Song {
  title: string;
  artist: string;
  gradient: string;
}

const TRENDING_SONGS: Song[] = [
  {
    title: "Kesariya",
    artist: "Arijit Singh",
    gradient: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
  },
  {
    title: "Raataan Lambiyan",
    artist: "Jubin Nautiyal",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
  },
  {
    title: "Tum Hi Ho",
    artist: "Arijit Singh",
    gradient: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
  },
  {
    title: "Tera Ban Jaunga",
    artist: "Akhil Sachdeva",
    gradient: "linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)",
  },
  {
    title: "Bekhayali",
    artist: "Sachet Tandon",
    gradient: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
  },
  {
    title: "Ik Vaari Aa",
    artist: "Arijit Singh",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  },
  {
    title: "Phir Bhi Tumko Chaahunga",
    artist: "Arijit Singh",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  },
  {
    title: "Hawayein",
    artist: "Arijit Singh",
    gradient: "linear-gradient(135deg, #e879f9 0%, #a21caf 100%)",
  },
];

const BOLLYWOOD_HITS: Song[] = [
  {
    title: "Chaiyya Chaiyya",
    artist: "Sukhwinder Singh",
    gradient: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
  },
  {
    title: "Kala Chashma",
    artist: "Badshah",
    gradient: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
  },
  {
    title: "Badtameez Dil",
    artist: "Udit Narayan",
    gradient: "linear-gradient(135deg, #f97316 0%, #b45309 100%)",
  },
  {
    title: "Galliyan",
    artist: "Ankit Tiwari",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
  },
  {
    title: "Jai Ho",
    artist: "A.R. Rahman",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  },
  {
    title: "Senorita",
    artist: "Shaan",
    gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
  },
  {
    title: "Nagada Sang Dhol",
    artist: "Shreya Ghoshal",
    gradient: "linear-gradient(135deg, #84cc16 0%, #4d7c0f 100%)",
  },
  {
    title: "Desi Girl",
    artist: "Shankar-Ehsaan-Loy",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)",
  },
];

const LOFI_BEATS: Song[] = [
  {
    title: "Midnight Lofi",
    artist: "ChillHop Music",
    gradient: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
  },
  {
    title: "Rainy Café",
    artist: "LoFi Girl",
    gradient: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
  },
  {
    title: "Study Vibes",
    artist: "Beats by Ambulo",
    gradient: "linear-gradient(135deg, #2d1b69 0%, #11998e 100%)",
  },
  {
    title: "Chill Wave",
    artist: "Lofi Dreamer",
    gradient: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
  },
  {
    title: "Late Night Drive",
    artist: "Nujabes",
    gradient: "linear-gradient(135deg, #16213e 0%, #0f3460 100%)",
  },
  {
    title: "Lo-Fi Daydream",
    artist: "ChilledCow",
    gradient: "linear-gradient(135deg, #192734 0%, #2e4482 100%)",
  },
  {
    title: "Coffee Shop Jazz",
    artist: "Café Music BGM",
    gradient: "linear-gradient(135deg, #3a1c71 0%, #d76d77 100%)",
  },
  {
    title: "Bedroom Pop",
    artist: "Rex Orange County",
    gradient: "linear-gradient(135deg, #614385 0%, #516395 100%)",
  },
];

const PUNJABI_SONGS: Song[] = [
  {
    title: "Lover",
    artist: "Diljit Dosanjh",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
  },
  {
    title: "Lahore",
    artist: "Guru Randhawa",
    gradient: "linear-gradient(135deg, #10b981 0%, #f59e0b 100%)",
  },
  {
    title: "Mundian To Bach Ke",
    artist: "Panjabi MC",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
  },
  {
    title: "Proper Patola",
    artist: "Badshah",
    gradient: "linear-gradient(135deg, #f97316 0%, #fbbf24 100%)",
  },
  {
    title: "Laal Ghagra",
    artist: "Guru Randhawa",
    gradient: "linear-gradient(135deg, #dc2626 0%, #ea580c 100%)",
  },
  {
    title: "Yeah Baby",
    artist: "Garry Sandhu",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
  },
  {
    title: "Patiala Peg",
    artist: "Diljit Dosanjh",
    gradient: "linear-gradient(135deg, #d97706 0%, #65a30d 100%)",
  },
  {
    title: "Brown Munde",
    artist: "AP Dhillon",
    gradient: "linear-gradient(135deg, #0f172a 0%, #7c3aed 100%)",
  },
];

function MusicRow({
  songs,
  sectionOcid,
}: {
  songs: Song[];
  sectionOcid: string;
}) {
  return (
    <div
      data-ocid={sectionOcid}
      className="relative overflow-x-auto overflow-y-visible pb-4"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div className="flex gap-4 px-4 sm:px-8" style={{ width: "max-content" }}>
        {songs.map((song, i) => (
          <MusicCard
            key={song.title}
            title={song.title}
            artist={song.artist}
            gradient={song.gradient}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}

export default function MusicPage() {
  return (
    <div
      data-ocid="music.page"
      className="min-h-screen"
      style={{ background: "#0a0a0a" }}
    >
      <Navbar />

      <main className="pt-24 pb-20">
        {/* Hero header */}
        <div className="px-4 sm:px-8 mb-12">
          <div className="flex items-end gap-4 mb-3">
            <h1
              className="font-display font-black text-5xl sm:text-6xl lg:text-7xl tracking-tight"
              style={{
                background:
                  "linear-gradient(135deg, #ffffff 0%, #1DB954 60%, #17a349 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Music
            </h1>
            <div
              className="mb-2 hidden sm:block w-8 h-8 rounded-full flex-shrink-0"
              style={{ background: "#1DB954", boxShadow: "0 0 20px #1DB95466" }}
            />
          </div>
          <p className="text-zinc-400 text-base sm:text-lg max-w-xl">
            Your favorite tracks, all in one place
          </p>

          {/* Decorative green accent line */}
          <div
            className="mt-5 h-0.5 w-24 rounded-full"
            style={{
              background: "linear-gradient(90deg, #1DB954, transparent)",
            }}
          />
        </div>

        {/* Trending Songs */}
        <section className="mb-10">
          <SectionHeader title="Trending Songs" label="🔥 HOT" />
          <MusicRow
            songs={TRENDING_SONGS}
            sectionOcid="music.trending_songs.section"
          />
        </section>

        {/* Bollywood Hits */}
        <section className="mb-10">
          <SectionHeader title="Bollywood Hits" label="🎬 FILMS" />
          <MusicRow
            songs={BOLLYWOOD_HITS}
            sectionOcid="music.bollywood_hits.section"
          />
        </section>

        {/* LoFi Beats */}
        <section className="mb-10">
          <SectionHeader title="LoFi Beats" label="🎧 CHILL" />
          <MusicRow songs={LOFI_BEATS} sectionOcid="music.lofi_beats.section" />
        </section>

        {/* Punjabi Songs */}
        <section className="mb-10">
          <SectionHeader title="Punjabi Songs" label="🎤 BHANGRA" />
          <MusicRow
            songs={PUNJABI_SONGS}
            sectionOcid="music.punjabi_songs.section"
          />
        </section>
      </main>

      <footer className="text-center py-8 text-zinc-600 text-xs border-t border-white/5">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
