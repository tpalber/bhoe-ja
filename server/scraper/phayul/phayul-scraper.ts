import { Scraper } from '../scraper';
import * as cheerio from 'cheerio';
import Article, { IArticle } from '../../models/article';
import { Util } from '../../util';

export class PhayulScraper extends Scraper {
  public static site: string = 'Phayul';
  public static baseUrl: string = 'https://www.phayul.com/';

  constructor() {
    super(PhayulScraper.getSiteUrl());
  }

  public static getSiteUrl(): string {
    const currentDate: Date = new Date();
    return `${PhayulScraper.baseUrl}${currentDate.getFullYear()}/${
      currentDate.getMonth() + 1
    }/`;
  }

  async getArticles(html: any): Promise<IArticle[]> {
    const data: IArticle[] = [];
    const $ = cheerio.load(html);
    $('.tdb_module_loop').each((i: number, elem: any) => {
      const titleLink = $(elem).find('h3.entry-title a');
      if (titleLink.text().trim() !== '' && titleLink.attr('href')) {
        let article: IArticle = new Article({
          title: titleLink.text().trim(),
          source: PhayulScraper.site,
          link: (titleLink.attr('href') as string).trim(),
          inTibetan: false,
          date: this.parseDate($(elem).find('time').attr('datetime')),
          description: $(elem).find('.td-excerpt').text().trim(),
        });
        data.push(article);
      }
    });
    console.info(
      `***** Number of ${PhayulScraper.site} articles: ${data.length}`
    );
    return Promise.all(data);
  }

  private parseDate(datetime?: string): Date {
    try {
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
}
