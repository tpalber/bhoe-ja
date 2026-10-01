import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, Clock3 } from 'lucide-react';
import { fetchDailyOverview } from '../lib/api';
import type { DailyOverview } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Separator } from './ui/separator';

const COLLAPSED_SENTENCE_COUNT = 3;

function splitSentences(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+(?:\s*\[\d+\])*\s*/g);
  return sentences && sentences.length > 0 ? sentences : [text];
}

function formatGeneratedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function DailyOverviewCard() {
  const [overview, setOverview] = useState<DailyOverview | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchDailyOverview()
      .then((result) => {
        if (!cancelled) setOverview(result);
      })
      .catch(() => {
        if (!cancelled) setOverview(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sourcesByIndex = useMemo(() => {
    const map = new Map<number, DailyOverview['sources'][number]>();
    overview?.sources.forEach((source) => map.set(source.index, source));
    return map;
  }, [overview]);

  if (!overview?.overview) return null;

  const sentences = splitSentences(overview.overview.trim());
  const visibleText = expanded
    ? overview.overview.trim()
    : sentences.slice(0, COLLAPSED_SENTENCE_COUNT).join(' ').trim();
  const canExpand = sentences.length > COLLAPSED_SENTENCE_COUNT;

  const renderWithCitations = (text: string): ReactNode[] => {
    const parts = text.split(/(\[\d+\])/g);
    return parts.map((part, index) => {
      const match = part.match(/^\[(\d+)\]$/);
      if (!match) return <span key={index}>{part}</span>;

      const source = sourcesByIndex.get(Number(match[1]));
      if (!source) return <span key={index}>{part}</span>;

      return (
        <a
          key={index}
          href={source.link}
          target="_blank"
          rel="noopener noreferrer"
          title={`${source.site}: ${source.title}`}
          className="mx-0.5 rounded bg-accent px-1 py-0.5 text-[11px] font-semibold leading-none text-primary hover:underline"
        >
          {part}
        </a>
      );
    });
  };

  return (
    <Card className="overflow-hidden border-l-4 border-l-primary">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-[22px] leading-tight">Latest News</CardTitle>
          <Popover open={timeOpen} onOpenChange={setTimeOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Past 24 hours. Show when this overview was updated."
                onMouseEnter={() => setTimeOpen(true)}
                onMouseLeave={() => setTimeOpen(false)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                Past 24 hrs
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              side="bottom"
              sideOffset={6}
              className="w-auto px-3 py-2 text-xs"
              onMouseEnter={() => setTimeOpen(true)}
              onMouseLeave={() => setTimeOpen(false)}
            >
              Updated {formatGeneratedAt(overview.generatedAt)}
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        <p className="text-[15px] leading-7 text-foreground sm:text-base">
          {renderWithCitations(visibleText)}
        </p>

        {canExpand && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4 rounded-full"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? 'Show less' : 'Show more'}
            {expanded ? (
              <ChevronUp className="ml-1.5 h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="ml-1.5 h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        )}

        {expanded && (
          <>
            <Separator className="mt-5" />
            <p className="mt-3 text-xs text-muted-foreground">
              AI-generated based on the latest articles.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
