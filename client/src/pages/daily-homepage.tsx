import { useEffect, useState } from 'react';
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
            onClick={() => navigate('/bookmark')}
            className="relative rounded-full p-2 transition hover:opacity-80"
            style={{ color: TEXT_YELLOW }}
          >
            <Bookmark className="h-5 w-5" />
            {bookmarkCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                {bookmarkCount}
              </span>
            )}
          </button>
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="rounded-full p-2 transition hover:opacity-80"
            style={{ color: TEXT_YELLOW }}
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="About"
            onClick={() => setAboutOpen(true)}
            className="rounded-full p-2 transition hover:opacity-80"
            style={{ color: TEXT_YELLOW }}
          >
            <Info className="h-5 w-5" />
          </button>
        </div>

        <div
          className="relative z-10 flex h-full flex-col"
          style={{ color: TEXT_YELLOW }}
        >
          {/* Header */}
          <header className="pt-[7vh] text-center">
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

          {/* Spacer pushes the summary to roughly mid-viewport */}
          <div className="flex-1" />

          {/* Summary */}
          <section className="px-7 md:px-12">
            {summary ? (
              <p className="text-left text-[12px] leading-relaxed md:text-[18px]">
                <CitedOverview text={summary.overview} />
              </p>
            ) : (
              <p className="animate-pulse text-left text-[12px] leading-relaxed opacity-70 md:text-[18px]">
                {failed
                  ? "Today's briefing isn't ready yet."
                  : 'Preparing today\u2019s briefing\u2026'}
              </p>
            )}
          </section>

          {/* Divider + sources */}
          <section className="mt-5 px-7 md:px-12">
            <hr
              className="border-t"
              style={{ borderColor: TEXT_YELLOW, opacity: 0.35 }}
            />
            <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-left text-[13px] leading-relaxed md:text-sm">
              <span>Sources:</span>
              {summary ? (
                summary.sources.map((source) => (
                  <span key={source.index} className="whitespace-nowrap">
                    <a
                      href={source.link}
                      target="_blank"
                      rel="noreferrer"
                      title={source.title}
                      className="no-underline hover:underline"
                    >
                      <span
                        className="font-semibold"
                        style={{ color: ACCENT_CLOVER }}
                      >
                        [{source.index}]
                      </span>{' '}
                      <span style={{ color: TEXT_YELLOW }}>{source.site}</span>
                    </a>
                  </span>
                ))
              ) : (
                <span className="opacity-60">\u2026</span>
              )}
            </div>
          </section>

          {/* Read more */}
          <div className="mt-4 pb-7 text-center">
            <button
              type="button"
              onClick={() => navigate('/articles')}
              className="group inline-flex flex-col items-center gap-1 bg-transparent"
              aria-label="Read all articles"
            >
              <span
                className="text-[11px] font-medium uppercase tracking-[0.25em]"
                style={{ color: TEXT_YELLOW }}
              >
                read more
              </span>
              <ChevronDown
                className="animate-daily-bounce h-6 w-6"
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
