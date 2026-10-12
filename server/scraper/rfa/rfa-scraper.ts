import { Scraper } from '../scraper';
import * as cheerio from 'cheerio';
import Article, { IArticle } from '../../models/article';
import { Util } from '../../util';

export class RFAScraper extends Scraper {
  public static site: string = 'Radio Free Asia';
  public static baseUrl: string = 'https://www.rfa.org/';

  private inTibetan: boolean = false;

  constructor(url: string, inTibetan?: boolean) {
    super(url);
    if (inTibetan) {
      this.inTibetan = inTibetan;
    }
  }

  public static getSiteUrl(): string {
    // The /english/news/tibet archive path was retired; the section now
    // lives under /english/world/asia/tibet and its story_archive page
    // embeds the archive feed as Fusion JSON (parsed in getArticles).
    return `${RFAScraper.baseUrl}english/world/asia/tibet/story_archive`;
  }

  public static getTibetanSiteUrl(): string {
    return `${RFAScraper.baseUrl}tibetan/story_archive`;
  }

  getArticles(html: any): Promise<IArticle[]> {
    const data: IArticle[] = [];
    const $ = cheerio.load(html);
    if (this.inTibetan) {
      // Current tibetan archive markup: result items under
      // .archive-result-text with h2.c-heading a, time.c-date[datetime]
      // and p.c-paragraph.
      $('.archive-result-text').each((i: number, elem: any) => {
        const titleLink = $(elem).find('h2.c-heading a');
        const href = titleLink.attr('href');
        if (titleLink.text().trim() !== '' && href) {
          const link: string = href.startsWith('http')
            ? href
            : 'https://www.rfa.org' + href;
          let article: IArticle = new Article({
            title: titleLink.text().trim(),
            source: RFAScraper.site,
            link,
            inTibetan: this.inTibetan,
            date: this.getArticleDateFromIso(
              $(elem).find('time.c-date').attr('datetime')
            ),
            description: $(elem).find('p.c-paragraph').text().trim(),
          });
          data.push(article);
        }
      });
    } else {
      $('.sectionteaser').each((i: number, elem: any) => {
        if (
          $(elem).find('h2 a span').text() !== '' &&
          $(elem).find('h2 a').attr('href')
        ) {
          let article: IArticle = new Article({
            title: $(elem).find('h2 a').text().trim(),
            source: RFAScraper.site,
            link: $(elem).find('h2 a').attr('href'),
            inTibetan: this.inTibetan,
            date: this.getArticleDate(
              $(elem).find('#story_date').text().trim()
            ),
            description: $(elem).find('p').text().trim(),
          });
          data.push(article);
        }
      });
      // The English story archive is now a Fusion/Arc-XP app: article items
      // no longer render in static HTML. Fall back to the embedded
      // story_archive_story_feed_section JSON payload in the page.
      if (data.length === 0) {
        this.getArticlesFromFusionJson(html).forEach((article) =>
          data.push(article)
        );
      }
    }
    console.info(`***** Number of ${RFAScraper.site} articles: ${data.length}`);
    return Promise.all(data);
  }

  /**
   * Parse articles from the embedded Fusion/Arc-XP story-archive payload.
   * The page embeds its archive feed as JSON under
   * "story_archive_story_feed_section": {"{query}": {"data":
   * {"content_elements": [...]}}}. Each element carries headlines.basic,
   * description.basic, display_date, and websites['radio-free-asia'].website_url.
   */
  private getArticlesFromFusionJson(html: string): IArticle[] {
    const data: IArticle[] = [];
    try {
      const marker = '"story_archive_story_feed_section"';
      const markerIdx = html.indexOf(marker);
      if (markerIdx === -1) {
        return data;
      }
      const elementsKey = '"content_elements":[';
      const elementsIdx = html.indexOf(elementsKey, markerIdx);
      if (elementsIdx === -1) {
        return data;
      }
      const arrayStart = elementsIdx + elementsKey.length - 1;
      const arrayJson = this.extractBalancedJsonArray(html, arrayStart);
      if (!arrayJson) {
        return data;
      }
      const elements: any[] = JSON.parse(arrayJson);
      elements.forEach((el: any) => {
        const title = el?.headlines?.basic?.trim();
        const websiteUrl =
          el?.websites?.['radio-free-asia']?.website_url ||
          el?.websites?.['radiofreeasia']?.website_url;
        if (title && websiteUrl) {
          const link = websiteUrl.startsWith('http')
            ? websiteUrl
            : 'https://www.rfa.org' + websiteUrl;
          data.push(
            new Article({
              title,
              source: RFAScraper.site,
              link,
              inTibetan: false,
              date: this.getArticleDateFromIso(el?.display_date),
              description: (el?.description?.basic || '').trim(),
            })
          );
        }
      });
    } catch (error) {
      console.warn(`Error parsing RFA Fusion JSON payload: ${error}`);
    }
    return data;
  }

  /**
   * Extract a balanced JSON array starting at the given '[' index,
   * respecting string literals and escapes.
   */
  private extractBalancedJsonArray(html: string, startIdx: number): string | null {
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = startIdx; i < html.length; i++) {
      const ch = html[i];
      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (ch === '\\') {
          escaped = true;
        } else if (ch === '"') {
          inString = false;
        }
      } else {
        if (ch === '"') {
          inString = true;
        } else if (ch === '[') {
          depth++;
        } else if (ch === ']') {
          depth--;
          if (depth === 0) {
            return html.substring(startIdx, i + 1);
          }
        }
      }
    }
    return null;
  }

  private getArticleDateFromIso(datetime?: string): Date {    try {
      if (!datetime) {
        return Util.getCurrentDate();
      }
      const parsed = new Date(datetime);
      return isNaN(parsed.getTime()) ? Util.getCurrentDate() : parsed;
    } catch (e) {
      console.warn(`Error getting date for article: ${e}`);
      return Util.getCurrentDate();
    }
  }

  private getArticleDate(dateString: string): Date {
    try {
      if (!dateString) {
        return Util.getCurrentDate();
      }
      let dateStringParts: number[] = dateString
        .split('-')
        .map((part: string) => parseInt(part));
      return dateStringParts.length === 3
        ? new Date(
            dateStringParts[0],
            dateStringParts[1] - 1,
            dateStringParts[2]
          )
        : Util.getCurrentDate();
    } catch (e) {
      console.warn(`Error getting date for article: ${e}`);
      return Util.getCurrentDate();
    }
  }
}
