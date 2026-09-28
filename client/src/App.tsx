import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppStoreProvider } from './store/app-store';
import { Header } from './components/header';
import { ArticleFeed } from './pages/article-feed';
import { VideoFeed } from './pages/video-feed';
import { BookmarksPage } from './pages/bookmarks-page';
import { EMPTY_FILTERS, type SearchFilters } from './types';

export default function App() {
  // Filters are global (shared across feeds), mirroring the old ngrx store.
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);

  return (
    <AppStoreProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground">
          <Header filters={filters} onFiltersChange={setFilters} />
          <main className="mx-auto max-w-5xl px-4 pb-16 pt-6">
            <Routes>
              <Route path="/" element={<Navigate to="/articles" replace />} />
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
      </BrowserRouter>
    </AppStoreProvider>
  );
}
