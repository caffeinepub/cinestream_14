import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bookmark,
  LogOut,
  Menu,
  Search,
  Settings,
  Star,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAdminCheck } from "../hooks/useQueries";
import { useTMDBSearch } from "../hooks/useTMDB";
import { getReleaseYear, tmdbImage } from "../services/tmdb";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const navigate = useNavigate();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: isAdmin } = useAdminCheck();
  const { data: searchResults, isFetching: isSearching } =
    useTMDBSearch(searchValue);

  const showDropdown = searchOpen && searchValue.length >= 2;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchValue("");
      }
    };
    if (searchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate({ to: "/search", search: { q: searchValue.trim() } });
      setSearchOpen(false);
      setSearchValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearchOpen(false);
      setSearchValue("");
    }
  };

  const handleResultClick = (movieId: number) => {
    navigate({ to: "/tmdb/$id", params: { id: String(movieId) } });
    setSearchOpen(false);
    setSearchValue("");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "nav-solid" : "nav-blur"}`}
    >
      <div className="max-w-[1800px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" data-ocid="nav.logo_link" className="flex-shrink-0">
          <span className="font-display font-black text-2xl tracking-tight">
            <span className="text-[#e50914]">CINE</span>
            <span className="text-foreground">STREAM</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link
            to="/search"
            search={{ q: "" }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Browse
          </Link>
          {isLoggedIn && (
            <Link
              to="/watchlist"
              data-ocid="nav.watchlist_link"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Bookmark className="w-4 h-4" /> My List
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              data-ocid="nav.admin_link"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Settings className="w-4 h-4" /> Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {/* Search with live dropdown */}
          <div ref={searchRef} className="relative">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input
                  autoFocus
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search movies..."
                  className="w-48 sm:w-64 h-8 bg-black/60 border-border text-sm"
                  data-ocid="nav.search_input"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchValue("");
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </form>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchOpen(true)}
                data-ocid="nav.search_input"
              >
                <Search className="w-5 h-5" />
              </Button>
            )}

            {/* Live search dropdown */}
            {showDropdown && (
              <div
                data-ocid="nav.popover"
                className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-black/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100]"
              >
                {isSearching ? (
                  <div className="p-3 space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                      <div key={i} className="flex gap-3 items-center">
                        <div className="w-10 h-14 rounded skeleton-shimmer flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-3/4 skeleton-shimmer rounded" />
                          <div className="h-3 w-1/2 skeleton-shimmer rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !searchResults || searchResults.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    No results found for &ldquo;{searchValue}&rdquo;
                  </div>
                ) : (
                  <div className="max-h-[420px] overflow-y-auto">
                    {searchResults.slice(0, 6).map((movie, i) => (
                      <button
                        key={movie.id}
                        type="button"
                        data-ocid={`nav.item.${i + 1}`}
                        onClick={() => handleResultClick(movie.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 transition-colors text-left group"
                      >
                        <div className="flex-shrink-0 w-10 h-14 rounded overflow-hidden bg-secondary">
                          {movie.poster_path ? (
                            <img
                              src={tmdbImage(movie.poster_path, "w92")}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-secondary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate group-hover:text-[#e50914] transition-colors">
                            {movie.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {movie.release_date && (
                              <span className="text-xs text-muted-foreground">
                                {getReleaseYear(movie.release_date)}
                              </span>
                            )}
                            {movie.vote_average > 0 && (
                              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                                <Star className="w-3 h-3 fill-[#e50914] text-[#e50914]" />
                                {movie.vote_average.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                    {searchResults.length > 6 && (
                      <button
                        type="button"
                        onClick={
                          handleSearch as unknown as React.MouseEventHandler
                        }
                        className="w-full py-3 text-center text-sm text-[#e50914] hover:bg-white/5 transition-colors border-t border-white/10"
                      >
                        View all {searchResults.length} results
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-[#e50914] hover:bg-[#c4070f] text-white"
                >
                  <User className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-popover border-border"
              >
                <DropdownMenuItem asChild>
                  <Link to="/watchlist" className="cursor-pointer">
                    <Bookmark className="w-4 h-4 mr-2" /> My Watchlist
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" /> Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => clear()}
                  className="text-[#e50914] focus:text-[#e50914] cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => login()}
              data-ocid="nav.login_button"
              className="bg-[#e50914] hover:bg-[#c4070f] text-white text-sm h-9 px-4 font-semibold"
              disabled={loginStatus === "logging-in"}
            >
              {loginStatus === "logging-in" ? "Signing in..." : "Sign In"}
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-black/95 border-t border-border px-4 py-4 flex flex-col gap-3">
          <Link
            to="/"
            className="text-sm py-2"
            onClick={() => setMobileOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/search"
            search={{ q: "" }}
            className="text-sm py-2"
            onClick={() => setMobileOpen(false)}
          >
            Browse
          </Link>
          {isLoggedIn && (
            <Link
              to="/watchlist"
              className="text-sm py-2"
              onClick={() => setMobileOpen(false)}
            >
              My List
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              data-ocid="nav.admin_link"
              className="text-sm py-2 flex items-center gap-2"
              onClick={() => setMobileOpen(false)}
            >
              <Settings className="w-4 h-4" /> Admin
            </Link>
          )}
          <form
            onSubmit={(e) => {
              handleSearch(e);
              setMobileOpen(false);
            }}
            className="flex gap-2 mt-2"
          >
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search movies..."
              className="flex-1 bg-secondary border-border text-sm"
            />
            <Button
              type="submit"
              size="icon"
              className="bg-[#e50914] hover:bg-[#c4070f]"
            >
              <Search className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </header>
  );
}
