import { Scraper } from '../scraper';
import * as cheerio from 'cheerio';
import Article, { IArticle } from '../../models/article';
import { Util } from '../../util';

export class CTAScraper extends Scraper {
  public static site: string = 'CTA';
  public static baseUrl: string = 'https://tibet.net';

  constructor() {
    super(CTAScraper.getSiteUrl());
  }

  public static getSiteUrl(): string {
    return `${CTAScraper.baseUrl}/category/flash-news/?fwp_content_types=articles`;
  }

  getArticles(html: any): Promise<IArticle[]> {
    const data: IArticle[] = [];
    const $ = cheerio.load(html);
    $('li div.posts-item').each((i: number, elem: any) => {
      if (
        $(elem).find('a.posts-item-title-link h4').text() !== '' &&
        $(elem).find('a.posts-item-title-link').attr('href')
      ) {
        let article: IArticle = new Article({
          title: $(elem).find('a.posts-item-title-link h4').text().trim(),
          source: CTAScraper.site,
          link:
            CTAScraper.baseUrl +
            $(elem).find('a.posts-item-title-link').attr('href'),
          date: this.parseDate(
            $(elem).find('div.posts-item-meta-item').text().trim()
          ),
          description: $(elem).find('div.posts-item-excerpt').text().trim(),
        });
        data.push(article);
      }
    });
    console.info(`***** Number of ${CTAScraper.site} articles: ${data.length}`);
    return Promise.all(data);
  }

  private parseDate(text: string): Date {
    try {
      if (!text) {
        return Util.getCurrentDate();
      }

      const dateString: string = text.split('•', 1)[0];
      return new Date(dateString.trim());
    } catch (e) {
      console.warn(`Error getting date for article: ${e}`);
      return Util.getCurrentDate();
    }
  }
}
