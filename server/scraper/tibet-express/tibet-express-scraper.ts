import { Scraper } from '../scraper';
import * as cheerio from 'cheerio';
import Article, { IArticle } from '../../models/article';
import { Util } from '../../util';

export class TibetExpressScraper extends Scraper {
  public static site: string = 'Tibet Express';
  public static baseUrl: string = 'https://tibetexpress.net';

  constructor() {
    super(TibetExpressScraper.getSiteUrl());
  }

  public static getSiteUrl(): string {
    return `${TibetExpressScraper.baseUrl}/`;
  }

  getArticles(html: any): Promise<IArticle[]> {
    const data: IArticle[] = [];
    const $ = cheerio.load(html);
    // ColorMag theme: h3.cm-entry-title > a, date in time.entry-date[datetime]
    // inside the same .cm-post-content block.
    $('h3.cm-entry-title').each((i: number, elem: any) => {
      const titleLink = $(elem).find('a');
      const href = titleLink.attr('href');
      if (titleLink.text().trim() !== '' && href) {
        const link: string = href.startsWith('http')
          ? href
          : TibetExpressScraper.baseUrl + href;
        const datetime = $(elem)
          .closest('.cm-post-content')
          .find('time.entry-date')
          .attr('datetime');
        let article: IArticle = new Article({
          title: titleLink.text().trim(),
          source: TibetExpressScraper.site,
          link,
          inTibetan: false,
          date: datetime ? new Date(datetime) : Util.getCurrentDate(),
          description: '',
        });
        data.push(article);
      }
    });
    console.info(
      `***** Number of ${TibetExpressScraper.site} articles: ${data.length}`
    );
    return Promise.all(data);
  }
}
