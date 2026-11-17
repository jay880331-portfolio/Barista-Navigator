import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email?: string;
  password?: string;
  name: string;
  phone?: string;
  profileImage?: string;
  role: "barista" | "coffee_lover";
  provider: "email" | "kakao" | "naver";
  providerId?: string;
  isActive: boolean;
  skills: string[];
  bio?: string;
  location?: string;
  lat?: number;
  lng?: number;
  scrappedRecipes: mongoose.Types.ObjectId[];
  createdAt: Date;

  // 바리스타 프로필 확장 필드
  userId?: string;          // 닉네임
  snsUrl1?: string;         // 인스타그램 주소
  snsUrl2?: string;         // 스레드 주소
  snsUrl3?: string;         // 유튜브 주소
  storeName?: string;       // 현재 소속 매장명
  storeAddress?: string;    // 매장 상세 주소
  workType?: string;        // 근무 형태
  careerYears?: string;     // 총 경력 기간
  mainSkill: string[];      // 주력 전문 분야
  certifications: string[]; // 보유 자격
  awardRecords?: string;    // 수상 내역
  eqMachine?: string;       // 에스프레소 머신 브랜드
  eqGrinder?: string;       // 그라인더 브랜드
  eqRoasting?: string;      // 로스팅 장비 브랜드
  bean?: string;            // 선호하는 원두
  beanTaste: string[];      // 선호하는 원두 뉘앙스

  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, sparse: true },
    password: { type: String },
    name: { type: String, required: true },
    phone: { type: String },
    profileImage: { type: String },
    role: { type: String, enum: ["barista", "coffee_lover"], default: "coffee_lover" },
    provider: { type: String, enum: ["email", "kakao", "naver"], default: "email" },
    providerId: { type: String },
    isActive: { type: Boolean, default: false },
    skills: [{ type: String }],
    bio: { type: String },
    location: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    scrappedRecipes: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],

    // 바리스타 프로필 확장 필드
    userId: { type: String, sparse: true },
    snsUrl1: { type: String },
    snsUrl2: { type: String },
    snsUrl3: { type: String },
    storeName: { type: String },
    storeAddress: { type: String },
    workType: { type: String },
    careerYears: { type: String },
    mainSkill: [{ type: String }],
    certifications: [{ type: String }],
    awardRecords: { type: String },
    eqMachine: { type: String },
    eqGrinder: { type: String },
    eqRoasting: { type: String },
    bean: { type: String },
    beanTaste: [{ type: String }],
  },
  { timestamps: true }
);

UserSchema.pre("save", async function () {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.model<IUser>("User", UserSchema);
