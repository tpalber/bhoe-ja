import { Scraper } from '../scraper';
import * as cheerio from 'cheerio';
import Article, { IArticle } from '../../models/article';
import { Util } from '../../util';

export class VOTScraper extends Scraper {
  public static site: string = 'Voice Of Tibet';
  public static baseUrl: string = 'https://vot.org';
  // WordPress category id for 'top-stories' (slug 'top-stories').
  private static topStoriesCategoryId: number = 3;

  constructor() {
    super(VOTScraper.getSiteUrl());
  }

  public static getSiteUrl(): string {
    // vot.org sits behind Deflect bot mitigation: every HTML route
    // (including /category/top-stories/) answers non-browser clients with
    // HTTP 429 and a JavaScript proof-of-work challenge page
    // ('Verifying if your connection is secure...'), so the listing HTML
    // can never be scraped with a plain HTTP request - browser-like
    // headers alone still get the same 429 challenge. Deflect does not
    // challenge the site's public WordPress REST API, so read the
    // Top Stories category from there instead. _fields keeps the
    // response to what the parser uses.
    return (
      `${VOTScraper.baseUrl}/wp-json/wp/v2/posts` +
      `?categories=${VOTScraper.topStoriesCategoryId}&per_page=10` +
      `&_fields=id,date,date_gmt,link,title,excerpt`
    );
  }

  private static plainText(htmlFragment: string): string {
    // Strip tags and decode HTML entities (WP renders titles/excerpts
    // with entities such as &#8217;).
    return cheerio
      .load(htmlFragment)('body')
      .text()
      .replace(/\s+/g, ' ')
      .trim();
  }

  getArticles(html: any): Promise<IArticle[]> {
    const data: IArticle[] = [];
    // Via the base class, axios has already parsed the JSON response
    // into an array; a raw string body (e.g. fetch-based callers) is
    // parsed here.
    let posts: any = html;
    if (typeof posts === 'string') {
      try {
        posts = JSON.parse(posts);
      } catch (error) {
        posts = [];
      }
    }
    if (!Array.isArray(posts)) {
      console.error(
        `***** Unexpected ${VOTScraper.site} response: not a post list`
      );
      return Promise.all(data);
    }
    posts.forEach((post: any) => {
      const title: string = VOTScraper.plainText(
        (post && post.title && post.title.rendered) || ''
      );
      const link: string = (post && post.link) || '';
      if (title !== '' && link !== '') {
        // date_gmt is UTC but carries no zone suffix.
        const published: Date = new Date(`${post.date_gmt || post.date}Z`);
        const description: string = VOTScraper.plainText(
          (post && post.excerpt && post.excerpt.rendered) || ''
        ).substring(0, 500);
        let article: IArticle = new Article({
          title,
          source: VOTScraper.site,
          link,
          date: isNaN(published.getTime())
            ? Util.getCurrentDate()
            : published,
          inTibetan: true,
          description,
        });
        data.push(article);
      }
    });
    console.info(`***** Number of ${VOTScraper.site} articles: ${data.length}`);
    return Promise.all(data);
  }
}
