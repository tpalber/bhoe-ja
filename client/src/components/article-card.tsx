import { Bookmark } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { getSourceLabel, trimDate } from '../lib/format';
import { useAppStore } from '../store/app-store';
import { useIsSmallScreen } from '../hooks/use-is-small-screen';
import type { Article } from '../types';
import { cn } from '../lib/utils';

export function ArticleCard({ article }: { article: Article }) {
  const { isBookmarked, toggleArticleBookmark } = useAppStore();
  const isSmallScreen = useIsSmallScreen();
  const bookmarked = isBookmarked(article._id, false);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="hover:text-primary">
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {article.title}
            </a>
          </CardTitle>
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Badge variant="secondary" className="cursor-pointer">
              {getSourceLabel(article.source, isSmallScreen)}
            </Badge>
          </a>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>{trimDate(article.date)}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark for later'}
            onClick={() => toggleArticleBookmark(article)}
          >
            {bookmarked ? (
              <Bookmark className="h-4 w-4 fill-primary text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {article.description && (
        <CardContent>
          <p
            className={cn(
              'text-sm leading-relaxed text-muted-foreground'
            )}
          >
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer"
            >
              {article.description}
            </a>
          </p>
        </CardContent>
      )}
    </Card>
  );
}
