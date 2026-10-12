import { Scraper } from '../scraper';
import * as cheerio from 'cheerio';
import Article, { IArticle } from '../../models/article';
import { Util } from '../../util';

export class TibetanReviewScraper extends Scraper {
  public static site: string = 'Tibetan Review';
  public static baseUrl: string = 'https://www.tibetanreview.net';

  constructor() {
    super(TibetanReviewScraper.getSiteUrl());
  }

  public static getSiteUrl(): string {
    return `${TibetanReviewScraper.baseUrl}/`;
  }

  protected getRequestHeaders(): Record<string, string> {
    // Site sits behind a Sucuri proxy that 307-loops non-browser clients.
    return {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    };
  }

  getArticles(html: any): Promise<IArticle[]> {
    const data: IArticle[] = [];
    const $ = cheerio.load(html);
    // tagDiv Newspaper theme: h3.entry-title.td-module-title > a,
    // date in time.entry-date[datetime] inside the same module container.
    $('h3.entry-title.td-module-title').each((i: number, elem: any) => {
      const titleLink = $(elem).find('a');
      const href = titleLink.attr('href');
      if (titleLink.text().trim() !== '' && href) {
        const link: string = href.startsWith('http')
          ? href
          : TibetanReviewScraper.baseUrl + href;
        const datetime = $(elem)
          .closest('.td-module-container')
          .find('time.entry-date')
          .attr('datetime');
        let article: IArticle = new Article({
          title: titleLink.text().trim(),
          source: TibetanReviewScraper.site,
          link,
          inTibetan: false,
          date: datetime ? new Date(datetime) : Util.getCurrentDate(),
          description: '',
        });
        data.push(article);
      }
    });
    console.info(
      `***** Number of ${TibetanReviewScraper.site} articles: ${data.length}`
    );
    return Promise.all(data);
  }
}
