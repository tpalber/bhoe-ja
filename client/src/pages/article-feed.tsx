import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchArticles } from '../lib/api';
import { filtersAreEmpty, type Article, type SearchFilters } from '../types';
import { ArticleCard } from '../components/article-card';
import { DailyOverviewCard } from '../components/daily-overview-card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { useInfiniteScroll } from '../hooks/use-infinite-scroll';

const PAGE_SIZE = 10;

interface ArticleFeedProps {
  inTibetan: boolean;
  filters: SearchFilters;
}

export function ArticleFeed({ inTibetan, filters }: ArticleFeedProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const articlesRef = useRef<Article[]>([]);
  articlesRef.current = articles;

  const load = useCallback(
    async (offset: number, append: boolean, rid: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchArticles(offset, inTibetan, filters);
        if (requestId.current !== rid) return;
        setArticles((prev) => (append ? [...prev, ...result] : result));
        setHasMore(result.length === PAGE_SIZE);
      } catch (e) {
        if (requestId.current !== rid) return;
        setError(e instanceof Error ? e.message : 'Failed to load articles.');
      } finally {
        if (requestId.current === rid) setIsLoading(false);
      }
    },
    [inTibetan, filters]
  );

  // Reset and reload whenever the feed or filters change.
  useEffect(() => {
    const rid = ++requestId.current;
    setArticles([]);
    setHasMore(true);
    load(0, false, rid);
  }, [inTibetan, filters, load]);

  const loadMore = useCallback(() => {
    load(articlesRef.current.length, true, requestId.current);
  }, [load]);

  const sentinelRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading,
  });

  const retry = () => {
    const rid = ++requestId.current;
    load(articlesRef.current.length, articlesRef.current.length > 0, rid);
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      {!inTibetan && filtersAreEmpty(filters) && <DailyOverviewCard />}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm">
          <p className="font-medium">Something went wrong</p>
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={retry}>
            Retry
          </Button>
        </div>
      )}

      {articles.map((article) => (
        <ArticleCard key={article._id} article={article} />
      ))}

      {isLoading &&
        articles.length === 0 &&
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-6">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="mt-2 h-4 w-1/4" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
          </div>
        ))}

      {!isLoading && !error && articles.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">
          No articles found with your selected filter(s)
        </p>
      )}

      {isLoading && articles.length > 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Loading more…
        </p>
      )}

      <div ref={sentinelRef} aria-hidden="true" />
    </div>
  );
}
