import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IDailySummarySource {
  index: number;
  article: Types.ObjectId;
  title: string;
  site: string;
  link: string;
}

export interface IDailySummary extends Document {
  overview: string;
  sources: IDailySummarySource[];
  articleIds: Types.ObjectId[];
  articleCount: number;
  generatedAt: Date;
  windowStart: Date;
  windowEnd: Date;
}

const DailySummarySourceSchema: Schema = new mongoose.Schema(
  {
    index: { type: Number, required: true },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    site: { type: String, required: true, trim: true },
    link: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const DailySummarySchema: Schema = new mongoose.Schema(
  {
    overview: { type: String, required: true, trim: true },
    sources: { type: [DailySummarySourceSchema], required: true },
    articleIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
      required: true,
      default: [],
    },
    articleCount: { type: Number, required: true, default: 0 },
    generatedAt: { type: Date, required: true, default: Date.now },
    windowStart: { type: Date, required: true },
    windowEnd: { type: Date, required: true },
  },
  { collection: 'daily_summaries', timestamps: true }
);

const DailySummary: Model<IDailySummary> =
  mongoose.models.DailySummary ||
  mongoose.model<IDailySummary>('DailySummary', DailySummarySchema);

export default DailySummary;
