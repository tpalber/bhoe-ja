import axios from 'axios';
import * as cheerio from 'cheerio';

const CONTENT_SELECTORS: string[] = [
  'article',
  'main',
  '.entry-content',
  '.post-content',
  '.article-content',
  '.article-body',
  '.story-body',
  '.td-post-content',
  '.jeg_post_content',
  '[class*="article-body"]',
  '[class*="story-body"]',
  '[class*="content-body"]',
];

function normalizeText(text: string): string {
  return text
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

function collectParagraphs($: any, root: any): string[] {
  const paragraphs: string[] = [];
  root.find('p').each((i: number, elem: any) => {
    const text: string = normalizeText($(elem).text());
    if (text.length >= 30 && paragraphs.indexOf(text) === -1) {
      paragraphs.push(text);
    }
  });
  return paragraphs;
}

/**
 * Extract the readable article body from an article page.
 *
 * This intentionally uses paragraph text instead of returning raw page text,
 * which keeps navigation, ads, and unrelated page chrome out of the stored
 * article content while retaining the substantive full text.
 */
export function extractArticleContent(html: string): string | undefined {
  const $: any = cheerio.load(html);
  $('script, style, noscript, nav, header, footer, aside, form, iframe, svg').remove();

  let bestParagraphs: string[] = [];
  let bestLength: number = 0;

  CONTENT_SELECTORS.forEach((selector: string) => {
    $(selector).each((i: number, elem: any) => {
      const paragraphs: string[] = collectParagraphs($, $(elem));
      const totalLength: number = paragraphs.join('\n\n').length;
      if (totalLength > bestLength) {
        bestParagraphs = paragraphs;
        bestLength = totalLength;
      }
    });
  });

  if (bestLength < 200) {
    const bodyParagraphs: string[] = collectParagraphs($, $('body'));
    if (bodyParagraphs.join('\n\n').length > bestLength) {
      bestParagraphs = bodyParagraphs;
      bestLength = bodyParagraphs.join('\n\n').length;
    }
  }

  if (bestLength < 200) {
    return undefined;
  }

  return bestParagraphs.join('\n\n');
}

export async function fetchArticleContent(
  url: string
): Promise<string | undefined> {
  try {
    const response: any = await axios.get(url, {
      timeout: 15000,
      maxRedirects: 5,
      responseType: 'text',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; BhoeJa/1.0; +https://github.com/tpalber/bhoe-ja)',
        Accept: 'text/html,application/xhtml+xml',
      },
      validateStatus: (status: number) => status >= 200 && status < 400,
    });
    return extractArticleContent(response.data);
  } catch (error) {
    console.warn(`Unable to fetch full article content from ${url}: ${error}`);
    return undefined;
  }
}
