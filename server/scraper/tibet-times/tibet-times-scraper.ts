import { Scraper } from '../scraper';
import * as cheerio from 'cheerio';
import Article, { IArticle } from '../../models/article';
import { Util } from '../../util';

export class TibetTimesScraper extends Scraper {
  public static site: string = 'Tibet Times';
  public static baseUrl: string = 'http://tibettimes.net/';

  constructor() {
    super(TibetTimesScraper.getSiteUrl());
  }

  public static getSiteUrl(): string {
    const currentDate: Date = new Date();
    return `${TibetTimesScraper.baseUrl}${currentDate.getFullYear()}/${
      currentDate.getMonth() + 1
    }/${currentDate.getDate()}/`;
  }

  async getData(html: any): Promise<IArticle[]> {
    const data: IArticle[] = [];
    const currentDate: Date = Util.getCurrentDate();
    const $ = cheerio.load(html);
    $('article').each((i: number, elem: any) => {
      if (
        $(elem).find('h1 a').text() !== '' &&
        $(elem).find('h1 a').attr('href')
      ) {
        let article: IArticle = new Article({
          title: $(elem).find('h1 a').text().trim(),
          source: TibetTimesScraper.site,
          link: $(elem).find('h1 a').attr('href'),
          date: currentDate,
          description: $(elem).find('.entry-summary').text().trim(),
        });
        data.push(article);
      }
    });
    console.info(
      `***** Number of ${TibetTimesScraper.site} articles: ${data.length}`
    );
    return Promise.all(data);
  }
}
