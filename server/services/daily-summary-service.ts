import Article, { IArticle } from '../models/article';
import DailySummary, { IDailySummary } from '../models/daily-summary';
import { getLlmModel, isLlmConfigured } from './llm';
import {
  ArticleBrief,
  GeneratedDailySummary,
  generateDailySummary,
  summarizeArticleText,
} from './summarizer';

export interface DailySummaryUpdateResult {
  summary: IDailySummary | null;
  summariesCreated: number;
  regenerated: boolean;
}

const WINDOW_HOURS: number = 24;
const MAX_DIGEST_ARTICLES: number = 50;

export async function getLatestDailySummary(): Promise<IDailySummary | null> {
  return DailySummary.findOne().sort({ generatedAt: -1 }).exec();
}

async function getRecentEnglishArticles(
  windowStart: Date
): Promise<IArticle[]> {
  return Article.find({
    date: { $gte: windowStart },
    $or: [{ inTibetan: { $exists: false } }, { inTibetan: false }],
  })
    .sort({ date: -1 })
    .limit(MAX_DIGEST_ARTICLES)
    .exec();
}

async function ensureArticleSummaries(articles: IArticle[]): Promise<number> {
  let summariesCreated: number = 0;

  // Keep these calls sequential. A normal scrape adds only a small number of
  // new articles, and sequential calls avoid unnecessary provider bursts.
  for (const article of articles) {
    if (article.summary || !article.content) {
      continue;
    }
    try {
      const summary: string | null = await summarizeArticleText(
        article.title,
        article.content
      );
      if (summary) {
        article.summary = summary;
        await article.save();
        summariesCreated++;
      }
    } catch (error) {
      console.error(
        `Unable to summarize article ${article._id} (${article.link}): ${error}`
      );
    }
  }

  return summariesCreated;
}

function toBrief(article: IArticle): ArticleBrief {
  return {
    id: article._id.toString(),
    title: article.title,
    source: article.source,
    link: article.link,
    publishedAt: article.date.toISOString(),
    summary: article.summary || '',
  };
}

/**
 * Create any missing English article briefs, then regenerate the rolling
 * 24-hour digest only if at least one brief was not part of the last digest.
 * Any failure leaves the previously stored digest available to the API.
 */
export async function updateDailySummary(
  now: Date = new Date()
): Promise<DailySummaryUpdateResult> {
  const existingSummary: IDailySummary | null = await getLatestDailySummary();
  if (!isLlmConfigured()) {
    console.warn(
      'Skipping daily summary update because no LLM API key is configured.'
    );
    return {
      summary: existingSummary,
      summariesCreated: 0,
      regenerated: false,
    };
  }

  const windowEnd: Date = now;
  const windowStart: Date = new Date(
    now.getTime() - WINDOW_HOURS * 60 * 60 * 1000
  );
  const recentArticles: IArticle[] = await getRecentEnglishArticles(windowStart);
  const summariesCreated: number = await ensureArticleSummaries(recentArticles);
  const briefs: ArticleBrief[] = recentArticles
    .filter((article: IArticle) => !!article.summary)
    .map(toBrief);

  if (briefs.length === 0) {
    return {
      summary: existingSummary,
      summariesCreated: summariesCreated,
      regenerated: false,
    };
  }

  const previousArticleIds: string[] = existingSummary
    ? existingSummary.articleIds.map((id: any) => id.toString())
    : [];
  const hasNewBrief: boolean =
    !existingSummary ||
    briefs.some(
      (brief: ArticleBrief) => previousArticleIds.indexOf(brief.id) === -1
    );

  if (!hasNewBrief) {
    return {
      summary: existingSummary,
      summariesCreated: summariesCreated,
      regenerated: false,
    };
  }

  try {
    const generated: GeneratedDailySummary | null = await generateDailySummary(
      briefs
    );
    if (!generated) {
      return {
        summary: existingSummary,
        summariesCreated: summariesCreated,
        regenerated: false,
      };
    }

    const summary: IDailySummary = await DailySummary.findOneAndUpdate(
      {},
      {
        overview: generated.overview,
        sources: generated.sources.map((source) => ({
          index: source.index,
          article: source.articleId,
          title: source.title,
          site: source.site,
          link: source.link,
        })),
        articleIds: briefs.map((brief: ArticleBrief) => brief.id),
        articleCount: briefs.length,
        generatedAt: windowEnd,
        windowStart: windowStart,
        windowEnd: windowEnd,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).exec();

    console.info(
      `Daily summary regenerated with ${getLlmModel()} from ${briefs.length} article briefs.`
    );
    return {
      summary: summary,
      summariesCreated: summariesCreated,
      regenerated: true,
    };
  } catch (error) {
    console.error(`Unable to regenerate daily summary: ${error}`);
    return {
      summary: existingSummary,
      summariesCreated: summariesCreated,
      regenerated: false,
    };
  }
}
