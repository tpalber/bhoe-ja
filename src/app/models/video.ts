export interface Video {
  _id: string;
  title: string;
  source: string;
  videoID: string;
  date: Date;
  thumbnail?: string;
  thumbnailBig?: string;
  description?: string;

  bookmarked?: boolean;
}
