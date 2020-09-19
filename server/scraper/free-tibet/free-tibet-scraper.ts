import { Scraper } from '../scraper';
import * as cheerio from 'cheerio';
import Article, { IArticle } from '../../models/article';
import { Util } from '../../util';

export class FreeTibetScraper extends Scraper {
  public static site: string = 'Free Tibet';
  public static baseUrl: string = 'https://freetibet.org';

  constructor() {
    super(FreeTibetScraper.getSiteUrl());
  }

  public static getSiteUrl(): string {
    return `${FreeTibetScraper.baseUrl}/news`;
  }

  getArticles(html: any): Promise<IArticle[]> {
    const data: IArticle[] = [];
    const $ = cheerio.load(html);
    $('div.views-row').each((i: number, elem: any) => {
      if (
        $(elem).find('h3.node-title a').text() !== '' &&
        $(elem).find('h3.node-title a').attr('href')
      ) {
        let article: IArticle = new Article({
          title: $(elem).find('h3.node-title a').text().trim(),
          source: FreeTibetScraper.site,
          link:
            FreeTibetScraper.baseUrl +
            $(elem).find('h3.node-title a').attr('href'),
          inTibetan: false,
          date: this.parseDate(
            $(elem).find('span.date-display-single').attr('content')
          ),
          description: $(elem).find('div.field-name-body').text().trim(),
        });
        data.push(article);
      }
    });
    console.info(
      `***** Number of ${FreeTibetScraper.site} articles: ${data.length}`
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
