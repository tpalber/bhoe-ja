import { PhayulScraper } from './scraper/phayul/phayul-scraper';
import { Scraper } from './scraper/scraper';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as mongoose from 'mongoose';
import { Connection } from 'mongoose';
import { schedule } from 'node-cron';
import Article, { IArticle } from './models/article';
import { TibetPostScraper } from './scraper/tibet-post/tibet-post-scraper';
import { TibetTimesScraper } from './scraper/tibet-times/tibet-times-scraper';
import { VOTScraper } from './scraper/vot/vot-scraper';
import { RFAScraper } from './scraper/rfa/rfa-scraper';
import Video, { IVideo } from './models/video';
import { YoutubeScraper } from './scraper/youtube-scraper';

let supportedNewsSites: string[] = [
  PhayulScraper.site,
  RFAScraper.site,
  TibetPostScraper.site,
  TibetTimesScraper.site,
  VOTScraper.site,
];

appStartup();

/**
 * App startup.
 * - Get environment variables defined in .env file
 * - Connect to MongoDB
 * - Create a Express web server
 * - Schedule a cron job to run the scraper every 30 mins
 */
function appStartup(): void {
  environmentVariablesConfig();
  const port: any = process.env.PORT || 3000;
  const dbUri: any = process.env.ATLAS_URI || 'Unable to find Atlas URL';

  mongoose.connect(dbUri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  });
  const dbConn: Connection = mongoose.connection;
  dbConn.once('open', () => {
    console.info('MongoDB database connection established successfully.');
  });

  const app: express.Application = express();
  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  initializeAppRoutes(app);
  app.listen(port, function () {
    console.info(`Bhoe Ja ☕️ app server is listening on localhost:${port}`);
    console.info(`Make API requests on http://localhost:${port}/api/`);
  });

  // Schedule article scraper to run every 30 mins
  schedule('*/30 * * * *', function () {
    console.info(`Running scraper from scheduled job: ${new Date()}`);
    scrapeSites(supportedNewsSites).then((articles) => {
      console.info(
        `${articles.length} Articles scraped and ${
          articles.filter((article) => !article.isNew).length
        } Article(s) added to DB.`
      );
    });
  });

  // Schedule video scraper to run every 60 mins
  schedule('*/60 * * * *', function () {
    console.info(`Running video scraper from scheduled job: ${new Date()}`);
    scrapeVideos().then((videos) => {
      console.info(
        `${videos.length} Videos scraped and ${
          videos.filter((video) => !video.isNew).length
        } Video(s) added to DB.`
      );
    });
  });
}

function environmentVariablesConfig(): void {
  dotenv.config();
  let path;
  switch (process.env.NODE_ENV) {
    case 'production':
      path = './server/.env.production';
      break;
    default:
      path = './server/.env';
  }
  dotenv.config({ path: path });
}

function initializeAppRoutes(app: express.Application): void {
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

  app.get('/api/videos', async function (req, res) {
    console.info('GET /videos');
    getVideos(req.query)
      .then((videos) => res.json(videos))
      .catch((error) => {
        console.error(`Error getting videos: ${error}`);
        res.status(500).json(error);
      });
  });

  app.get('/api/scrape-videos', function (req, res) {
    scrapeVideos()
      .then((videos) => {
        res.json(
          `${videos.length} Videos scraped and ${
            videos.filter((video) => !video.isNew).length
          } Videos added to DB.`
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
          "Triggers scraper to get articles from the newsSite. You can pass in 'all' as the path param to scrape all sites.",
      },
      {
        Endpoint: '/scrape-videos',
        Description:
          'Triggers scraper to get videos from all supported Youtube Channels.',
      },
    ];
    res.json(apiEndpoints);
  });
}

/**
 * Scrape supported news sites.
 * @param sites array of supported sites to scrape
 */
async function scrapeSites(sites: string[]): Promise<IArticle[]> {
  let articlesPromises: Promise<IArticle[]>[] = [];
  sites.forEach((site) => {
    let scrapers: Scraper[] | undefined;
    switch (site) {
      case PhayulScraper.site:
        scrapers = [new PhayulScraper()];
        break;
      case RFAScraper.site:
        scrapers = [new RFAScraper()];
        break;
      case TibetPostScraper.site:
        scrapers = [
          new TibetPostScraper(TibetPostScraper.getExileSiteUrl()),
          new TibetPostScraper(TibetPostScraper.getInternationalSiteUrl()),
          new TibetPostScraper(TibetPostScraper.getTibetSiteUrl()),
        ];
        break;
      case TibetTimesScraper.site:
        scrapers = [new TibetTimesScraper()];
        break;
      case VOTScraper.site:
        scrapers = [new VOTScraper()];
        break;
      default:
        break;
    }

    if (scrapers && scrapers.length > 0) {
      scrapers.forEach((scraper) =>
        articlesPromises.push(scraper.scrapeArticles())
      );
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
 * Scrape supported news sites.
 * @param sites array of supported sites to scrape
 */
async function scrapeVideos(): Promise<IVideo[]> {
  if (!process.env.GOOGLE_API_KEY) {
    return Promise.reject('Google API Key not specified in the .env file.');
  }

  let videosPromises: Promise<IVideo[]>[] = [];
  for (const channel of YoutubeScraper.supportedYoutubeChannels) {
    let scraper: YoutubeScraper = new YoutubeScraper(
      process.env.GOOGLE_API_KEY,
      channel.id,
      channel.name
    );
    videosPromises.push(scraper.scrapeVideos());
  }
  return Promise.all(videosPromises).then((videos) => {
    return ([] as IVideo[]).concat(...videos);
  });
}

/**
 * Get 10 articles from the DB, that's ordered by date. Default offset is 0 if not specified.
 * @param query
 * query examples:
 * date[$gte]=2020-07-01
 * date[$lte]=2020-07-10
 */
async function getArticles(query: any): Promise<IArticle[]> {
  console.debug(query);
  let offset: number = parseInt(query.offset);
  if (isNaN(offset)) {
    offset = 0;
  }
  if (query.offset) {
    delete query.offset;
  }

  return Article.find(query)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(10)
    .select('title source link date description')
    .exec();
}

/**
 * Get 10 subscribed videos from Youtube API, that's ordered by date. Default offset is 0 if not specified.
 * @param query
 * query examples:
 * date[$gte]=2020-07-01
 * date[$lte]=2020-07-10
 */
async function getVideos(query: any): Promise<IVideo[]> {
  console.debug(query);
  let offset: number = parseInt(query.offset);
  if (isNaN(offset)) {
    offset = 0;
  }
  if (query.offset) {
    delete query.offset;
  }

  return Video.find(query)
    .sort({ date: -1 })
    .skip(offset)
    .limit(5)
    .select('title source videoID date thumbnailBig description')
    .exec();
}
