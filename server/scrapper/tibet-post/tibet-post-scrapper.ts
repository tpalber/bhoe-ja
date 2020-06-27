import { Scrapper } from '../scrapper';
import * as cheerio from 'cheerio';
import { Article } from '../../models/article';

export class TibetPostScrapper extends Scrapper {
  public static site: string = 'TibetPost';
  public static baseUrl: string = 'http://www.thetibetpost.com/en/news/tibet';

  constructor(url: string) {
    super(url);
  }

  public static getSiteUrl(): string {
    // return `${TibetPostScrapper.baseUrl}?limit=20&start=1`;
    return TibetPostScrapper.baseUrl;
  }

  getData(html: any): Article[] {
    const data: Article[] = [];
    const $ = cheerio.load(html);
    $('article').each((i: number, elem: any) => {
      if (
        $(elem).find('h2 a').text() !== '' ||
        $(elem).find('h2 a').attr('href')
      ) {
        data.push({
          title: $(elem).find('h2 a').text().trim(),
          source: TibetPostScrapper.site,
          link: $(elem).find('h2 a').attr('href') || 'broken link',
          description: $(elem).find('section p').text(),
        });
      }
    });
    console.log(
      `***** Number of ${TibetPostScrapper.site} articles: ${data.length}`
    );
    return data;
  }
}
