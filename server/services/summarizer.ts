import { createChatCompletion, isLlmConfigured } from './llm';

export interface ArticleBrief {
  id: string;
  title: string;
  source: string;
  link: string;
  publishedAt: string;
  summary: string;
}

export interface DailySummarySource {
  index: number;
  articleId: string;
  title: string;
  site: string;
  link: string;
}

export interface GeneratedDailySummary {
  overview: string;
  sources: DailySummarySource[];
}

const MAX_ARTICLE_CHARS_FOR_SUMMARY: number = 15000;

function normalizeSummary(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function stripCodeFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}

/**
 * Generate the stored English brief for one article from its full text.
 * The article model saves this as the `summary` column.
 */
export async function summarizeArticleText(
  title: string,
  content: string
): Promise<string | null> {
  if (!isLlmConfigured() || !content || content.trim().length < 200) {
    return null;
  }

  const articleText: string = content.slice(0, MAX_ARTICLE_CHARS_FOR_SUMMARY);
  const result: string = await createChatCompletion(
    [
      {
        role: 'system',
        content:
          'You summarize Tibet-related news accurately and neutrally. Use only facts stated in the supplied article. Do not add background, speculation, or information from outside the article.',
      },
      {
        role: 'user',
        content: `Write a summary of the following article in exactly 3 to 4 complete sentences. Capture the main event, the people or organizations involved, and the most important consequence or context stated in the article. Return only the summary, with no heading or bullet points.\n\nTitle: ${title}\n\nFull article text:\n${articleText}`,
      },
    ],
    { maxTokens: 300 }
  );

  const summary: string = normalizeSummary(result);
  return summary.length > 0 ? summary : null;
}

function countSentences(text: string): number {
  const sentences: RegExpMatchArray | null = text.match(/[^.!?]+[.!?]+/g);
  return sentences ? sentences.length : 0;
}

function getCitedSourceIndexes(text: string): Set<number> {
  const indexes: Set<number> = new Set<number>();
  const citationPattern: RegExp = /\[(\d+)\]/g;
  let match: RegExpExecArray | null;
  while ((match = citationPattern.exec(text)) !== null) {
    indexes.add(Number(match[1]));
  }
  return indexes;
}

function findMissingSourceIndexes(overview: string, expectedCount: number): number[] {
  const citedIndexes: Set<number> = getCitedSourceIndexes(overview);
  const missingIndexes: number[] = [];
  for (let index: number = 1; index <= expectedCount; index++) {
    if (!citedIndexes.has(index)) {
      missingIndexes.push(index);
    }
  }
  return missingIndexes;
}

function buildDailySummaryInput(briefs: ArticleBrief[]): any {
  return {
    windowHours: 24,
    articleCount: briefs.length,
    articles: briefs.map((brief: ArticleBrief, index: number) => ({
      sourceIndex: index + 1,
      articleId: brief.id,
      sourceTitle: brief.title,
      sourceSite: brief.source,
      sourceLink: brief.link,
      publishedAt: brief.publishedAt,
      summary: brief.summary,
    })),
  };
}

/**
 * Build the rolling 24-hour overview from already-generated article briefs.
 * This second tier avoids repeatedly sending full article text to the model.
 * The model writes only the overview and citation markers; the backend
 * attaches the source metadata so links and titles cannot be invented.
 */
export async function generateDailySummary(
  briefs: ArticleBrief[]
): Promise<GeneratedDailySummary | null> {
  const usableBriefs: ArticleBrief[] = briefs.filter(
    (brief: ArticleBrief) => brief.summary && brief.summary.trim().length > 0
  );
  if (!isLlmConfigured() || usableBriefs.length === 0) {
    return null;
  }

  const input: any = buildDailySummaryInput(usableBriefs);
  const inputJson: string = JSON.stringify(input, null, 2);
  const systemPrompt: string =
    'You write the "Last 24 Hours" overview for Bhoe Ja, a Tibet news aggregator. Use only the supplied article summaries and metadata. Do not invent facts, dates, quotes, locations, reactions, background, or significance that are not stated in the supplied summaries. Do not refer to any article that was not supplied.';
  const userPrompt: string = `Write the overview for the English articles from the last 24 hours using only the JSON input below.

Requirements:
- Return valid JSON only in this exact shape: {"overview":"..."}
- The overview must be one paragraph of 5 to 7 complete sentences.
- Cover every supplied article at least once.
- Cite sources inline using the sourceIndex in brackets, like [1] or [2].
- Every sourceIndex from 1 through articleCount must appear at least once in the overview.
- Put each citation immediately after the clause or sentence fragment it supports.
- When several supplied articles describe the same development, group them in one sentence and cite each source, like [1][3].
- Do not output URLs, markdown links, bullet points, headings, or a source list.
- Do not write phrases like "according to reports" unless the source citation is attached.
- Keep the tone neutral, specific, and concise.

JSON input:
${inputJson}`;

  for (let attempt: number = 0; attempt < 2; attempt++) {
    const correction: string =
      attempt === 0
        ? ''
        : '\n\nThe previous response was invalid because it had the wrong sentence count or missed one or more source citations. Regenerate the complete overview and make sure it has 5 to 7 sentences and cites every sourceIndex from 1 through articleCount at least once.';
    const result: string = await createChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt + correction },
      ],
      { json: true, maxTokens: 1000 }
    );

    let parsed: any;
    try {
      parsed = JSON.parse(stripCodeFences(result));
    } catch (error) {
      console.error(`Unable to parse daily summary JSON: ${error}`);
      continue;
    }

    const overview: string =
      typeof parsed?.overview === 'string' ? normalizeSummary(parsed.overview) : '';
    const sentenceCount: number = countSentences(overview);
    const missingIndexes: number[] = findMissingSourceIndexes(
      overview,
      usableBriefs.length
    );

    if (
      overview &&
      sentenceCount >= 5 &&
      sentenceCount <= 7 &&
      missingIndexes.length === 0
    ) {
      return {
        overview: overview,
        sources: usableBriefs.map(
          (brief: ArticleBrief, index: number): DailySummarySource => ({
            index: index + 1,
            articleId: brief.id,
            title: brief.title,
            site: brief.source,
            link: brief.link,
          })
        ),
      };
    }

    console.error(
      `Daily summary response failed validation: ${sentenceCount} sentences, missing source indexes ${missingIndexes.join(', ') || 'none'}.`
    );
  }

  return null;
}
