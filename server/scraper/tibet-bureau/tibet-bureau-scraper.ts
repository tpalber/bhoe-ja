import { Scraper } from '../scraper';
import * as cheerio from 'cheerio';
import Article, { IArticle } from '../../models/article';
import { Util } from '../../util';

export class TibetBureauScraper extends Scraper {
  public static site: string = 'Dalai Lama Bureau';
  public static baseUrl: string = 'https://tibetbureau.in';

  constructor() {
    super(TibetBureauScraper.getSiteUrl());
  }

  public static getSiteUrl(): string {
    // WordPress RSS feed: reliable titles, links, and pubDates.
    return `${TibetBureauScraper.baseUrl}/feed/`;
  }

  getArticles(html: any): Promise<IArticle[]> {
    const data: IArticle[] = [];
    const $ = cheerio.load(html, { xmlMode: true });
    $('item').each((i: number, elem: any) => {
      const title = $(elem).find('title').text().trim();
      const link = $(elem).find('link').text().trim();
      if (title !== '' && link !== '') {
        const pubDate = new Date($(elem).find('pubDate').text().trim());
        // Strip HTML tags from the RSS description for a plain summary.
        const description = $(elem)
          .find('description')
          .text()
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 500);
        let article: IArticle = new Article({
          title,
          source: TibetBureauScraper.site,
          link,
          inTibetan: false,
          date: isNaN(pubDate.getTime()) ? Util.getCurrentDate() : pubDate,
          description,
        });
        data.push(article);
      }
    });
    console.info(
      `***** Number of ${TibetBureauScraper.site} articles: ${data.length}`
    );
    return Promise.all(data);
  }
}
