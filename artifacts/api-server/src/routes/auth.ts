import { Router, type IRouter } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User.js";
import { PhoneVerification } from "../models/PhoneVerification.js";
import { authMiddleware, type AuthRequest } from "../middleware/auth.js";
import { logger } from "../lib/logger.js";
import { sendVerificationSMS } from "../lib/sms.js";

const router: IRouter = Router();

// ─────────────────────────────────────────────
// Kakao OAuth 2.0 helpers
// ─────────────────────────────────────────────

interface KakaoTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope?: string;
  error?: string;
  error_description?: string;
}

interface KakaoUserProfile {
  id: number;
  connected_at?: string;
  properties?: {
    nickname?: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
  kakao_account?: {
    profile_nickname_needs_agreement?: boolean;
    profile_image_needs_agreement?: boolean;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
      thumbnail_image_url?: string;
    };
    email_needs_agreement?: boolean;
    email?: string;
  };
}

// ─────────────────────────────────────────────
// Naver OAuth 2.0 helpers
// ─────────────────────────────────────────────

interface NaverTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  error?: string;
  error_description?: string;
}

interface NaverUserProfile {
  resultcode: string;
  message: string;
  response: {
    id: string;
    nickname?: string;
    name?: string;
    email?: string;
    profile_image?: string;
    age?: string;
    birthday?: string;
    gender?: string;
  };
}

/**
 * GET /auth/kakao
 * Redirects to the Kakao OAuth authorization URL.
 * After user authorizes, Kakao redirects to /auth/kakao/callback with ?code=xxx&state=xxx
 */
router.get("/kakao", (_req, res) => {
  const clientId = process.env["KAKAO_CLIENT_ID"];
  const redirectUri = encodeURIComponent(process.env["KAKAO_REDIRECT_URI"]!);

  if (!clientId) {
    res.status(500).json({ message: "KAKAO_CLIENT_ID is not configured." });
    return;
  }

  // Generate state to prevent CSRF
  const state = crypto.randomBytes(16).toString("hex");
  // Note: account_email requires business verification. Using only basic profile scopes.
  const scopes = "profile_nickname profile_image";
  const authUrl =
    `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${clientId}` +
    `&redirect_uri=${redirectUri}&state=${state}&scope=${encodeURIComponent(scopes)}`;

  // Redirect directly to Kakao's authorization page
  res.redirect(authUrl);
});

/**
 * GET /auth/kakao/callback
 * Handles the OAuth callback from Kakao.
 * - Exchanges authorization code for access token
 * - Fetches user profile from Kakao
 * - Creates or finds user in DB
 * - Returns JWT
 */
router.get("/kakao/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!code || typeof code !== "string") {
    res.status(400).json({ message: "Authorization code is required." });
    return;
  }

  const clientId = process.env["KAKAO_CLIENT_ID"];
  const clientSecret = process.env["KAKAO_CLIENT_SECRET"];
  const redirectUri = process.env["KAKAO_REDIRECT_URI"];

  if (!clientId || !redirectUri) {
    logger.error("Kakao OAuth env vars missing");
    res
      .status(500)
      .json({ message: "Kakao OAuth is not configured on the server." });
    return;
  }

  try {
    // Step 1: Exchange authorization code for access token
    const tokenParams = new URLSearchParams();
    tokenParams.append("grant_type", "authorization_code");
    tokenParams.append("client_id", clientId);
    tokenParams.append("redirect_uri", redirectUri);
    tokenParams.append("code", code);
    if (clientSecret) {
      tokenParams.append("client_secret", clientSecret);
    }

    const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams.toString(),
    });

    const tokenData = (await tokenRes.json()) as KakaoTokenResponse;

    if (!tokenData.access_token || tokenData.error) {
      logger.error({ tokenData }, "Kakao token exchange failed");
      res.status(401).json({
        message: tokenData.error_description || "카카오 인증에 실패했습니다.",
      });
      return;
    }

    // Step 2: Fetch user profile using access token
    const profileRes = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = (await profileRes.json()) as KakaoUserProfile;

    if (!profile.id) {
      logger.error({ profile }, "Kakao user profile fetch failed");
      res
        .status(401)
        .json({ message: "카카오 사용자 정보를 가져오지 못했습니다." });
      return;
    }

    const kakaoId = profile.id.toString();
    const kakaoAccount = profile.kakao_account;
    const properties = profile.properties;

    // Extract user info from Kakao profile
    const nickname =
      kakaoAccount?.profile?.nickname ||
      properties?.nickname ||
      "카카오 사용자";
    const email = kakaoAccount?.email;
    const profileImage =
      kakaoAccount?.profile?.profile_image_url || properties?.profile_image;

    // Step 3: Find or create user
    const provider = "kakao";
    const providerId = `kakao_${kakaoId}`;

    let user = await User.findOne({ provider, providerId });

    logger.info(
      { provider, providerId, found: !!user },
      "Kakao OAuth user lookup",
    );

    if (!user) {
      // 새 사용자: SocialRegister 페이지로 리다이렉트
      const frontendUrl =
        process.env["FRONTEND_URL"] || "http://localhost:5173";
      const redirectUrl = new URL(`${frontendUrl}/register/social`);
      redirectUrl.searchParams.set("provider", provider);
      redirectUrl.searchParams.set("providerId", providerId);
      redirectUrl.searchParams.set("name", nickname);
      if (email) redirectUrl.searchParams.set("email", email);
      if (profileImage)
        redirectUrl.searchParams.set("profileImage", profileImage);
      res.redirect(redirectUrl.toString());
      return;
    }

    // Step 4: Return JWT — redirect to frontend with token
    const token = generateToken(user._id.toString());
    const frontendUrl = process.env["FRONTEND_URL"] || "http://localhost:5173";
    const userJson = encodeURIComponent(JSON.stringify(formatUser(user)));
    res.redirect(
      `${frontendUrl}/login?kakao_callback=1&token=${token}&user=${userJson}`,
    );
  } catch (err) {
    logger.error({ err }, "Kakao OAuth callback error");
    const frontendUrl = process.env["FRONTEND_URL"] || "http://localhost:5173";
    res.redirect(`${frontendUrl}/login?error=kakao_oauth_failed`);
  }
});

