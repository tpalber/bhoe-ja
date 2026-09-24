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
    $('article').each((i: number, elem: any) => {
      const titleLink = $(elem).find('h2 a');
      if (titleLink.text().trim() !== '' && titleLink.attr('href')) {
        const href: string = (titleLink.attr('href') as string).trim();
        let article: IArticle = new Article({
          title: titleLink.text().trim(),
          source: FreeTibetScraper.site,
          link: href.startsWith('http')
            ? href
            : FreeTibetScraper.baseUrl + href,
          inTibetan: false,
          date: this.parseDate($(elem).find('time').attr('datetime')),
          description: $(elem)
            .find('p')
            .not('.card-featured')
            .first()
            .text()
            .trim(),
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
