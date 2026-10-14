export interface Article {
  _id: string;
  title: string;
  source: string;
  link: string;
  date: string;
  description?: string;
}

export interface DailyOverviewSource {
  index: number;
  articleId: string;
  title: string;
  site: string;
  link: string;
}

export interface DailyOverview {
  overview: string;
  sources: DailyOverviewSource[];
  articleCount: number;
  generatedAt: string;
  windowStart: string;
  windowEnd: string;
  windowHours: number;
}

export interface Video {
  _id: string;
  title: string;
  source: string;
  videoID: string;
  date: string;
  thumbnail?: string;
  thumbnailBig?: string;
  description?: string;
}

export interface Bookmark {
  _id: string;
  title: string;
  source: string;
  link: string;
  date: string;
  isVideo: boolean;
  description?: string;
  thumbnailBig?: string;
}

export interface SearchFilters {
  startDate?: Date;
  endDate?: Date;
  searchValue?: string;
  sources?: string[];
}

export const EMPTY_FILTERS: SearchFilters = {
  startDate: undefined,
  endDate: undefined,
  searchValue: undefined,
  sources: undefined,
};

export function filtersAreEmpty(f: SearchFilters): boolean {
  return (
    !f.startDate &&
    !f.endDate &&
    !f.searchValue &&
    (!f.sources || f.sources.length === 0)
  );
}
