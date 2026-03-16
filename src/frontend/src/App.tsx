import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import LoadingScreen from "./components/LoadingScreen";
import AdminPage from "./pages/Admin";
import HomePage from "./pages/Home";
import MoviePlayerPage from "./pages/MoviePlayer";
import SearchPage from "./pages/Search";
import TMDBMovieDetailPage from "./pages/TMDBMovieDetail";
import WatchlistPage from "./pages/Watchlist";

function AnimatedOutlet() {
  const location = useLocation();
  const [displayKey, setDisplayKey] = useState(location.pathname);
  const [transitioning, setTransitioning] = useState(false);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevPath.current) {
      setTransitioning(true);
      const t = setTimeout(() => {
        setDisplayKey(location.pathname);
        setTransitioning(false);
        prevPath.current = location.pathname;
      }, 80);
      return () => clearTimeout(t);
    }
  }, [location.pathname]);

  return (
    <div
      key={displayKey}
      className="page-transition"
      style={{ opacity: transitioning ? 0 : undefined }}
    >
      <Outlet />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background">
      <LoadingScreen />
      <AnimatedOutlet />
      <Toaster />
    </div>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
const moviePlayerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/movie/$id",
  component: MoviePlayerPage,
});
const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search",
  component: SearchPage,
});
const watchlistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/watchlist",
  component: WatchlistPage,
});
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});
const tmdbMovieRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tmdb/$id",
  component: TMDBMovieDetailPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  moviePlayerRoute,
  searchRoute,
  watchlistRoute,
  adminRoute,
  tmdbMovieRoute,
]);
const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
