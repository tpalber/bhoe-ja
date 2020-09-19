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
    const currentDate: Date = Util.getCurrentDate();
    const $ = cheerio.load(html);
    $('article').each((i: number, elem: any) => {
      if (
        $(elem).find('h2 a').text() !== '' &&
        $(elem).find('h2 a').attr('href')
      ) {
        let article: IArticle = new Article({
          title: $(elem).find('h2 a').text().trim(),
          source: PhayulScraper.site,
          link: $(elem).find('h2 a').attr('href'),
          inTibetan: false,
          date: currentDate,
          description: $(elem).find('p').text().trim(),
        });
        data.push(article);
      }
    });
    console.info(
      `***** Number of ${PhayulScraper.site} articles: ${data.length}`
    );
    return Promise.all(data);
  }
}
