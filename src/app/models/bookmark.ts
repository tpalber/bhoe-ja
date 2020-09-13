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
