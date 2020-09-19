import { Scraper } from '../scraper';
import * as cheerio from 'cheerio';
import Article, { IArticle } from '../../models/article';
import { Util } from '../../util';

export class RFAScraper extends Scraper {
  public static site: string = 'Radio Free Asia';
  public static baseUrl: string = 'https://www.rfa.org/';

  private inTibetan: boolean = false;

  constructor(url: string, inTibetan?: boolean) {
    super(url);
    if (inTibetan) {
      this.inTibetan = inTibetan;
    }
  }

  public static getSiteUrl(): string {
    return `${RFAScraper.baseUrl}english/news/tibet/story_archive`;
  }

  public static getTibetanSiteUrl(): string {
    return `${RFAScraper.baseUrl}tibetan/story_archive`;
  }

  getArticles(html: any): Promise<IArticle[]> {
    const data: IArticle[] = [];
    const $ = cheerio.load(html);
    $('.sectionteaser').each((i: number, elem: any) => {
      if (
        $(elem).find('h2 a span').text() !== '' &&
        $(elem).find('h2 a').attr('href')
      ) {
        let article: IArticle = new Article({
          title: $(elem).find('h2 a').text().trim(),
          source: RFAScraper.site,
          link: $(elem).find('h2 a').attr('href'),
          inTibetan: this.inTibetan,
          date: this.getArticleDate($(elem).find('#story_date').text().trim()),
          description: $(elem).find('p').text().trim(),
        });
        data.push(article);
      }
    });
    console.info(`***** Number of ${RFAScraper.site} articles: ${data.length}`);
    return Promise.all(data);
  }

  private getArticleDate(dateString: string): Date {
    try {
      if (!dateString) {
        return Util.getCurrentDate();
      }
      let dateStringParts: number[] = dateString
        .split('-')
        .map((part: string) => parseInt(part));
      return dateStringParts.length === 3
        ? new Date(
            dateStringParts[0],
            dateStringParts[1] - 1,
            dateStringParts[2]
          )
        : Util.getCurrentDate();
    } catch (e) {
      console.warn(`Error getting date for article: ${e}`);
      return Util.getCurrentDate();
    }
  }
}
