import axios from 'axios';
import { IArticle } from '../models/article';

export abstract class Scraper {
  private url: string;
  constructor(url: string) {
    this.url = url;
  }

  abstract async getData(html: any): Promise<IArticle[]>;

  public async initiate(): Promise<IArticle[]> {
    console.debug(`***** GET ${this.url}`);
    return axios
      .get(this.url)
      .then(async (response) => {
        return this.getData(response.data)
          .then((articles: IArticle[]) => {
            let savedArticles: Promise<IArticle>[] = [];
            articles.forEach((article) => {
              savedArticles.push(
                article.save().catch((error: any) => {
                  // Ignore E11000 duplicate key error index
                  if (error.code && error.code !== 11000) {
                    console.error(`Failed to save Article: ${error}`);
                  }
                  return article;
                })
              );
            });
            return Promise.all(savedArticles);
          })
          .catch((error: any) => {
            console.error('Error parsing HTML response.');
            throw error;
          });
      })
      .catch((error: any) => {
        console.error(`Error getting articles from ${this.url}: ${error}`);
        return Promise.all([]);
      });
  }
}
