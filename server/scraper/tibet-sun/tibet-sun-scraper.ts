import { Scraper } from '../scraper';
import * as cheerio from 'cheerio';
import Article, { IArticle } from '../../models/article';
import { Util } from '../../util';

export class TibetSunScraper extends Scraper {
  public static site: string = 'Tibet Sun';
  public static baseUrl: string = 'https://www.tibetsun.com/archives/news';

  constructor() {
    super(TibetSunScraper.getSiteUrl());
  }

  public static getSiteUrl(): string {
    return TibetSunScraper.baseUrl;
  }

  getArticles(html: any): Promise<IArticle[]> {
    const data: IArticle[] = [];
    const $ = cheerio.load(html);
    $('div[id="category-content"] li').each((i: number, elem: any) => {
      if (
        $(elem).find('span.entry-title a').text() !== '' &&
        $(elem).find('span.entry-title a').attr('href')
      ) {
        let article: IArticle = new Article({
          title: $(elem).find('span.entry-title a').text().trim(),
          source: TibetSunScraper.site,
          link: $(elem).find('span.entry-title a').attr('href'),
          date: this.parseDate($(elem).find('span.dateline').text()),
          description: $(elem).find('p').text().trim(),
        });
        data.push(article);
      }
    });
    console.info(
      `***** Number of ${TibetSunScraper.site} articles: ${data.length}`
    );
    return Promise.all(data);
  }

  private parseDate(text: string): Date {
    try {
      if (!text) {
        return Util.getCurrentDate();
      }

      const dateString: string = text.split('|', 1)[0];
      return dateString ? new Date(dateString) : Util.getCurrentDate();
    } catch (e) {
      console.warn(`Error getting date for article: ${e}`);
      return Util.getCurrentDate();
    }
  }
}