/**
 * GET /auth/naver
 * Redirects to the Naver OAuth authorization URL.
 * After user authorizes, Naver redirects to /auth/naver/callback with ?code=xxx&state=xxx
 */
router.get("/naver", (_req, res) => {
  const clientId = process.env["NAVER_CLIENT_ID"];
  const redirectUri = encodeURIComponent(process.env["NAVER_REDIRECT_URI"]!);

  if (!clientId) {
    res.status(500).json({ message: "NAVER_CLIENT_ID is not configured." });
    return;
  }

  // Generate state to prevent CSRF
  const state = crypto.randomBytes(16).toString("hex");
  const scopes = "nickname name email profile_image";
  const authUrl =
    `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}` +
    `&redirect_uri=${redirectUri}&state=${state}&scope=${encodeURIComponent(scopes)}`;

  // Redirect directly to Naver's authorization page
  res.redirect(authUrl);
});

/**
 * GET /auth/naver/callback
 * Handles the OAuth callback from Naver.
 * - Exchanges authorization code for access token
 * - Fetches user profile from Naver
 * - Creates or finds user in DB
 * - Returns JWT
 */
router.get("/naver/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!code || typeof code !== "string") {
    res.status(400).json({ message: "Authorization code is required." });
    return;
  }

  const clientId = process.env["NAVER_CLIENT_ID"];
  const clientSecret = process.env["NAVER_CLIENT_SECRET"];
  const redirectUri = process.env["NAVER_REDIRECT_URI"];

  if (!clientId || !clientSecret || !redirectUri) {
    logger.error("Naver OAuth env vars missing");
    res
      .status(500)
      .json({ message: "Naver OAuth is not configured on the server." });
    return;
  }

  try {
    // Step 1: Exchange authorization code for access token
    const tokenRes = await fetch(
      "https://nid.naver.com/oauth2.0/token?" +
        `grant_type=authorization_code&client_id=${clientId}&client_secret=${clientSecret}` +
        `&code=${code}&state=${state || ""}`,
      { method: "GET" },
    );

    const tokenData = (await tokenRes.json()) as NaverTokenResponse;

    if (!tokenData.access_token || tokenData.error) {
      logger.error({ tokenData }, "Naver token exchange failed");
      res.status(401).json({
        message: tokenData.error_description || "네이버 인증에 실패했습니다.",
      });
      return;
    }

    // Step 2: Fetch user profile using access token
    const profileRes = await fetch("https://openapi.naver.com/v1/nid/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = (await profileRes.json()) as NaverUserProfile;

    if (profile.resultcode !== "00" || !profile.response?.id) {
      logger.error({ profile }, "Naver user profile fetch failed");
      res
        .status(401)
        .json({ message: "네이버 사용자 정보를 가져오지 못했습니다." });
      return;
    }

    const {
      id: naverId,
      nickname,
      name,
      email,
      profile_image,
    } = profile.response;

    // Step 3: Find or create user
    const provider = "naver";
    const providerId = `naver_${naverId}`;

    let user = await User.findOne({ provider, providerId });

    logger.info(
      { provider, providerId, found: !!user },
      "Naver OAuth user lookup",
    );

    if (!user) {
      // 새 사용자: SocialRegister 페이지로 리다이렉트
      const frontendUrl =
        process.env["FRONTEND_URL"] || "http://localhost:5173";
      const redirectUrl = new URL(`${frontendUrl}/register/social`);
      redirectUrl.searchParams.set("provider", provider);
      redirectUrl.searchParams.set("providerId", providerId);
      redirectUrl.searchParams.set("name", name || nickname || "네이버 사용자");
      if (email) redirectUrl.searchParams.set("email", email);
      if (profile_image)
        redirectUrl.searchParams.set("profileImage", profile_image);
      res.redirect(redirectUrl.toString());
      return;
    }

    // Step 4: Return JWT — redirect to frontend with token
    const token = generateToken(user._id.toString());
    const frontendUrl = process.env["FRONTEND_URL"] || "http://localhost:5173";
    const userJson = encodeURIComponent(JSON.stringify(formatUser(user)));
    res.redirect(
      `${frontendUrl}/login?naver_callback=1&token=${token}&user=${userJson}`,
    );
  } catch (err) {
    logger.error({ err }, "Naver OAuth callback error");
    const frontendUrl = process.env["FRONTEND_URL"] || "http://localhost:5173";
    res.redirect(`${frontendUrl}/login?error=naver_oauth_failed`);
  }
});

