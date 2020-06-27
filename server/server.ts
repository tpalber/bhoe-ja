import { PhayulScrapper } from './scrapper/phayul/phayul-scrapper';
import { Scrapper } from './scrapper/scrapper';
import express = require('express');
import { Article } from './models/article';
import { TibetPostScrapper } from './scrapper/tibet-post/tibet-post-scrapper';

const app: express.Application = express();
app.get('/articles', async function (req, res) {
  const supportedSites: string[] = [
    PhayulScrapper.site,
    TibetPostScrapper.site,
  ];
  res.json(await scrapSites(supportedSites));
});

app.get('/', async function (req, res) {
  const apiEndpoints: any = [
    {
      Endpoint: '/articles',
      Description: 'Get list of articles',
    },
  ];
  res.json(apiEndpoints);
});

app.listen(3000, function () {
  console.info(
    'BhoeJa ☕️ app server is listening on localhost:3000, open your browser on http://localhost:3000/'
  );
});

async function scrapSites(sites: string[]): Promise<Article[]> {
  let articles: Article[] = [];

  //   let articlesPromise: Promise<Article[]>[] = [];
  // TODO: See if we returns the articles without awaiting on scrapper.initiate();
  // Try Promise.all()?
  for await (const site of sites) {
    let scrapper: Scrapper | undefined;
    switch (site) {
      case PhayulScrapper.site:
        console.log(`***** Site ${site}`);
        scrapper = new PhayulScrapper(PhayulScrapper.getSiteUrl());
        break;
      case TibetPostScrapper.site:
        console.log(`***** Site ${site}`);
        scrapper = new TibetPostScrapper(TibetPostScrapper.getSiteUrl());
        break;
      default:
        break;
    }

    if (scrapper) {
      let tempArticles: Article[] = await scrapper.initiate();
      articles = articles.concat(tempArticles);
    } else {
      console.log(`Unable to find the supported site: ${site}`);
    }
  }

  return articles;
}
