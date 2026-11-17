import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  type: "daily" | "recipe" | "knowhow" | "instagram";
  title?: string;
  content: string;
  images: string[];
  author: mongoose.Types.ObjectId;
  likedBy: mongoose.Types.ObjectId[];
  commentCount: number;
  createdAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    type: { type: String, enum: ["daily", "recipe", "knowhow", "instagram"], required: true },
    title: { type: String },
    content: { type: String, required: true },
    images: [{ type: String }],
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    commentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Post = mongoose.model<IPost>("Post", PostSchema);
