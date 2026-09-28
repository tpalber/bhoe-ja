import { Bookmark } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { getSourceLabel, openLink, trimDate, youtubeUrl } from '../lib/format';
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
        <div
          className="cursor-pointer aspect-video w-full overflow-hidden"
          onClick={() => openLink(url)}
        >
          <img
            src={video.thumbnailBig}
            alt="Video thumbnail"
            className="h-full w-full object-cover transition-transform hover:scale-[1.02]"
            loading="lazy"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle
            className="cursor-pointer text-base hover:text-primary hover:underline"
            onClick={() => openLink(url)}
          >
            {video.title}
          </CardTitle>
          <Badge
            variant="secondary"
            className="shrink-0 cursor-pointer"
            onClick={() => openLink(url)}
          >
            {getSourceLabel(video.source, isSmallScreen)}
          </Badge>
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
          <p
            className="cursor-pointer text-sm leading-relaxed text-muted-foreground"
            onClick={() => openLink(url)}
          >
            {video.description}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
