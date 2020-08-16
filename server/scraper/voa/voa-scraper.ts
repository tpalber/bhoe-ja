import { Scraper } from '../scraper';
import * as cheerio from 'cheerio';
import { IArticle } from '../../models/article';

export class VOAScraper extends Scraper {
  public static site: string = 'VOA YouTube';
  public static baseUrl: string = 'https://www.youtube.com/watch?v=';

  constructor(url: string) {
    super(url);
  }

  public static getSiteUrl(): string {
    // let apiKey: string = process.env.GOOGLE_API_KEY || 'INVALID_API_KEY';
    // const currentDate: Date = new Date();
    // return `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=UC2UlA4pbz0AYXXHba7cbu0Q&part=snippet,id&order=date&maxResults=20&publishedAfter=2020-07-20T00:00:00Z&publishedBefore=2020-07-22T02:00:00Z`;
    return `${VOAScraper.baseUrl}/user/VOAKunleng/videos`;
  }

  /**
   * TODO:
   * VOA Tibetan site doesn't have a listing of all the latest news.
   * It only shows old news, so not sure if it's a issue on their end or on purpose.
   */
  async getData(html: any): Promise<IArticle[]> {
    const data: IArticle[] = [];
    const $ = cheerio.load(html);
    console.info(`***** Number of ${VOAScraper.site} articles: ${data.length}`);
    return Promise.all(data);
  }
}
