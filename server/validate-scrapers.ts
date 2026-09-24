/**
 * Scraper validation harness.
 * Mirrors the exact scraper wiring in server.ts, but without MongoDB:
 *  - fetches each production scraper URL with native fetch (browser UA)
 *  - runs the real scraper class's getArticles(html) parser
 *  - validates parsed articles against the Article schema rules
 *
 * Run: npx ts-node-dev --transpileOnly ./validate-scrapers.ts
 *  (or compile with tsc and run with node)
 */
import axios from 'axios';
import { Scraper } from './scraper/scraper';
import Article, { IArticle } from './models/article';
import { CTAScraper } from './scraper/cta/cta-scraper';
import { FreeTibetScraper } from './scraper/free-tibet/free-tibet-scraper';
import { PhayulScraper } from './scraper/phayul/phayul-scraper';
import { RFAScraper } from './scraper/rfa/rfa-scraper';
import { ShambalaScraper } from './scraper/shambala/shambala-scraper';
import { TibetPostScraper } from './scraper/tibet-post/tibet-post-scraper';
import { TibetSunScraper } from './scraper/tibet-sun/tibet-sun-scraper';
import { TibetTimesScraper } from './scraper/tibet-times/tibet-times-scraper';
import { VOTScraper } from './scraper/vot/vot-scraper';

interface Target {
  label: string;
  url: string;
  scraper: Scraper;
}

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

function buildTargets(): Target[] {
  const t: Target[] = [];
  const cta = new CTAScraper();
  t.push({ label: 'CTA', url: CTAScraper.getSiteUrl(), scraper: cta });

  const ft = new FreeTibetScraper();
  t.push({ label: 'Free Tibet', url: FreeTibetScraper.getSiteUrl(), scraper: ft });

  const ph = new PhayulScraper();
  t.push({ label: 'Phayul', url: PhayulScraper.getSiteUrl(), scraper: ph });

  t.push({
    label: 'RFA (English)',
    url: RFAScraper.getSiteUrl(),
    scraper: new RFAScraper(RFAScraper.getSiteUrl()),
  });
  t.push({
    label: 'RFA (Tibetan)',
    url: RFAScraper.getTibetanSiteUrl(),
    scraper: new RFAScraper(RFAScraper.getTibetanSiteUrl(), true),
  });

  const shUrls = [
    ['Shambala (more-news)', ShambalaScraper.getSiteUrl()],
    ['Shambala (exile)', ShambalaScraper.getExileSiteUrl()],
    ['Shambala (international)', ShambalaScraper.getInternationalSiteUrl()],
    ['Shambala (tibet)', ShambalaScraper.getTibetSiteUrl()],
  ] as [string, string][];
  for (const [label, url] of shUrls) {
    t.push({ label, url, scraper: new ShambalaScraper(url) });
  }

  const tpUrls = [
    ['Tibet Post (exile)', TibetPostScraper.getExileSiteUrl()],
    ['Tibet Post (international)', TibetPostScraper.getInternationalSiteUrl()],
    ['Tibet Post (tibet)', TibetPostScraper.getTibetSiteUrl()],
  ] as [string, string][];
  for (const [label, url] of tpUrls) {
    t.push({ label, url, scraper: new TibetPostScraper(url) });
  }

  const ts = new TibetSunScraper();
  t.push({ label: 'Tibet Sun', url: TibetSunScraper.getSiteUrl(), scraper: ts });

  const tt = new TibetTimesScraper();
  t.push({ label: 'Tibet Times', url: TibetTimesScraper.getSiteUrl(), scraper: tt });

  const vot = new VOTScraper();
  t.push({ label: 'VOT', url: VOTScraper.getSiteUrl(), scraper: vot });

  return t;
}

async function fetchHtml(
  url: string
): Promise<{ html?: string; status?: number; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal as any,
      headers: {
        'User-Agent': BROWSER_UA,
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    if (!res.ok) {
      return { status: res.status, error: `HTTP ${res.status} ${res.statusText}` };
    }
    const html = await res.text();
    return { html, status: res.status };
  } catch (e) {
    const msg = (e as any)?.message || String(e);
    return { error: (e as any)?.name === 'AbortError' ? 'timeout (30s)' : msg };
  } finally {
    clearTimeout(timer);
  }
}

function validateArticles(articles: IArticle[]): string[] {
  const issues: string[] = [];
  articles.forEach((a, i) => {
    if (!a.title || !a.title.trim()) issues.push(`article[${i}]: empty title`);
    if (!a.link || !a.link.trim())
      issues.push(`article[${i}]: empty link`);
    else if (!/^https?:\/\//i.test(a.link.trim()))
      issues.push(`article[${i}]: link is not absolute: ${a.link.trim().slice(0, 80)}`);
    if (!a.date || isNaN(new Date(a.date).getTime()))
      issues.push(`article[${i}]: invalid date: ${a.date}`);
    if (typeof a.inTibetan !== 'boolean')
      issues.push(`article[${i}]: inTibetan not boolean`);
  });
  return issues;
}

async function main() {
  console.log(`\nScraper validation run: ${new Date().toISOString()}\n`);
  const targets = buildTargets();
  const results: any[] = [];

  for (const target of targets) {
    console.log(`--- ${target.label} ---`);
    console.log(`URL: ${target.url}`);
    const fetched = await fetchHtml(target.url);
    if (!fetched.html) {
      console.log(`FETCH FAILED: ${fetched.error}`);
      results.push({ label: target.label, url: target.url, status: 'FETCH_FAILED', error: fetched.error });
      console.log('');
      continue;
    }
    console.log(`FETCH OK (HTTP ${fetched.status}, ${(fetched.html || '').length} bytes)`);
    let articles: IArticle[] = [];
    try {
      articles = await target.scraper.getArticles(fetched.html);
    } catch (e) {
      console.log(`PARSE ERROR: ${(e as any)?.message || e}`);
      results.push({ label: target.label, url: target.url, status: 'PARSE_ERROR', error: String((e as any)?.message || e) });
      console.log('');
      continue;
    }
    const issues = validateArticles(articles);
    console.log(`PARSED ARTICLES: ${articles.length}`);
    if (issues.length > 0) {
      console.log(`FIELD ISSUES (${issues.length}):`);
      issues.slice(0, 5).forEach((x) => console.log(`  - ${x}`));
    }
    articles.slice(0, 2).forEach((a) =>
      console.log(`  sample: "${(a.title || '').slice(0, 90)}" | ${a.link} | ${a.date}`)
    );
    results.push({
      label: target.label,
      url: target.url,
      status: articles.length > 0 ? 'OK' : 'ZERO_ARTICLES',
      httpStatus: fetched.status,
      count: articles.length,
      issues,
    });
    console.log('');
  }

  console.log('\n================ SUMMARY ================');
  for (const r of results) {
    const flag =
      r.status === 'OK'
        ? `OK (${r.count} articles)`
        : r.status === 'ZERO_ARTICLES'
        ? `BROKEN — fetch OK but 0 articles parsed`
        : `BROKEN — ${r.status}: ${r.error}`;
    console.log(`${r.label}: ${flag}`);
    if (r.issues && r.issues.length > 0) console.log(`    field issues: ${r.issues.length}`);
  }
  console.log('=======================================\n');
  process.exit(0);
}

main().catch((e) => {
  console.error('Validator crashed:', e);
  process.exit(1);
});
