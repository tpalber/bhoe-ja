import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, ChevronDown, Info, Search } from 'lucide-react';
import { BhoeJaSeal } from '../components/bhoe-ja-seal';
import { AboutSheet } from '../components/about-sheet';
import { SearchDialog } from '../components/search-dialog';
import { useAppStore } from '../store/app-store';
import { fetchDailySummary } from '../lib/api';
import { EMPTY_FILTERS, type DailySummary, type SearchFilters } from '../types';

const TEXT_YELLOW = '#fce650';
const ACCENT_CLOVER = '#7CB342';

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
  const summarySectionRef = useRef<HTMLElement>(null);
  const summaryTextRef = useRef<HTMLParagraphElement>(null);

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

  // Fluid summary type: binary-search the largest font size at which the full
  // digest fits in the available space, so the whole page always fits on one
  // screen with the 20dvh header gap intact.
  useLayoutEffect(() => {
    const section = summarySectionRef.current;
    const p = summaryTextRef.current;
    if (!section || !p) return;

    const fit = () => {
      const available = section.clientHeight;
      if (available <= 0) return;
      const isDesktop = window.matchMedia('(min-width: 768px)').matches;
      const minSize = isDesktop ? 12 : 10;
      const maxSize = isDesktop ? 24 : 16;
      let lo = minSize;
      let hi = maxSize;
      for (let i = 0; i < 10; i++) {
        const mid = (lo + hi) / 2;
        p.style.fontSize = `${mid}px`;
        if (p.offsetHeight <= available) {
          lo = mid;
        } else {
          hi = mid;
        }
      }
      p.style.fontSize = `${lo}px`;
      // Graceful fallback: if even the minimum size overflows (pathologically
      // long digest), fade the bottom edge to signal continuation.
      section.style.maskImage =
        p.offsetHeight > available
          ? 'linear-gradient(to bottom, black 82%, transparent)'
          : 'none';
    };

    fit();
    // Re-fit once webfonts settle, in case metrics shifted under fallback fonts.
    if (document.fonts) {
      document.fonts.ready.then(() => fit()).catch(() => {});
    }
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [summary, failed]);

  return (
    <div className="w-full overflow-hidden bg-background">
      {/* Centered artwork column: 50vw on desktop, full-bleed on mobile */}
      <div
        className="relative mx-auto h-[100dvh] w-full md:w-[50vw]"
        style={{
          backgroundImage: 'url(/hero/daily-yak-field.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark scrim so the yellow text reads over the artwork */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.28) 35%, rgba(0,0,0,0.38) 60%, rgba(0,0,0,0.68))',
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
          className="relative z-10 flex h-full flex-col"
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

          {/* Spacer: ~20% of viewport height between header and summary */}
          <div className="h-[20dvh] shrink-0" />

          {/* Summary: flexes to fill available space; font size auto-fits via JS
              so the full digest always fits on one screen */}
          <section
            ref={summarySectionRef}
            className="daily-entrance min-h-0 flex-1 overflow-hidden px-7 md:px-12"
            style={{ animationDelay: '90ms' }}
          >
            {summary ? (
              <p
                ref={summaryTextRef}
                className="daily-fade-in text-left leading-relaxed"
              >
                <CitedOverview text={summary.overview} />
              </p>
            ) : failed ? (
              <p
                ref={summaryTextRef}
                className="text-left leading-relaxed opacity-70"
              >
                Today&apos;s briefing isn&apos;t ready yet.
              </p>
            ) : (
              <SummarySkeleton />
            )}
          </section>

          {/* Divider + sources */}
          <section
            className="daily-entrance mt-5 shrink-0 px-7 md:px-12"
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
                    {/* Desktop: date only (site is already up front);
                        mobile shows site + title */}
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

          {/* Read more */}
          <div
            className="daily-entrance mt-4 shrink-0 pb-7 text-center"
            style={{ animationDelay: '270ms' }}
          >
            <button
              type="button"
              onClick={() => navigate('/articles')}
              className="group inline-flex flex-col items-center gap-1 bg-transparent"
              aria-label="Read all articles"
            >
              <span
                className="text-[11px] font-medium uppercase tracking-[0.25em] transition group-hover:brightness-125"
                style={{ color: TEXT_YELLOW }}
              >
                read more
              </span>
              <ChevronDown
                className={`h-6 w-6 transition-transform group-hover:-translate-y-0.5 ${summary ? 'animate-daily-bounce-once' : ''}`}
                style={{ color: ACCENT_CLOVER }}
              />
            </button>
          </div>
        </div>
      </div>

      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        initialValue={filters.searchValue}
        onSearch={(query) => {
          onFiltersChange({
            ...EMPTY_FILTERS,
            searchValue: query ? query : undefined,
          });
          navigate('/articles');
        }}
      />
      <AboutSheet open={aboutOpen} onOpenChange={setAboutOpen} />
    </div>
  );
}
