import mongoose, { Schema, Document } from "mongoose";

export interface IMarketItem extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  price: number;
  category?: string;
  images: string[];
  seller: mongoose.Types.ObjectId;
  isSold: boolean;
  createdAt: Date;
}

const MarketItemSchema = new Schema<IMarketItem>(
  {
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String },
    images: [{ type: String }],
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isSold: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const MarketItem = mongoose.model<IMarketItem>("MarketItem", MarketItemSchema);
