import axios from 'axios';
import { IArticle } from '../models/article';

export abstract class Scraper {
  private url: string;
  constructor(url: string) {
    this.url = url;
  }

  abstract async getData(data: any): Promise<IArticle[]>;

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
                article.save().catch((error) => {
                  console.debug(
                    `Failed to save Article, most likely exists already. ${error}`
                  );
                  return article;
                })
              );
            });
            return Promise.all(savedArticles);
          })
          .catch((error: any) => {
            console.log('Error parsing HTML response.');
            throw error;
          });
      })
      .catch((error: any) => {
        console.error(`Error getting articles from ${this.url}: ${error}`);
        return Promise.all([]);
      });
  }
}
