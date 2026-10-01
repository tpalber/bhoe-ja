import type { Article, SearchFilters, Video } from '../types';

function buildParams(
  offset: number,
  filters: SearchFilters,
  extra?: Record<string, string>
): string {
  const params = new URLSearchParams();
  params.set('offset', offset.toString());
  if (filters.startDate) {
    params.set('date[$gte]', filters.startDate.toISOString());
  }
  if (filters.endDate) {
    params.set('date[$lte]', filters.endDate.toISOString());
  }
  if (filters.searchValue) {
    params.set('title[$regex]', filters.searchValue);
    params.set('title[$options]', 'i');
  }
  if (filters.sources && filters.sources.length > 0) {
    params.set('source', JSON.stringify(filters.sources));
  }
  if (extra) {
    for (const [k, v] of Object.entries(extra)) params.set(k, v);
  }
  return params.toString();
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export function fetchArticles(
  offset: number,
  inTibetan: boolean,
  filters: SearchFilters
): Promise<Article[]> {
  const qs = buildParams(offset, filters, {
    inTibetan: inTibetan ? 'true' : 'false',
  });
  return get<Article[]>(`/api/articles?${qs}`);
}

export function fetchVideos(
  offset: number,
  filters: SearchFilters
): Promise<Video[]> {
  const qs = buildParams(offset, filters);
  return get<Video[]>(`/api/videos?${qs}`);
}
