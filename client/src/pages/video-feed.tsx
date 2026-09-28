import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchVideos } from '../lib/api';
import type { SearchFilters, Video } from '../types';
import { VideoCard } from '../components/video-card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { useInfiniteScroll } from '../hooks/use-infinite-scroll';

const PAGE_SIZE = 6;

export function VideoFeed({ filters }: { filters: SearchFilters }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const videosRef = useRef<Video[]>([]);
  videosRef.current = videos;

  const load = useCallback(
    async (offset: number, append: boolean, rid: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchVideos(offset, filters);
        if (requestId.current !== rid) return;
        setVideos((prev) => (append ? [...prev, ...result] : result));
        setHasMore(result.length === PAGE_SIZE);
      } catch (e) {
        if (requestId.current !== rid) return;
        setError(e instanceof Error ? e.message : 'Failed to load videos.');
      } finally {
        if (requestId.current === rid) setIsLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    const rid = ++requestId.current;
    setVideos([]);
    setHasMore(true);
    load(0, false, rid);
  }, [filters, load]);

  const loadMore = useCallback(() => {
    load(videosRef.current.length, true, requestId.current);
  }, [load]);

  const sentinelRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading,
  });

  const retry = () => {
    const rid = ++requestId.current;
    load(videosRef.current.length, videosRef.current.length > 0, rid);
  };

  return (
    <div>
      {error && (
        <div className="mx-auto mb-4 max-w-3xl rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm">
          <p className="font-medium">Something went wrong</p>
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={retry}>
            Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}

        {isLoading &&
          videos.length === 0 &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border">
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="p-6">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/4" />
              </div>
            </div>
          ))}
      </div>

      {!isLoading && !error && videos.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">
          No videos found with your selected filter(s)
        </p>
      )}

      {isLoading && videos.length > 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Loading more…
        </p>
      )}

      <div ref={sentinelRef} aria-hidden="true" />
    </div>
  );
}
