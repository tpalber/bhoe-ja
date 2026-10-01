import { Bookmark } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { getSourceLabel, trimDate, youtubeUrl } from '../lib/format';
import { useAppStore } from '../store/app-store';
import { useIsSmallScreen } from '../hooks/use-is-small-screen';
import type { Video } from '../types';

export function VideoCard({ video }: { video: Video }) {
  const { isBookmarked, toggleVideoBookmark } = useAppStore();
  const isSmallScreen = useIsSmallScreen();
  const bookmarked = isBookmarked(video._id, true);
  const url = youtubeUrl(video.videoID);

  return (
    <Card className="overflow-hidden">
      {video.thumbnailBig && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block aspect-video w-full cursor-pointer overflow-hidden"
        >
          <img
            src={video.thumbnailBig}
            alt="Video thumbnail"
            className="h-full w-full object-cover transition-transform hover:scale-[1.02]"
            loading="lazy"
          />
        </a>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base hover:text-primary">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {video.title}
            </a>
          </CardTitle>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Badge variant="secondary" className="cursor-pointer">
              {getSourceLabel(video.source, isSmallScreen)}
            </Badge>
          </a>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>{trimDate(video.date)}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark for later'}
            onClick={() => toggleVideoBookmark(video)}
          >
            {bookmarked ? (
              <Bookmark className="h-4 w-4 fill-primary text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {video.description && (
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer"
            >
              {video.description}
            </a>
          </p>
        </CardContent>
      )}
    </Card>
  );
}
