import mongoose, { Schema, Document } from "mongoose";

export interface IPhoneVerification extends Document {
  phone: string;
  code: string;
  token?: string;
  isVerified: boolean;
  expiresAt: Date;
}

const PhoneVerificationSchema = new Schema<IPhoneVerification>({
  phone: { type: String, required: true },
  code: { type: String, required: true },
  token: { type: String },
  isVerified: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
});

PhoneVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PhoneVerification = mongoose.model<IPhoneVerification>(
  "PhoneVerification",
  PhoneVerificationSchema
);
