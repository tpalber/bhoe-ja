import axios from 'axios';
import { Article } from '../models/article';

export abstract class Scrapper {
  private url: string;
  constructor(url: string) {
    this.url = url;
  }

  abstract getData(data: any): Article[];

  public async initiate(): Promise<Article[]> {
    let articles: Article[] = [];
    console.log(`***** GET ${this.url}`);
    await axios
      .get(this.url)
      .then((response: { data: any }) => {
        let test: Article[] = this.getData(response.data);
        articles = articles.concat(test);
      })
      .catch((error: any) => {
        console.log(`Error getting articles for ${this.url}`);
        console.log(error);
      });

    return articles;
  }
}
