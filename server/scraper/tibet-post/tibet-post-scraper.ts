import { Scraper } from '../scraper';
import * as cheerio from 'cheerio';
import Article, { IArticle } from '../../models/article';
import { Util } from '../../util';

export class TibetPostScraper extends Scraper {
  public static site: string = 'Tibet Post';
  public static baseUrl: string = 'http://www.thetibetpost.com/en/news';

  constructor(url: string) {
    super(url);
  }

  public static getTibetSiteUrl(): string {
    return `${TibetPostScraper.baseUrl}/tibet`;
  }

  public static getExileSiteUrl(): string {
    return `${TibetPostScraper.baseUrl}/exile`;
  }

  public static getInternationalSiteUrl(): string {
    // return `${TibetPostScraper.baseUrl}?limit=20&start=1`;
    return `${TibetPostScraper.baseUrl}/international`;
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
          source: TibetPostScraper.site,
          link: $(elem).find('h2 a').attr('href'),
          date: currentDate,
          description: $(elem).find('section p').text().trim(),
        });
        data.push(article);
      }
    });
    console.info(
      `***** Number of ${TibetPostScraper.site} articles: ${data.length}`
    );
    return Promise.all(data);
  }
}
