import * as mongoose from 'mongoose';
import { Schema, Document, Model } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  source: string;
  link: string;
  date: Date;
  description?: string;
}

const articleSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    source: { type: String, required: true, trim: true },
    link: { type: String, required: true, trim: true, unique: true },
    date: { type: Date, required: true },
    description: { type: String, required: false, trim: true },
  },
  {
    timestamps: true,
  }
);

const Article: Model<IArticle> = mongoose.model<IArticle>(
  'Article',
  articleSchema
);
export default Article;
