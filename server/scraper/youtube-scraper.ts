import axios from 'axios';
import Video, { IVideo } from '../models/video';
import { Util } from '../util';

export class YoutubeScraper {
  public static supportedYoutubeChannels: { name: string; id: string }[] = [
    { name: 'TibetTV', id: 'UCQG1iEjZPBw9m4HSZgyVoUg' },
    { name: 'VOA Tibetan', id: 'UC2UlA4pbz0AYXXHba7cbu0Q' },
  ];

  private url: string;
  private channelName: string;

  constructor(apiKey: string, channelID: string, channelName: string) {
    this.url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelID}&part=snippet,id&order=date&maxResults=5`;
    this.channelName = channelName;
  }

  public async scrapeVideos(): Promise<IVideo[]> {
    return axios
      .get(this.url)
      .then(async (response) => {
        return this.getVideos(response.data)
          .then((videos: IVideo[]) => {
            let savedVideos: Promise<IVideo>[] = [];
            videos.forEach((video) => {
              savedVideos.push(
                video.save().catch((error: any) => {
                  // Ignore E11000 duplicate key error index
                  if (error.code && error.code !== 11000) {
                    console.error(`Failed to save Videos: ${error}`);
                  }
                  return video;
                })
              );
            });

            return Promise.all(savedVideos);
          })
          .catch((error: any) => {
            throw error;
          });
      })
      .catch((error: any) => {
        console.error(`Error getting videos from ${this.url} ${error}`);
        return Promise.all([]);
      });
  }

  private async getVideos(data: any): Promise<IVideo[]> {
    if (!data || !data.items) {
      console.error(data);
      return Promise.reject('Invalid response');
    }

    const videos: IVideo[] = [];
    for (const item of data.items) {
      console.log(item);
      if (!item.id || !item.snippet) {
        continue;
      }

      let video: IVideo = new Video({
        title: item.snippet?.title,
        source: this.channelName,
        videoID: item.id?.videoId,
        date: item.snippet?.publishedAt || Util.getCurrentDate(),
        thumbnail: item.snippet?.thumbnails?.default?.url,
        thumbnailBig: item.snippet?.thumbnails?.medium?.url,
        description: item.snippet?.description || '',
      });
      videos.push(video);
    }

    console.info(
      `***** Number of ${this.channelName} videos: ${videos.length}`
    );
    return Promise.all(videos);
  }
}
