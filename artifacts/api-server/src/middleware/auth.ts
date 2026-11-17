import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "인증이 필요합니다.", code: "UNAUTHORIZED" });
    return;
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env["JWT_SECRET"];
  if (!secret) {
    res.status(500).json({ message: "서버 오류", code: "SERVER_ERROR" });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: "유효하지 않은 토큰입니다.", code: "INVALID_TOKEN" });
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const secret = process.env["JWT_SECRET"];
    if (secret) {
      try {
        const decoded = jwt.verify(token, secret) as { userId: string };
        req.userId = decoded.userId;
      } catch {
      }
    }
  }
  next();
}
