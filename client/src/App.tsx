import { useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { AppStoreProvider } from './store/app-store';
import { Header } from './components/header';
import { ArticleFeed } from './pages/article-feed';
import { VideoFeed } from './pages/video-feed';
import { BookmarksPage } from './pages/bookmarks-page';
import { DailyHomepage } from './pages/daily-homepage';
import { EMPTY_FILTERS, type SearchFilters } from './types';

function Site() {
  // Filters are global (shared across feeds), mirroring the old ngrx store.
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const location = useLocation();
  // The immersive daily homepage has no nav chrome of its own.
  const isHomepage = location.pathname === '/';

  if (isHomepage) {
    return <DailyHomepage filters={filters} onFiltersChange={setFilters} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header filters={filters} onFiltersChange={setFilters} />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-6">
        <Routes>
          <Route
            path="/articles"
            element={<ArticleFeed inTibetan={false} filters={filters} />}
          />
          <Route
            path="/tibetan-articles"
            element={<ArticleFeed inTibetan={true} filters={filters} />}
          />
          <Route path="/videos" element={<VideoFeed filters={filters} />} />
          <Route path="/bookmark" element={<BookmarksPage />} />
          <Route path="*" element={<Navigate to="/articles" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppStoreProvider>
      <BrowserRouter>
        <Site />
      </BrowserRouter>
    </AppStoreProvider>
  );
}
