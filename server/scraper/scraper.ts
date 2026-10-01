import axios from 'axios';
import Article, { IArticle } from '../models/article';
import { fetchArticleContent } from './content-extractor';

export abstract class Scraper {
  private url: string;
  constructor(url: string) {
    this.url = url;
  }

  abstract getArticles(html: any): Promise<IArticle[]>;

  public async scrapeArticles(): Promise<IArticle[]> {
    let html: any;
    try {
      const response: any = await axios.get(this.url);
      html = response.data;
    } catch (error) {
      console.error(`Error getting articles from ${this.url} ${error}`);
      return Promise.all([]);
    }

    let articles: IArticle[];
    try {
      articles = await this.getArticles(html);
    } catch (error) {
      console.error('Error parsing HTML response.');
      throw error;
    }

    await this.addContentToNewArticles(articles);

    const savedArticles: Promise<IArticle>[] = articles.map((article) =>
      article.save().catch((error: any) => {
        // Ignore E11000 duplicate key error index
        if (error.code && error.code !== 11000) {
          console.error(`Failed to save Article: ${error}`);
        }
        return article;
      })
    );
    return Promise.all(savedArticles);
  }

  /**
   * Fetch and store full article text only for links that are not already in
   * the database. Existing articles keep their current scrape behavior, and a
   * failed content fetch never prevents the article itself from being saved.
   */
  private async addContentToNewArticles(articles: IArticle[]): Promise<void> {
    await Promise.all(
      articles.map(async (article: IArticle) => {
        try {
          const existingArticle: any = await Article.exists({
            link: article.link,
          });
          if (!existingArticle) {
            const content: string | undefined = await fetchArticleContent(
              article.link
            );
            if (content) {
              article.content = content;
            }
          }
        } catch (error) {
          console.warn(
            `Unable to prepare full content for ${article.link}: ${error}`
          );
        }
      })
    );
  }
}
