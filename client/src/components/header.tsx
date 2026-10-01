import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bookmark, Info, SlidersHorizontal } from 'lucide-react';
import { AboutSheet } from './about-sheet';
import { FilterDialog } from './filter-dialog';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { useAppStore } from '../store/app-store';
import { filtersAreEmpty, type SearchFilters } from '../types';
import { cn } from '../lib/utils';

type FeedType = 'tibetan' | 'english' | 'videos';

function routeToFeed(pathname: string): FeedType | null {
  if (pathname === '/tibetan-articles') return 'tibetan';
  if (pathname === '/articles') return 'english';
  if (pathname === '/videos') return 'videos';
  return null;
}

interface HeaderProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export function Header({ filters, onFiltersChange }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookmarkCount } = useAppStore();
  const [filterOpen, setFilterOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const feed = routeToFeed(location.pathname);
  const showTabs = feed !== null;

  const handleTabChange = (value: string) => {
    if (value === 'tibetan') navigate('/tibetan-articles');
    else if (value === 'english') navigate('/articles');
    else if (value === 'videos') navigate('/videos');
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-4">
        <button
          className="flex items-center gap-2"
          onClick={() => navigate('/articles')}
          aria-label="Bhoe Ja home"
        >
          <img src="/favicon.ico" alt="bhoe-ja" className="h-8 w-8" />
          <span className="text-lg font-bold tracking-tight text-primary">Bhoe Ja</span>
        </button>
        <span className="ml-2 hidden text-sm text-muted-foreground md:inline">
          All the latest Tibetan news in one place
        </span>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Bookmarks"
            onClick={() => navigate('/bookmark')}
            className="relative"
          >
            <Bookmark className="h-5 w-5" />
            {bookmarkCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                {bookmarkCount}
              </span>
            )}
          </Button>
          {showTabs && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Filter"
              onClick={() => setFilterOpen(true)}
              className={cn(!filtersAreEmpty(filters) && 'text-primary')}
            >
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label="About"
            onClick={() => setAboutOpen(true)}
          >
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {showTabs && feed && (
        <div className="flex justify-center border-t px-4 py-2">
          <Tabs value={feed} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="tibetan">Tibetan</TabsTrigger>
              <TabsTrigger value="english">English</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      <FilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={filters}
        onApply={onFiltersChange}
        feedType={feed === 'videos' ? 'videos' : 'articles'}
      />
      <AboutSheet open={aboutOpen} onOpenChange={setAboutOpen} />
    </header>
  );
}
