import mongoose, { Schema, Document } from "mongoose";

export interface IRecipe extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  ingredients: string[];
  steps: string[];
  images: string[];
  author: mongoose.Types.ObjectId;
  category?: string;
  difficulty: "easy" | "medium" | "hard";
  scrappedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const RecipeSchema = new Schema<IRecipe>(
  {
    title: { type: String, required: true },
    description: { type: String },
    ingredients: [{ type: String }],
    steps: [{ type: String }],
    images: [{ type: String }],
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    scrappedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const Recipe = mongoose.model<IRecipe>("Recipe", RecipeSchema);
