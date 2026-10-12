import { Scraper } from '../scraper';
import * as cheerio from 'cheerio';
import Article, { IArticle } from '../../models/article';
import { Util } from '../../util';

export class ICTScraper extends Scraper {
  public static site: string = 'International Campaign for Tibet';
  public static baseUrl: string = 'https://savetibet.org';

  constructor() {
    super(ICTScraper.getSiteUrl());
  }

  public static getSiteUrl(): string {
    // Avada blog feed page; the /latest-news/ landing page only shows a
    // few items without dates.
    return `${ICTScraper.baseUrl}/latest-news-feed/`;
  }

  protected getRequestDelayMs(): number {
    // Honor the site's robots.txt crawl-delay.
    return 10000;
  }

  getArticles(html: any): Promise<IArticle[]> {
    const data: IArticle[] = [];
    const $ = cheerio.load(html);
    // Avada theme: h3.blog-shortcode-post-title > a, date like
    // "October 9, 2026" in p.fusion-single-line-meta within the same
    // .fusion-post-content-wrapper block.
    $('h3.blog-shortcode-post-title').each((i: number, elem: any) => {
      const titleLink = $(elem).find('a');
      const href = titleLink.attr('href');
      if (titleLink.text().trim() !== '' && href) {
        const link: string = href.startsWith('http')
          ? href
          : ICTScraper.baseUrl + href;
        const dateText = $(elem)
          .closest('.fusion-post-content-wrapper')
          .find('p.fusion-single-line-meta')
          .first()
          .text()
          .trim();
        const parsed = new Date(dateText);
        let article: IArticle = new Article({
          title: titleLink.text().trim(),
          source: ICTScraper.site,
          link,
          inTibetan: false,
          date: isNaN(parsed.getTime()) ? Util.getCurrentDate() : parsed,
          description: '',
        });
        data.push(article);
      }
    });
    console.info(`***** Number of ${ICTScraper.site} articles: ${data.length}`);
    return Promise.all(data);
  }
}
