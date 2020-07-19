import { PhayulScraper } from './scraper/phayul/phayul-scraper';
import { Scraper } from './scraper/scraper';
import dotenv from 'dotenv';
import express from 'express';
import mongoose, { Connection } from 'mongoose';
import Article, { IArticle } from './models/article';
import { TibetPostScraper } from './scraper/tibet-post/tibet-post-scraper';
import { Util } from './util';

const supportedNewsSites: string[] = [
  PhayulScraper.site,
  TibetPostScraper.site,
];

dotenv.config();
const port: any = process.env.PORT || 3000;
const dbUri: any = process.env.ATLAS_URI;
const app: express.Application = express();
mongoose.connect(dbUri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});
const connection: Connection = mongoose.connection;
connection.once('open', () => {
  console.info('MongoDB database connection established successfully.');
});

app.get('/api/articles', async function (req, res) {
  console.info('GET /articles');
  getArticles(req.query)
    .then((articles) => res.json(articles))
    .catch((error) => {
      console.error(`Error getting articles: ${error}`);
      res.status(500).json(error);
    });
});

app.get('/api/scrape-articles/:newsSite', function (req, res) {
  let newsSites: string[] = [];
  if ('all' === req.params.newsSite) {
    newsSites = supportedNewsSites;
  } else if (supportedNewsSites.includes(req.params.newsSite)) {
    newsSites.push(req.params.newsSite);
  } else {
    throw new Error(
      "param 'newsSite' is not part of the supported news sites."
    );
  }

  scrapeSites(newsSites)
    .then((articles) => {
      res.json(
        `${articles.length} Articles scraped and ${
          articles.filter((article) => !article.isNew).length
        } Articles added to DB.`
      );
    })
    .catch((error) => {
      throw new Error(`Error scraping articles: ${error}`);
    });
});

app.get('/api/', async function (req, res) {
  const apiEndpoints: any = [
    {
      Endpoint: '/articles',
      Description: 'Get list of articles',
    },
    {
      Endpoint: '/scrape-articles/<newsSite>',
      Description:
        "Trigger scraper to get articles from the newsSite. You can pass in 'all' as the path param to scrape all sites.",
    },
  ];
  res.json(apiEndpoints);
});

app.listen(port, function () {
  console.info('BhoeJa ☕️ app server is listening on localhost:3000.');
  console.info('Make API requests on http://localhost:3000/api/');
});

/**
 * Scrape supported news sites.
 * @param sites array of supported sites to scrape
 */
async function scrapeSites(sites: string[]): Promise<IArticle[]> {
  let articlesPromises: Promise<IArticle[]>[] = [];
  sites.forEach((site) => {
    let scraper: Scraper | undefined;
    switch (site) {
      case PhayulScraper.site:
        scraper = new PhayulScraper(PhayulScraper.getSiteUrl());
        break;
      case TibetPostScraper.site:
        scraper = new TibetPostScraper(TibetPostScraper.getSiteUrl());
        break;
      default:
        break;
    }

    if (scraper) {
      articlesPromises.push(scraper.initiate());
    } else {
      console.error(`Unable to find the supported site: ${site}`);
      articlesPromises.push(Promise.all([]));
    }
  });
  return Promise.all(articlesPromises).then((articles) => {
    return ([] as IArticle[]).concat(...articles);
  });
}

/**
 * Get articles from the DB.
 * @param query default query if not passed in date[$gte]=2020-07-01&limit=10
 */
async function getArticles(query: any): Promise<IArticle[]> {
  if (!query.date) {
    query.date = { $gte: Util.getDate(-3).toISOString() };
  }
  if (!query.limit) {
    query.limit = 10;
  }

  console.log(query);
  return Article.find({ date: query.date }).exec();
}
