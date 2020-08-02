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

  public static getSiteUrl(): string {
    return VOTScraper.baseUrl;
  }

  getData(html: any): Promise<import('../../models/article').IArticle[]> {
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
          description: $(elem).find('.post_content').text().trim(),
        });
        data.push(article);
      }
    });
    console.log(`***** Number of ${VOTScraper.site} articles: ${data.length}`);
    return Promise.all(data);
  }
}
