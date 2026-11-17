import mongoose, { Schema, Document } from "mongoose";

export interface ISponsor extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  logo?: string;
  bannerImage?: string;
  description?: string;
  website?: string;
  isMonthly: boolean;
}

const SponsorSchema = new Schema<ISponsor>(
  {
    name: { type: String, required: true },
    logo: { type: String },
    bannerImage: { type: String },
    description: { type: String },
    website: { type: String },
    isMonthly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Sponsor = mongoose.model<ISponsor>("Sponsor", SponsorSchema);
