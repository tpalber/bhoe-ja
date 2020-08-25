import * as mongoose from 'mongoose';
import { Schema, Document, Model } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  source: string;
  videoID: string;
  date: Date;
  thumbnail?: string;
  thumbnailBig?: string;
  description?: string;
}

const videoSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    source: { type: String, required: true, trim: true },
    videoID: { type: String, required: true, trim: true, unique: true },
    date: { type: Date, required: true },
    thumbnail: { type: String, required: false, trim: true },
    thumbnailBig: { type: String, required: false, trim: true },
    description: { type: String, required: false, trim: true },
  },
  {
    timestamps: true,
  }
);

const Video: Model<IVideo> = mongoose.model<IVideo>('Video', videoSchema);
export default Video;
