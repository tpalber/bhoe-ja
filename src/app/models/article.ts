export interface Article {
  _id: string;
  title: string;
  source: string;
  link: string;
  date: string;
  description?: string;

  bookmarked?: boolean;
}
