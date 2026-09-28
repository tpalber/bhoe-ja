import { BookmarkX } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { getSourceLabel, openLink, trimDate } from '../lib/format';
import { useAppStore } from '../store/app-store';
import { useIsSmallScreen } from '../hooks/use-is-small-screen';
import type { Bookmark } from '../types';

function BookmarkCard({ bookmark }: { bookmark: Bookmark }) {
  const { removeBookmark } = useAppStore();
  const isSmallScreen = useIsSmallScreen();

  return (
    <Card className="overflow-hidden">
      {bookmark.isVideo && bookmark.thumbnailBig && (
        <div
          className="aspect-video w-full cursor-pointer overflow-hidden"
          onClick={() => openLink(bookmark.link)}
        >
          <img
            src={bookmark.thumbnailBig}
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
            onClick={() => openLink(bookmark.link)}
          >
            {bookmark.title}
          </CardTitle>
          <div className="flex shrink-0 items-center gap-1">
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() => openLink(bookmark.link)}
            >
              {getSourceLabel(bookmark.source, isSmallScreen)}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              aria-label="Remove bookmark"
              onClick={() => removeBookmark(bookmark._id, bookmark.isVideo)}
            >
              <BookmarkX className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {trimDate(bookmark.date)}
        </p>
      </CardHeader>
      {bookmark.description && (
        <CardContent>
          <p
            className="cursor-pointer text-sm leading-relaxed text-muted-foreground"
            onClick={() => openLink(bookmark.link)}
          >
            {bookmark.description}
          </p>
        </CardContent>
      )}
    </Card>
  );
}

export function BookmarksPage() {
  const { bookmarks } = useAppStore();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Bookmarks</h1>
      {bookmarks.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No bookmarks yet. Tap the bookmark icon on any article or video to
          save it for later.
        </p>
      ) : (
        bookmarks.map((b) => <BookmarkCard key={`${b.isVideo}-${b._id}`} bookmark={b} />)
      )}
    </div>
  );
}
