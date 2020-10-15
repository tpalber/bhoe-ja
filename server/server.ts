import { PhayulScraper } from './scraper/phayul/phayul-scraper';
import { Scraper } from './scraper/scraper';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as mongoose from 'mongoose';
import { Connection } from 'mongoose';
import Article, { IArticle } from './models/article';
import Video, { IVideo } from './models/video';
import { TibetPostScraper } from './scraper/tibet-post/tibet-post-scraper';
import { TibetTimesScraper } from './scraper/tibet-times/tibet-times-scraper';
import { VOTScraper } from './scraper/vot/vot-scraper';
import { RFAScraper } from './scraper/rfa/rfa-scraper';
import { YoutubeScraper } from './scraper/youtube-scraper';
import { TibetSunScraper } from './scraper/tibet-sun/tibet-sun-scraper';
import { CTAScraper } from './scraper/cta/cta-scraper';
import { FreeTibetScraper } from './scraper/free-tibet/free-tibet-scraper';
import { ShambalaScraper } from './scraper/shambala/shambala-scraper';

let supportedNewsSites: string[] = [
  CTAScraper.site,
  FreeTibetScraper.site,
  PhayulScraper.site,
  RFAScraper.site,
  ShambalaScraper.site,
  TibetPostScraper.site,
  TibetSunScraper.site,
  TibetTimesScraper.site,
  VOTScraper.site,
];

appStartup();

/**
 * App startup.
 * - Get environment variables defined in .env file
 * - Connect to MongoDB
 * - Create a Express web server
 * - Schedule a cron job to run the article scraper every hour
 * - Schedule a cron job to run the video scraper every 2 hours
 */
function appStartup(): void {
  environmentVariablesConfig();
  const port: any = process.env.PORT || 3000;
  const uiPort: any = process.env.UI_PORT || 4200;
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
  app.use(function (req: any, res: any, next: any) {
    res.header('Access-Control-Allow-Origin', `http://localhost:${uiPort}`);
    next();
  });
  initializeAppRoutes(app);
  app.listen(port, function () {
    console.info(
      `Bhoe Ja ☕️ app server is listening on http://localhost:${port}`
    );
    console.info(`Make API requests on http://localhost:${port}/api`);
  });
}

function environmentVariablesConfig(): void {
  // .env file might be in the current folder or server folder depending on where the app is started from
  dotenv.config({ path: './server/.env' });
  dotenv.config();
}

function initializeAppRoutes(app: express.Application): void {
  app.get('/api/articles', async function (req: any, res: any) {
    console.info('GET /articles');
    getArticles(req.query)
      .then((articles) => res.json(articles))
      .catch((error) => {
        console.error(`Error getting articles: ${error}`);
        res.status(500).json(error);
      });
  });

  app.get('/api/scrape-articles/:newsSite', function (req: any, res: any) {
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
            articles.filter((article: IArticle) => !article.isNew).length
          } Articles added to DB.`
        );
      })
      .catch((error) => {
        throw new Error(`Error scraping articles: ${error}`);
      });
  });

  app.get('/api/videos', async function (req: any, res: any) {
    console.info('GET /videos');
    getVideos(req.query)
      .then((videos) => res.json(videos))
      .catch((error) => {
        console.error(`Error getting videos: ${error}`);
        res.status(500).json(error);
      });
  });

  app.get('/api/scrape-videos', function (req: any, res: any) {
    scrapeVideos()
      .then((videos) => {
        res.json(
          `${videos.length} Videos scraped and ${
            videos.filter((video: IVideo) => !video.isNew).length
          } Videos added to DB.`
        );
      })
      .catch((error) => {
        throw new Error(`Error scraping articles: ${error}`);
      });
  });

  app.get('/api/', async function (req: any, res: any) {
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

  // ---- SERVE STATIC FILES ---- //
  app.get('*', express.static('build/bhoeja', { maxAge: '1y' }));
  app.get('*', (req: any, res: any) => {
    res.status(200).sendFile(`/`, { root: 'build/bhoeja' });
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
      case CTAScraper.site:
        scrapers = [new CTAScraper()];
        break;
      case FreeTibetScraper.site:
        scrapers = [new FreeTibetScraper()];
        break;
      case PhayulScraper.site:
        scrapers = [new PhayulScraper()];
        break;
      case RFAScraper.site:
        scrapers = [
          new RFAScraper(RFAScraper.getSiteUrl()),
          new RFAScraper(RFAScraper.getTibetanSiteUrl(), true),
        ];
        break;
      case ShambalaScraper.site:
        scrapers = [
          new ShambalaScraper(ShambalaScraper.getSiteUrl()),
          new ShambalaScraper(ShambalaScraper.getExileSiteUrl()),
          new ShambalaScraper(ShambalaScraper.getInternationalSiteUrl()),
          new ShambalaScraper(ShambalaScraper.getTibetSiteUrl()),
        ];
        break;
      case TibetPostScraper.site:
        scrapers = [
          new TibetPostScraper(TibetPostScraper.getExileSiteUrl()),
          new TibetPostScraper(TibetPostScraper.getInternationalSiteUrl()),
          new TibetPostScraper(TibetPostScraper.getTibetSiteUrl()),
        ];
        break;
      case TibetSunScraper.site:
        scrapers = [new TibetSunScraper()];
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
  if (!query.inTibetan || query?.inTibetan === 'false') {
    query.$or = [{ inTibetan: { $exists: false } }, { inTibetan: false }];
    delete query.inTibetan;
  }
  let offset: number = parseInt(query.offset);
  if (isNaN(offset)) {
    offset = 0;
  }
  if (query.offset) {
    delete query.offset;
  }
  if (query.source) {
    let sources: string[] = JSON.parse(query.source);
    query.source = { $in: sources };
  }

  return Article.find(query)
    .sort({ date: -1 })
    .skip(offset)
    .limit(10)
    .select('title source link date description')
    .exec();
}

/**
 * Get latest 6 videos from the DB, that's ordered by date. Default offset is 0 if not specified.
 * @param query
 * query examples:
 * date[$gte]=2020-07-01
 * date[$lte]=2020-07-10
 */
async function getVideos(query: any): Promise<IVideo[]> {
  let offset: number = parseInt(query.offset);
  if (isNaN(offset)) {
    offset = 0;
  }
  if (query.offset) {
    delete query.offset;
  }
  if (query.source) {
    let sources: string[] = JSON.parse(query.source);
    query.source = { $in: sources };
  }

  return Video.find(query)
    .sort({ date: -1 })
    .skip(offset)
    .limit(6)
    .select('title source videoID date thumbnailBig description')
    .exec();
}
