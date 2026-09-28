export enum SourceType {
  Article = 'article',
  Video = 'video',
}

export interface Source {
  name: string;
  url: string;
  type: SourceType;
}

// Kept identical to the Angular app's source listing.
export const sourceListing: Source[] = [
  { name: 'CTA', url: 'https://tibet.net/', type: SourceType.Article },
  { name: 'Free Tibet', url: 'https://freetibet.org/', type: SourceType.Article },
  { name: 'Phayul', url: 'https://www.phayul.com/', type: SourceType.Article },
  {
    name: 'Radio Free Asia',
    url: 'https://www.rfa.org/english/news/tibet',
    type: SourceType.Article,
  },
  {
    name: 'Shambala',
    url: 'http://www.shambalanews.com/',
    type: SourceType.Article,
  },
  {
    name: 'Tibet Post',
    url: 'http://www.thetibetpost.com/en/',
    type: SourceType.Article,
  },
  { name: 'Tibet Sun', url: 'https://www.tibetsun.com/', type: SourceType.Article },
  { name: 'Tibet Times', url: 'http://tibettimes.net/', type: SourceType.Article },
  { name: 'Voice Of Tibet', url: 'https://vot.org/', type: SourceType.Article },
  {
    name: 'Dalai Lama',
    url: 'https://www.youtube.com/channel/UCiPJ_g02LuOgOG0ZNk5j1jA',
    type: SourceType.Video,
  },
  {
    name: 'RFATibetan',
    url: 'https://www.youtube.com/channel/UCmAs3jM0KZLwsglmaVMwvMg',
    type: SourceType.Video,
  },
  {
    name: 'TibetTV',
    url: 'https://www.youtube.com/channel/UCQG1iEjZPBw9m4HSZgyVoUg',
    type: SourceType.Video,
  },
];

export const articleSourceNames = sourceListing
  .filter((s) => s.type === SourceType.Article)
  .map((s) => s.name);

export const videoSourceNames = sourceListing
  .filter((s) => s.type === SourceType.Video)
  .map((s) => s.name);
