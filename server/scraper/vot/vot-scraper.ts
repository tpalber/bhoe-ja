import { Scraper } from '../scraper';
import * as cheerio from 'cheerio';
import Article, { IArticle } from '../../models/article';
import { Util } from '../../util';

export class VOTScraper extends Scraper {
  public static site: string = 'Voice Of Tibet';
  public static baseUrl: string = 'https://vot.org/category/top-stories/';

  constructor() {
    super(VOTScraper.getSiteUrl());
  }

  protected getRequestHeaders(): Record<string, string> {
    // vot.org sits behind Deflect bot mitigation that returns HTTP 429 to
    // non-browser clients. Send browser-like headers, same approach as
    // Tibetan Review's Sucuri workaround.
    return {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    };
  }

  public static getSiteUrl(): string {
    return VOTScraper.baseUrl;
  }

  getArticles(html: any): Promise<import('../../models/article').IArticle[]> {
    const data: IArticle[] = [];
    const currentDate: Date = Util.getCurrentDate();
    const $ = cheerio.load(html);
    $('article').each((i: number, elem: any) => {
      if (
        $(elem).find('h2 a').text() !== '' &&
        $(elem).find('h2 a').attr('href')
      ) {
        let article: IArticle = new Article({
          title: $(elem).find('h2 a').text().trim(),
          source: VOTScraper.site,
          link: $(elem).find('h2 a').attr('href'),
          date: currentDate,
          inTibetan: true,
          description: $(elem).find('.post_content').text().trim(),
        });
        data.push(article);
      }
    });
    console.info(`***** Number of ${VOTScraper.site} articles: ${data.length}`);
    return Promise.all(data);
  }
}