function generateToken(userId: string): string {
  const secret = process.env["JWT_SECRET"]!;
  return jwt.sign({ userId }, secret, { expiresIn: "30d" });
}

function formatUser(user: InstanceType<typeof User>) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    phone: user.phone,
    profileImage: user.profileImage,
    role: user.role,
    provider: user.provider,
    isActive: user.isActive,
    skills: user.skills,
    bio: user.bio,
    location: user.location,
    createdAt: user.createdAt?.toISOString(),
    // 바리스타 확장 필드
    userId: user.userId,
    snsUrl1: user.snsUrl1,
    snsUrl2: user.snsUrl2,
    snsUrl3: user.snsUrl3,
    storeName: user.storeName,
    storeAddress: user.storeAddress,
    workType: user.workType,
    careerYears: user.careerYears,
    mainSkill: user.mainSkill,
    certifications: user.certifications,
    awardRecords: user.awardRecords,
    eqMachine: user.eqMachine,
    eqGrinder: user.eqGrinder,
    eqRoasting: user.eqRoasting,
    bean: user.bean,
    beanTaste: user.beanTaste,
  };
}

router.post("/verify-phone", async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    res.status(400).json({ message: "전화번호를 입력해주세요." });
    return;
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await PhoneVerification.deleteMany({ phone });
  await PhoneVerification.create({ phone, code, expiresAt, isVerified: false });

  let isRealSMS = false;
  try {
    isRealSMS = await sendVerificationSMS(phone, code);
  } catch (err) {
    logger.error({ err }, "SMS send error");
    res.status(500).json({
      message: "SMS 발송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    });
    return;
  }

  if (isRealSMS) {
    res.json({ success: true, message: "인증번호가 발송됐습니다." });
  } else {
    // 개발 모드: 코드를 응답에 포함
    res.json({
      success: true,
      message: `인증번호가 발송됐습니다. (개발모드: ${code})`,
    });
  }
});

router.post("/verify-phone/confirm", async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) {
    res.status(400).json({ message: "전화번호와 인증 코드를 입력해주세요." });
    return;
  }

  const verification = await PhoneVerification.findOne({
    phone,
    code,
    isVerified: false,
    expiresAt: { $gt: new Date() },
  });

  if (!verification) {
    res
      .status(400)
      .json({ message: "인증 코드가 올바르지 않거나 만료됐습니다." });
    return;
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");
  verification.isVerified = true;
  verification.token = verificationToken;
  await verification.save();

  res.json({ success: true, verificationToken });
});

