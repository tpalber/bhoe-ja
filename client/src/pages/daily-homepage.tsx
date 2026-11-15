import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, ChevronDown, Info, Search } from 'lucide-react';
import { BhoeJaSeal } from '../components/bhoe-ja-seal';
import { AboutSheet } from '../components/about-sheet';
import { SearchDialog } from '../components/search-dialog';
import { ArticleFeed } from './article-feed';
import { VideoFeed } from './video-feed';
import { useAppStore } from '../store/app-store';
import { fetchDailySummary } from '../lib/api';
import { EMPTY_FILTERS, type DailySummary, type SearchFilters } from '../types';
import { cn } from '../lib/utils';

const TEXT_YELLOW = '#fce650';
const ACCENT_CLOVER = '#7CB342';

type FeedTab = 'english' | 'tibetan' | 'videos';

/** Render the overview with [N] citation markers in the accent green. */
function CitedOverview({ text }: { text: string }) {
  const parts = text.split(/(\[\d+\])/g);
  return (
    <>
      {parts.map((part, i) =>
        /^\[\d+\]$/.test(part) ? (
          <span
            key={i}
            className="font-semibold"
            style={{ color: ACCENT_CLOVER }}
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/** Pulsing yellow placeholder bars shown while the digest loads (Option B). */
function SummarySkeleton() {
  const widths = ['100%', '92%', '97%', '78%', '64%'];
  return (
    <div
      className="flex flex-col gap-3"
      role="status"
      aria-label="Loading today's briefing"
    >
      {widths.map((width, i) => (
        <div
          key={i}
          className="h-[14px] animate-pulse rounded-full md:h-[20px]"
          style={{
            width,
            backgroundColor: 'rgba(252, 230, 80, 0.14)',
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Single white pulsing placeholder bar for the sources row while loading. */
function SourcesSkeleton() {
  return (
    <span
      className="inline-block h-[10px] animate-pulse rounded-full md:h-[11px]"
      role="status"
      aria-label="Loading sources"
      style={{
        width: '180px',
        backgroundColor: 'rgba(255, 255, 255, 0.14)',
      }}
    />
  );
}

function formatDigestDate(iso?: string): string {
  const date = iso ? new Date(iso) : new Date();
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
    .format(date)
    .toUpperCase();
}

function formatSourceDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso));
}

export function DailyHomepage({
  filters,
  onFiltersChange,
}: {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}) {
  const navigate = useNavigate();
  const { bookmarkCount } = useAppStore();
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [failed, setFailed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [feedTab, setFeedTab] = useState<FeedTab>('english');
  const feedRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetchDailySummary()
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const scrollToFeed = () => {
    feedRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-black">
      {/* Hero: yak artwork, sharp at the top, blurred at the bottom where the
          briefing sits, fading into the black feed below. */}
      <div className="relative mx-auto w-full md:w-[50vw]">
        {/* The artwork itself */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/hero/daily-yak-field.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: '50% 35%',
          }}
        />
        {/* Top scrim so the masthead reads over the sky */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[30%]"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0))',
          }}
        />
        {/* Blurred bottom: the same image, blurred only toward its own bottom
            edge, darkening into black. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[62%]"
          style={{
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            maskImage:
              'linear-gradient(to bottom, transparent, black 35%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent, black 35%)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[62%]"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,1) 100%)',
          }}
        />

        {/* Floating action icons, no nav bar */}
        <div className="absolute right-4 top-4 z-20 flex items-center gap-1 md:right-6 md:top-6">
          <button
            type="button"
            aria-label="Bookmarks"
            title="Bookmarks"
            onClick={() => navigate('/bookmark')}
            className="group relative rounded-full p-2 transition hover:scale-110 hover:opacity-80"
            style={{ color: TEXT_YELLOW }}
          >
            <Bookmark className="h-5 w-5" />
            {bookmarkCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                {bookmarkCount}
              </span>
            )}
            <span className="pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded bg-black/70 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
              Bookmarks
            </span>
          </button>
          <button
            type="button"
            aria-label="Search"
            title="Search"
            onClick={() => setSearchOpen(true)}
            className="group relative rounded-full p-2 transition hover:scale-110 hover:opacity-80"
            style={{ color: TEXT_YELLOW }}
          >
            <Search className="h-5 w-5" />
            <span className="pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded bg-black/70 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
              Search
            </span>
          </button>
          <button
            type="button"
            aria-label="About"
            title="About"
            onClick={() => setAboutOpen(true)}
            className="group relative rounded-full p-2 transition hover:scale-110 hover:opacity-80"
            style={{ color: TEXT_YELLOW }}
          >
            <Info className="h-5 w-5" />
            <span className="pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded bg-black/70 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
              About
            </span>
          </button>
        </div>

        <div
          className="relative z-10 flex flex-col"
          style={{ color: TEXT_YELLOW }}
        >
          {/* Header */}
          <header
            className="daily-entrance shrink-0 pt-[7vh] text-center"
            style={{ animationDelay: '0ms' }}
          >
            <h1 className="daily-serif flex items-center justify-center gap-1 md:gap-2 text-6xl md:text-7xl">
              <span>daily</span>
              <span style={{ color: ACCENT_CLOVER }}>
                <BhoeJaSeal className="h-12 w-12 md:h-14 md:w-14" />
              </span>
              <span>news</span>
            </h1>
            <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.25em] md:text-xs">
              {formatDigestDate(summary?.generatedAt)}
            </p>
          </header>

          {/* Tight gap between header and summary */}
          <div className="h-[8dvh] shrink-0 md:h-[10dvh]" />

          {/* Summary on the blurred zone */}
          <section
            className="daily-entrance px-7 md:px-12"
            style={{ animationDelay: '90ms' }}
          >
            {summary ? (
              <p className="daily-fade-in text-left text-base leading-relaxed md:text-xl">
                <CitedOverview text={summary.overview} />
              </p>
            ) : failed ? (
              <p className="text-left text-base leading-relaxed opacity-70 md:text-xl">
                Today&apos;s briefing isn&apos;t ready yet.
              </p>
            ) : (
              <SummarySkeleton />
            )}
          </section>

          {/* Divider + sources */}
          <section
            className="daily-entrance mt-5 px-7 md:px-12"
            style={{ animationDelay: '180ms' }}
          >
            <hr
              className="border-t"
              style={{ borderColor: TEXT_YELLOW, opacity: 0.35 }}
            />
            <div className="mt-3 flex flex-col gap-y-1 text-left text-[11px] leading-relaxed md:text-xs">
              {summary ? (
                summary.sources.map((source) => (
                  <div key={source.index} className="truncate">
                    <a
                      href={source.link}
                      target="_blank"
                      rel="noreferrer"
                      title={`${source.title} — ${source.site}`}
                      className="no-underline hover:underline"
                    >
                      <span style={{ color: ACCENT_CLOVER }}>
                        [{source.index}]
                      </span>{' '}
                      <span style={{ color: TEXT_YELLOW }}>
                        {source.site}: {source.title}
                      </span>
                    </a>
                    {source.publishedAt && (
                      <span
                        className="hidden opacity-70 md:inline"
                        style={{ color: TEXT_YELLOW }}
                      >
                        {`, ${formatSourceDate(source.publishedAt)}`}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <SourcesSkeleton />
              )}
            </div>
          </section>

          {/* Scroll cue: drops to the article list below */}
          <div
            className="daily-entrance mt-6 shrink-0 pb-8 text-center"
            style={{ animationDelay: '270ms' }}
          >
            <button
              type="button"
              onClick={scrollToFeed}
              className="group inline-flex flex-col items-center gap-1 bg-transparent"
              aria-label="Scroll to articles"
            >
              <span
                className="text-[11px] font-medium uppercase tracking-[0.25em] transition group-hover:brightness-125"
                style={{ color: TEXT_YELLOW }}
              >
                scroll
              </span>
              <ChevronDown
                className={`h-6 w-6 transition-transform group-hover:-translate-y-0.5 ${summary ? 'animate-daily-bounce-once' : ''}`}
                style={{ color: ACCENT_CLOVER }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Article list on pure black, inline on the homepage. */}
      <section ref={feedRef} className="bg-black pb-16">
        {/* Sticky feed tabs: English / Tibetan / Videos, no All. */}
        <div className="sticky top-0 z-30 bg-black/95 py-4 backdrop-blur">
          <div
            className="mx-auto flex max-w-3xl justify-center gap-2 px-4"
            role="tablist"
            aria-label="Article feed"
          >
            {(
              [
                { id: 'english', label: 'English' },
                { id: 'tibetan', label: 'Tibetan' },
                { id: 'videos', label: 'Videos' },
              ] as { id: FeedTab; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={feedTab === tab.id}
                onClick={() => setFeedTab(tab.id)}
                className={cn(
                  'rounded-full px-5 py-2 text-sm font-medium transition',
                  feedTab === tab.id
                    ? 'text-black'
                    : 'text-white/60 hover:text-white',
                )}
                style={
                  feedTab === tab.id
                    ? { backgroundColor: ACCENT_CLOVER }
                    : undefined
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 pt-6">
          {feedTab === 'videos' ? (
            <VideoFeed filters={filters} />
          ) : (
            <ArticleFeed inTibetan={feedTab === 'tibetan'} filters={filters} />
          )}
        </div>
      </section>

      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        initialValue={filters.searchValue}
        onSearch={(query) => {
          // Search filters the inline feed; stay on the homepage.
          onFiltersChange({
            ...EMPTY_FILTERS,
            searchValue: query ? query : undefined,
          });
        }}
      />
      <AboutSheet open={aboutOpen} onOpenChange={setAboutOpen} />
    </div>
  );
}
