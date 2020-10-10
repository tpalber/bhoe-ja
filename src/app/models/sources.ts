export interface Source {
  name: string;
  url: string;
  type: SourceType;
}

export enum SourceType {
  article,
  video,
}

export let sourceListing: Source[] = [
  { name: 'CTA', url: 'https://tibet.net/', type: SourceType.article },
  {
    name: 'Free Tibet',
    url: 'https://freetibet.org/',
    type: SourceType.article,
  },
  { name: 'Phayul', url: 'https://www.phayul.com/', type: SourceType.article },
  {
    name: 'Radio Free Asia',
    url: 'https://www.rfa.org/english/news/tibet',
    type: SourceType.article,
  },
  {
    name: 'Shambala',
    url: 'http://www.shambalanews.com/',
    type: SourceType.article,
  },
  {
    name: 'Tibet Post',
    url: 'http://www.thetibetpost.com/en/',
    type: SourceType.article,
  },
  {
    name: 'Tibet Sun',
    url: 'https://www.tibetsun.com/',
    type: SourceType.article,
  },
  {
    name: 'Tibet Times',
    url: 'http://tibettimes.net/',
    type: SourceType.article,
  },
  { name: 'Voice Of Tibet', url: 'https://vot.org/', type: SourceType.article },
  {
    name: 'Dalai Lama',
    url: 'https://www.youtube.com/channel/UCiPJ_g02LuOgOG0ZNk5j1jA',
    type: SourceType.video,
  },
  {
    name: 'RFATibetan',
    url: 'https://www.youtube.com/channel/UCmAs3jM0KZLwsglmaVMwvMg',
    type: SourceType.video,
  },
  {
    name: 'TibetTV',
    url: 'https://www.youtube.com/channel/UCQG1iEjZPBw9m4HSZgyVoUg',
    type: SourceType.video,
  },
  {
    name: 'VOA Tibetan',
    url: 'https://www.youtube.com/channel/UC2UlA4pbz0AYXXHba7cbu0Q',
    type: SourceType.video,
  },
  {
    name: 'Voice of Tibet',
    url: 'https://www.youtube.com/channel/UCYg4JtszcCx83UTR-wObgFg',
    type: SourceType.video,
  },
  {
    name: 'སྤྱི་ནོར་ྋགོང་ས་ྋསྐྱབས་མགོན་ཆེན་པོ་མཆོག',
    url: 'https://www.youtube.com/channel/UCprjZGYXe2TPAd2LydWhk8A',
    type: SourceType.video,
  },
];
