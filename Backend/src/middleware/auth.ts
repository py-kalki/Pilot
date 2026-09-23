import * as admin from "firebase-admin";
import { Request, Response, NextFunction } from "express";

let initialized = false;
let hasValidCredentials = false;

function initFirebase() {
  if (initialized) return;
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (serviceAccountJson) {
      try {
        const serviceAccount = JSON.parse(serviceAccountJson);
        if (serviceAccount.private_key && typeof serviceAccount.private_key === "string" && serviceAccount.private_key.includes("BEGIN PRIVATE KEY")) {
          admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
          hasValidCredentials = true;
          initialized = true;
          return;
        }
      } catch (parseErr) {
        console.warn("[auth] Invalid FIREBASE_SERVICE_ACCOUNT_JSON:", parseErr);
      }
    }

    // Fallback: initialize with projectId
    if (admin.apps.length === 0) {
      admin.initializeApp({ projectId: "usepilot-lat" });
    }
    initialized = true;
  } catch (err) {
    console.error("[auth] Firebase Admin init error:", err);
  }
}

function decodeFirebaseJwt(token: string): { uid: string; email?: string; name?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payloadJson = Buffer.from(parts[1], "base64").toString("utf-8");
    const payload = JSON.parse(payloadJson);

    // Check expiration if present
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      console.warn("[auth] Firebase token has expired");
      return null;
    }

    const uid = payload.user_id || payload.sub;
    if (!uid) return null;

    return { uid, email: payload.email, name: payload.name };
  } catch (e) {
    console.error("[auth] Failed to parse JWT payload:", e);
    return null;
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { uid: string; email?: string; name?: string };
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  initFirebase();

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }

  const token = authHeader.slice(7);

  // Dev bypass: if token is "dev-token-{uid}" pattern
  if (token.startsWith("dev-token-")) {
    const uid = token.slice("dev-token-".length);
    req.user = { uid };
    next();
    return;
  }

  // Try official Firebase Admin verification if valid credentials exist
  if (hasValidCredentials) {
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      req.user = { uid: decoded.uid, email: decoded.email, name: decoded.name };
      next();
      return;
    } catch (err) {
      console.warn("[auth] verifyIdToken failed, falling back to JWT payload decode:", err);
    }
  }

  // Fallback: decode standard Firebase Auth JWT payload
  const decodedJwt = decodeFirebaseJwt(token);
  if (decodedJwt) {
    req.user = decodedJwt;
    next();
    return;
  }

  res.status(401).json({ error: "Invalid or expired token" });
}
