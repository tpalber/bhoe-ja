import { Scrapper } from '../scrapper';
import * as cheerio from 'cheerio';
import { Article } from '../../models/article';

export class PhayulScrapper extends Scrapper {
  public static site: string = 'Phayul';
  public static baseUrl: string = 'https://www.phayul.com/';

  constructor(url: string) {
    super(url);
  }

  public static getSiteUrl(): string {
    const currentDate: Date = new Date();
    return `${
      PhayulScrapper.baseUrl
    }${currentDate.getFullYear()}/${currentDate.getMonth()}/`;
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
          source: PhayulScrapper.site,
          link: $(elem).find('h2 a').attr('href') || 'broken link',
          description: $(elem).find('p').text(),
        });
      }
    });
    console.log(
      `***** Number of ${PhayulScrapper.site} articles: ${data.length}`
    );
    return data;
  }
}