router.post("/register", async (req, res) => {
  const {
    email,
    password,
    name,
    phone,
    phoneVerificationToken,
    role,
    // 바리스타 확장 필드
    userId,
    snsUrl1,
    snsUrl2,
    snsUrl3,
    storeName,
    storeAddress,
    workType,
    careerYears,
    mainSkill,
    certifications,
    awardRecords,
    eqMachine,
    eqGrinder,
    eqRoasting,
    bean,
    beanTaste,
    provider,
    providerId,
  } = req.body ?? {};

  const isSocial = provider === "naver" || provider === "kakao";

  if (!name) {
    res.status(400).json({ message: "이름은 필수 항목입니다." });
    return;
  }

  if (!isSocial && (!email || !password || !phone || !phoneVerificationToken)) {
    res.status(400).json({ message: "필수 항목을 모두 입력해주세요." });
    return;
  }

  if (isSocial && !providerId) {
    res.status(400).json({ message: "소셜 연동 정보가 부족합니다." });
    return;
  }

  // 개발용 페이크 번호 (000-0000-0000) 처리
  const FAKE_PHONE = "00000000000"; // 000-0000-0000
  const FAKE_TOKEN = "fake-verification-token-dev";

  if (!isSocial) {
    const isFakeVerification =
      phone.replace(/-/g, "") === FAKE_PHONE &&
      phoneVerificationToken === FAKE_TOKEN;

    if (!isFakeVerification) {
      const verification = await PhoneVerification.findOne({
        phone,
        token: phoneVerificationToken,
        isVerified: true,
      });

      if (!verification) {
        res
          .status(400)
          .json({ message: "전화번호 인증이 완료되지 않았습니다." });
        return;
      }

      await PhoneVerification.deleteOne({ _id: verification._id });
    }
  }

  const existingUser = email ? await User.findOne({ email }) : null;
  if (existingUser) {
    res.status(400).json({ message: "이미 사용 중인 이메일입니다." });
    return;
  }

  if (userId) {
    const existingUserId = await User.findOne({ userId });
    if (existingUserId) {
      res.status(400).json({ message: "이미 사용 중인 닉네임입니다." });
      return;
    }
  }

  const user = await User.create({
    email,
    password,
    name,
    phone,
    role: role || "barista",
    provider: provider || "email",
    providerId: providerId || undefined,
    // 바리스타 확장 필드
    userId: userId || undefined,
    snsUrl1: snsUrl1 || undefined,
    snsUrl2: snsUrl2 || undefined,
    snsUrl3: snsUrl3 || undefined,
    storeName: storeName || undefined,
    storeAddress: storeAddress || undefined,
    workType: workType || undefined,
    careerYears: careerYears || undefined,
    mainSkill: Array.isArray(mainSkill) ? mainSkill : [],
    certifications: Array.isArray(certifications) ? certifications : [],
    awardRecords: awardRecords || undefined,
    eqMachine: eqMachine || undefined,
    eqGrinder: eqGrinder || undefined,
    eqRoasting: eqRoasting || undefined,
    bean: bean || undefined,
    beanTaste: Array.isArray(beanTaste) ? beanTaste : [],
  });

  const token = generateToken(user._id.toString());
  res.status(201).json({ token, user: formatUser(user) });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      res.status(400).json({ message: "이메일과 비밀번호를 입력해주세요." });
      return;
    }

    const user = await User.findOne({ email, provider: "email" });
    if (!user) {
      res
        .status(401)
        .json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res
        .status(401)
        .json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
      return;
    }

    const token = generateToken(user._id.toString());
    res.json({ token, user: formatUser(user) });
  } catch (err) {
    logger.error({ err }, "Login error");
    res.status(500).json({
      message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    });
  }
});

router.post("/social", async (req, res) => {
  try {
    const { provider, accessToken, name, email, profileImage } = req.body ?? {};

    if (!provider || !accessToken) {
      res.status(400).json({ message: "provider와 accessToken이 필요합니다." });
      return;
    }

    const providerId = `${provider}_${accessToken}`;

    let user = await User.findOne({ provider, providerId });

    if (!user) {
      res.status(202).json({
        message: "new_social_user",
        profile: {
          provider,
          providerId,
          name: name || `${provider} 사용자`,
          email: email || "",
          profileImage: profileImage || "",
        },
      });
      return;
    }

    const token = generateToken(user._id.toString());
    res.json({ token, user: formatUser(user) });
  } catch (err) {
    logger.error({ err }, "Social login error");
    res.status(500).json({
      message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    });
  }
});

router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    return;
  }
  res.json(formatUser(user));
});

export default router;
