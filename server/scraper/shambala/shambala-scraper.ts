import { Scraper } from '../scraper';
import * as cheerio from 'cheerio';
import Article, { IArticle } from '../../models/article';
import { Util } from '../../util';

export class ShambalaScraper extends Scraper {
  public static site: string = 'Shambala';
  public static baseUrl: string = 'http://www.shambalanews.com/world-news';

  constructor(url: string) {
    super(url);
  }

  public static getSiteUrl(): string {
    return `${ShambalaScraper.baseUrl}/22-more-news`;
  }

  public static getTibetSiteUrl(): string {
    return `${ShambalaScraper.baseUrl}/19-tibet`;
  }

  public static getExileSiteUrl(): string {
    return `${ShambalaScraper.baseUrl}/20-tibet-exile`;
  }

  public static getInternationalSiteUrl(): string {
    return `${ShambalaScraper.baseUrl}/21-world`;
  }

  getArticles(html: any): Promise<IArticle[]> {
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
          source: ShambalaScraper.site,
          link: $(elem).find('h2 a').attr('href'),
          date: this.parseDate($(elem).find('time').attr('datetime')),
          inTibetan: true,
          description: $(elem).find('section p').text().trim(),
        });
        data.push(article);
      }
    });
    console.info(
      `***** Number of ${ShambalaScraper.site} articles: ${data.length}`
    );
    return Promise.all(data);
  }

  private parseDate(text?: string): Date {
    try {
      if (!text) {
        return Util.getCurrentDate();
      }

      const dateString: string = text.split('T', 1)[0];
      return new Date(dateString);
    } catch (e) {
      console.warn(`Error getting date for article: ${e}`);
      return Util.getCurrentDate();
    }
  }
}
