import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { BhoeJaSeal } from '../components/bhoe-ja-seal';
import { fetchDailySummary } from '../lib/api';
import type { DailySummary } from '../types';

const TEXT_YELLOW = '#fce650';
const ACCENT_CLOVER = '#7CB342';
const GUTTER_WARM_WHITE = '#faf7ec';

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

export function DailyHomepage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [failed, setFailed] = useState(false);

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
    <div
      className="w-full overflow-hidden"
      style={{ backgroundColor: GUTTER_WARM_WHITE }}
    >
      {/* Centered artwork column: 50vw on desktop, full-bleed on mobile */}
      <div
        className="relative mx-auto h-[100dvh] w-full md:w-[50vw]"
        style={{
          backgroundImage: 'url(/hero/daily-thangka.jpg)',
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

        <div
          className="relative z-10 flex h-full flex-col"
          style={{ color: TEXT_YELLOW }}
        >
          {/* Header */}
          <header className="pt-[7vh] text-center">
            <h1 className="daily-serif flex items-center justify-center gap-3 text-5xl md:gap-4 md:text-6xl">
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
              <p className="text-left text-[13px] leading-relaxed md:text-base">
                <CitedOverview text={summary.overview} />
              </p>
            ) : (
              <p className="animate-pulse text-left text-[13px] leading-relaxed opacity-70 md:text-base">
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
            <p className="mt-3 text-left text-[13px] leading-relaxed md:text-sm">
              <span className="font-semibold">Sources:</span>{' '}
              {summary ? (
                summary.sources.map((source) => (
                  <span key={source.index} className="mr-3 whitespace-nowrap">
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
            </p>
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
    </div>
  );
}
